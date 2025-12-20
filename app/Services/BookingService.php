<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Teacher;
use App\Models\User;
use App\Jobs\ProcessBookingPaymentJob;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    /**
     * Create a new booking
     */
    public function createBooking(User $student, Teacher $teacher, array $data, bool $processPayment = true)
    {
        return DB::transaction(function () use ($student, $teacher, $data, $processPayment) {
            // 0. Reuse: Check if THIS user already has a pending booking for THIS slot
            // If so, we reuse it instead of blocking ourselves.
            $existingBooking = Booking::where('teacher_id', $teacher->id)
                ->where('user_id', $student->id)
                ->where('start_time', $data['start_time'])
                ->where('status', 'pending')
                ->first();

            if ($existingBooking) {
                // Determine duration for price recalc (in case duration changed?)
                $durationHours = Carbon::parse($data['start_time'])->diffInMinutes(Carbon::parse($data['end_time'])) / 60;
                $totalPrice = $teacher->hourly_rate * $durationHours;

                $existingBooking->update([
                    'subject_id' => $data['subject_id'],
                    'end_time' => $data['end_time'],
                    'total_price' => $totalPrice, 
                    'commission_rate' => config('services.payout.platform_commission_percentage', 15),
                ]);

                // Dispatch Payment Job if requested
                if ($processPayment) {
                    ProcessBookingPaymentJob::dispatchSync($existingBooking);
                }

                return $existingBooking;
            }

            // 1. Validate Availability (Double Check)
            if (!$this->isSlotAvailable($teacher, $data['start_time'], $data['end_time'])) {
                // For offers, we might checking against the teacher's own calendar differently, 
                // but generally they shouldn't double book themselves.
                throw new Exception("This time slot is no longer available.");
            }

            // 2. Calculate Price based on duration
            $durationHours = Carbon::parse($data['start_time'])->diffInMinutes(Carbon::parse($data['end_time'])) / 60;
            $totalPrice = $teacher->hourly_rate * $durationHours;

            // 3. Create Booking Record
            $booking = Booking::create([
                'teacher_id' => $teacher->id,
                'user_id' => $student->id,
                'subject_id' => $data['subject_id'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'status' => 'pending', // Pending until payment
                'total_price' => $totalPrice,
                'total_price' => $totalPrice,
                'currency' => $teacher->preferred_currency ?? 'USD',
                'commission_rate' => config('services.payout.platform_commission_percentage', 10), // Fetch from settings in real app
                'parent_booking_id' => $data['parent_booking_id'] ?? null,
            ]);

            // 4. Dispatch Payment Job only if requested (Student flow)
            if ($processPayment) {
                ProcessBookingPaymentJob::dispatchSync($booking);
            }

            return $booking;
        });
    }

    /**
     * Create a private offer for a student (e.g. Subscription/Recurring)
     * Does NOT charge wallet immediately. Sits as 'pending' for student validation.
     */
    public function createTeacherOffer(Teacher $teacher, User $student, array $data)
    {
        // Reuse createBooking but skip automatic payment processing
        $booking = $this->createBooking($student, $teacher, $data, false);
        
        // Dispatch Notification
        $student->notify(new \App\Notifications\NewClassOfferNotification($booking));
        
        return $booking;
    }

    /**
     * Check if a slot is available
     * @param int|null $excludeBookingId Booking ID to exclude from conflict check (for reschedule)
     */
    public function isSlotAvailable(Teacher $teacher, $start, $end, ?int $excludeBookingId = null)
    {
        $query = Booking::where('teacher_id', $teacher->id)
            ->where('status', '!=', 'cancelled');

        // Exclude specific booking (for reschedule scenarios)
        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return !$query->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_time', [$start, $end])
                  ->orWhereBetween('end_time', [$start, $end])
                  ->orWhere(function ($subQ) use ($start, $end) {
                      $subQ->where('start_time', '<=', $start)
                           ->where('end_time', '>=', $end);
                  });
            })
            ->exists();
    }

    /**
     * Rebook a previous session
     * Effectively clones the previous booking details for a new time slot.
     */
    public function rebookLastSession(Booking $previousBooking, $newStartTime)
    {
        $durationMinutes = $previousBooking->start_time->diffInMinutes($previousBooking->end_time);
        $newEndTime = Carbon::parse($newStartTime)->addMinutes($durationMinutes);

        // Reuse createBooking logic to ensure validation and payments pass
        return $this->createBooking(
            $previousBooking->student,
            $previousBooking->teacher,
            [
                'subject_id' => $previousBooking->subject_id,
                'start_time' => $newStartTime,
                'end_time' => $newEndTime
            ]
        );
    }
    /**
     * Create a recurring series of bookings
     * @param string $recurrenceType 'weekly' or 'monthly'
     * @param int $occurrences Number of total sessions (including the first one)
     */
    public function createRecurringSeries(User $student, Teacher $teacher, array $data, $recurrenceType = 'weekly', $occurrences = 4)
    {
        return DB::transaction(function () use ($student, $teacher, $data, $recurrenceType, $occurrences) {
            $bookings = collect();
            
            // 1. Create the first (parent) booking
            $parentBooking = $this->createBooking($student, $teacher, $data);
            $bookings->push($parentBooking);
            
            // 2. Loop for subsequent bookings
            $currentStart = Carbon::parse($data['start_time']);
            $currentEnd = Carbon::parse($data['end_time']);
            
            for ($i = 1; $i < $occurrences; $i++) {
                if ($recurrenceType === 'weekly') {
                    $currentStart->addWeek();
                    $currentEnd->addWeek();
                } elseif ($recurrenceType === 'monthly') {
                    $currentStart->addMonth();
                    $currentEnd->addMonth();
                }

                // Check Availability for this future slot
                if (!$this->isSlotAvailable($teacher, $currentStart, $currentEnd)) {
                    // For enterprise, we might skip or prompt. For now, strict atomic failure.
                    throw new Exception("Recurring slot unavailable on " . $currentStart->toFormattedDateString());
                }

                $childData = $data;
                $childData['start_time'] = $currentStart->toDateTimeString();
                $childData['end_time'] = $currentEnd->toDateTimeString();
                $childData['parent_booking_id'] = $parentBooking->id;

                // Create child booking (auto-process payment if needed, likely grouped invoice in future)
                $childBooking = $this->createBooking($student, $teacher, $childData, true); // Assuming immediate payment for now
                $bookings->push($childBooking);
            }

            return $bookings;
        });
    }
}
