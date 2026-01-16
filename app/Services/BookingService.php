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
            $startTime = Carbon::parse($data['start_time']);
            $endTime = Carbon::parse($data['end_time']);

            // 0. Smart Reuse/Deduplicate: Check if THIS user already has an active booking for EXACTLY this slot
            // We ONLY reuse/update if the existing booking is still PENDING. 
            // If it's confirmed or awaiting approval, we let the conflict logic catch it later.
            $existingBooking = Booking::where('teacher_id', $teacher->id)
                ->where('user_id', $student->id)
                ->where('start_time', $startTime)
                ->where('status', 'pending') 
                ->first();

            if ($existingBooking) {
                $durationHours = $startTime->diffInMinutes($endTime) / 60;
                $totalPrice = $teacher->hourly_rate * $durationHours;

                $existingBooking->update([
                    'subject_id' => $data['subject_id'],
                    'end_time' => $endTime,
                    'total_price' => $totalPrice, 
                    'currency' => $data['currency'] ?? ($teacher->preferred_currency ?? 'USD'),
                    'notes' => $data['notes'] ?? $existingBooking->notes,
                ]);

                if ($processPayment) {
                    ProcessBookingPaymentJob::dispatchSync($existingBooking);
                }

                return $existingBooking;
            }

            // 1. Validate Availability (Double Check)
            if (!$this->isSlotAvailable($teacher, $startTime, $endTime)) {
                // For offers, we might checking against the teacher's own calendar differently, 
                // but generally they shouldn't double book themselves.
                throw new Exception("This time slot is no longer available.");
            }

            // 2. Calculate Price based on duration
            $durationHours = $startTime->diffInMinutes($endTime) / 60;
            $totalPrice = $teacher->hourly_rate * $durationHours;

            // 3. Create Booking Record
            $booking = Booking::create([
                'teacher_id' => $teacher->id,
                'user_id' => $student->id,
                'subject_id' => $data['subject_id'],
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => 'pending', // Pending until payment
                'total_price' => $totalPrice,
                'currency' => $data['currency'] ?? ($teacher->preferred_currency ?? 'USD'),
                'commission_rate' => config('services.payout.platform_commission_percentage', 10), // Fetch from settings in real app
                'parent_booking_id' => $data['parent_booking_id'] ?? null,
                'notes' => $data['notes'] ?? null,
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
     * Uses Standard Overlap Algorithm: (StartA < EndB) AND (EndA > StartB)
     */
    public function isSlotAvailable(Teacher $teacher, $start, $end, ?int $excludeBookingId = null)
    {
        $start = Carbon::parse($start);
        $end = Carbon::parse($end);

        $query = Booking::where('teacher_id', $teacher->id)
            ->whereIn('status', ['pending', 'confirmed', 'awaiting_approval', 'rescheduling', 'awaiting_payment']);

        // Exclude specific booking (for reschedule scenarios)
        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        $hasConflict = $query->where(function ($q) use ($start, $end) {
            $q->where('start_time', '<', $end)
              ->where('end_time', '>', $start);
        })->exists();

        if ($hasConflict) {
            \Illuminate\Support\Facades\Log::info("isSlotAvailable CONFLICT: Request Start: $start, End: $end");
            // Re-run to get the conflicting booking (just for logging)
            $conflicting = Booking::where('teacher_id', $teacher->id)
                ->whereIn('status', ['pending', 'confirmed', 'awaiting_approval', 'rescheduling', 'awaiting_payment'])
                ->where(function ($q) use ($start, $end) {
                    $q->where('start_time', '<', $end)
                      ->where('end_time', '>', $start);
                })->first();
            if ($conflicting) {
                \Illuminate\Support\Facades\Log::info("Conflicting Booking ID: " . $conflicting->id . " Start: " . $conflicting->start_time . " End: " . $conflicting->end_time);
            }
        }

        return !$hasConflict;
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
    public function createRecurringSeries(User $student, Teacher $teacher, array $data, $recurrenceType = 'weekly', $occurrences = 4, bool $processPayment = true)
    {
        return DB::transaction(function () use ($student, $teacher, $data, $recurrenceType, $occurrences, $processPayment) {
            $bookings = collect();
            
            // 1. Create the first (parent) booking
            $parentBooking = $this->createBooking($student, $teacher, $data, $processPayment);
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

                $childData = $data;
                $childData['start_time'] = $currentStart->toDateTimeString();
                $childData['end_time'] = $currentEnd->toDateTimeString();
                $childData['parent_booking_id'] = $parentBooking->id;

                try {
                    // Create child booking. createBooking now handles reuse if the user 
                    // manually picked a date that our recurrence also covers.
                    $childBooking = $this->createBooking($student, $teacher, $childData, $processPayment);
                    $bookings->push($childBooking);
                } catch (Exception $e) {
                    \Illuminate\Support\Facades\Log::info("Error creating recurring child at $currentStart. Error: " . $e->getMessage());
                    
                    if ($e->getMessage() === "This time slot is no longer available.") {
                         throw new Exception("Recurring slot unavailable on " . $currentStart->toFormattedDateString());
                    }

                    throw $e; // Re-throw other errors (e.g. Mail/System)
                }
            }

            return $bookings;
        });
    }

    /**
     * Create a batch of bookings, potentially each with its own recurring series.
     */
    public function createBatchBookings(User $student, Teacher $teacher, array $sessions, bool $isRecurring = false, int $occurrences = 1, int $subjectId, ?string $notes = null, ?string $currency = 'USD')
    {
        return DB::transaction(function () use ($student, $teacher, $sessions, $isRecurring, $occurrences, $subjectId, $notes, $currency) {
            $allBookings = collect();
            $walletService = app(WalletService::class);

            // 1. Calculate Total Estimated Price for all sessions
            $totalSessionsCount = count($sessions) * ($isRecurring ? $occurrences : 1);
            
            // Get duration from first session to estimate price
            $firstSession = $sessions[0];
            $durationMinutes = Carbon::parse($firstSession['start_time'])->diffInMinutes(Carbon::parse($firstSession['end_time']));
            $pricePerSession = ($teacher->hourly_rate / 60) * $durationMinutes;
            $batchTotalPrice = $pricePerSession * $totalSessionsCount;

            // 2. Check if the wallet can cover the ENTIRE batch
            $canPayFull = $walletService->canDebit($student->id, $batchTotalPrice);

            foreach ($sessions as $session) {
                $startTime = Carbon::parse($session['start_time']);
                $endTime = Carbon::parse($session['end_time']);

                $data = [
                    'subject_id' => $subjectId,
                    'start_time' => $startTime->toDateTimeString(),
                    'end_time' => $endTime->toDateTimeString(),
                    'notes' => $notes,
                    'currency' => $currency,
                ];

                if ($isRecurring && $occurrences > 1) {
                    $series = $this->createRecurringSeries($student, $teacher, $data, 'weekly', $occurrences, $canPayFull);
                    $allBookings = $allBookings->concat($series);
                } else {
                    $booking = $this->createBooking($student, $teacher, $data, $canPayFull);
                    $allBookings->push($booking);
                }
            }

            // 3. If we couldn't pay full, all bookings are currently 'pending' (ProcessBookingPaymentJob was skipped)
            // We need to mark them all as 'awaiting_payment' so they show up in the wallet.
            if (!$canPayFull) {
                foreach ($allBookings as $b) {
                    $b->update(['status' => 'awaiting_payment']);
                }
            }

            return $allBookings;
        });
    }
}
