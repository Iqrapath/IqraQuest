<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Booking;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Show the booking page for a teacher
     */
    public function index(Request $request, $teacherId)
    {
        $teacher = Teacher::with(['user', 'subjects', 'availability'])
            ->withCount(['reviews as total_reviews' => function ($query) {
                $query->where('is_approved', true);
            }])
            ->withAvg(['reviews as average_rating' => function ($query) {
                $query->where('is_approved', true);
            }], 'rating')
            ->findOrFail($teacherId);

        // Fetch existing bookings to prevent double booking
        $bookedSlots = Booking::where('teacher_id', $teacherId)
            ->active()
            ->where('end_time', '>', now())
            ->get(['start_time', 'end_time'])
            ->map(function ($booking) {
                return [
                    'start' => $booking->start_time->toIso8601String(),
                    'end' => $booking->end_time->toIso8601String(),
                ];
            });

        // Handle rebook pre-fill data
        $rebookData = null;
        if ($request->has('rebook_from')) {
            $previousBooking = Booking::where('id', $request->rebook_from)
                ->where('user_id', $request->user()->id)
                ->first();
            
            if ($previousBooking) {
                $rebookData = [
                    'subject_id' => $previousBooking->subject_id,
                    'duration' => $previousBooking->start_time->diffInMinutes($previousBooking->end_time),
                ];
            }
        }

        // Also accept direct query params (fallback)
        if (!$rebookData && ($request->has('subject_id') || $request->has('duration'))) {
            $rebookData = [
                'subject_id' => $request->integer('subject_id'),
                'duration' => $request->integer('duration', 60),
            ];
        }

        return Inertia::render('Guardian/Booking/Index', [
            'teacher' => [
                'id' => $teacher->id,
                'user' => [
                    'name' => $teacher->user->name,
                    'avatar' => $teacher->user->avatar,
                ],
                'city' => $teacher->city,
                'subjects' => $teacher->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ];
                }),
                'hourly_rate' => $teacher->hourly_rate,
                'average_rating' => (float) $teacher->average_rating ?: 0.0,
                'total_reviews' => $teacher->total_reviews,
                'availability_schedule' => $teacher->availability->map(function ($slot) {
                    return [
                        'day_of_week' => $slot->day_of_week,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'is_available' => (bool) $slot->is_available,
                    ];
                }),
            ],
            'booked_slots' => $bookedSlots,
            'rebook_data' => $rebookData,
        ]);
    }

    /**
     * Check if a time slot is available
     */
    public function checkAvailability(Request $request, BookingService $bookingService)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'start_time' => 'required|date',
            'duration' => 'required|integer',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);
        $start = Carbon::parse($request->start_time);
        $end = $start->copy()->addMinutes($request->duration);

        // Check if I (the current user) already have a pending booking for this slot
        $myPending = Booking::where('teacher_id', $teacher->id)
            ->where('user_id', $request->user()->id)
            ->where('start_time', $start)
            ->where('status', 'pending')
            ->exists();

        if ($myPending) {
            return response()->json(['available' => true]);
        }

        $available = $bookingService->isSlotAvailable($teacher, $start, $end);

        return response()->json(['available' => $available]);
    }

    /**
     * Process and create a booking
     */
    public function store(Request $request, BookingService $bookingService)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'sessions' => 'required|array|min:1',
            'sessions.*.start_time' => 'required|date|after:' . now()->subMinutes(10)->toDateTimeString(),
            'sessions.*.end_time' => 'required|date|after:sessions.*.start_time',
            'duration' => 'required|integer|in:30,45,60',
            'is_recurring' => 'boolean',
            'recurrence_occurrences' => 'nullable|integer|min:2|max:12',
            'notes' => 'nullable|string|max:1000',
            'currency' => 'required|string|in:USD,NGN',
        ]);

        $user = $request->user();
        if (!$user) abort(401);

        // $bookingService is already injected

        $teacher = Teacher::findOrFail($request->teacher_id);
        
        try {
            $bookings = $bookingService->createBatchBookings(
                $user, 
                $teacher, 
                $request->sessions, 
                $request->is_recurring ?? false, 
                $request->recurrence_occurrences ?? 1, 
                $request->subject_id,
                $request->notes,
                $request->currency
            );

            $firstBooking = $bookings->first();
            // Refresh to get the updated status (modified by ProcessBookingPaymentJob)
            if ($firstBooking) {
                $firstBooking->refresh();
            }
            $status = $firstBooking->status;
            
            $message = $status === 'awaiting_payment' 
                ? 'Booking saved! Please top up your wallet to complete the payment.'
                : 'Booking confirmed!';

            return back()->with([
                'success' => $message,
                'booking_status' => $status,
                'booking_id' => $firstBooking->id
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
