<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\RescheduleRequest;
use App\Notifications\RescheduleRequestedNotification;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RescheduleController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Show the reschedule page (reuses booking UI)
     */
    public function index(Booking $booking)
    {
        $user = Auth::user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        // Check if booking can be rescheduled
        if (!$booking->canBeRescheduled()) {
            return back()->with('error', 'This booking cannot be rescheduled.');
        }

        $teacher = $booking->teacher;
        $teacher->load(['user', 'subjects', 'availability']);

        // Get teacher's rating
        $teacherRating = \App\Models\Review::where('teacher_id', $teacher->id)
            ->where('is_approved', true)
            ->avg('rating') ?? 0;

        $totalReviews = \App\Models\Review::where('teacher_id', $teacher->id)
            ->where('is_approved', true)
            ->count();

        // Fetch existing bookings to prevent double booking (exclude current booking)
        $bookedSlots = Booking::where('teacher_id', $teacher->id)
            ->active()
            ->where('id', '!=', $booking->id) // Exclude current booking
            ->where('end_time', '>', now())
            ->get(['start_time', 'end_time'])
            ->map(function ($b) {
                return [
                    'start' => $b->start_time->toIso8601String(),
                    'end' => $b->end_time->toIso8601String(),
                ];
            });

        // Determine which page to render based on user role
        $page = $user->isGuardian() ? 'Guardian/Booking/Reschedule' : 'Student/Booking/Reschedule';

        return Inertia::render($page, [
            'booking' => [
                'id' => $booking->id,
                'subject' => [
                    'id' => $booking->subject->id,
                    'name' => $booking->subject->name,
                ],
                'current_start_time' => $booking->start_time->toIso8601String(),
                'current_end_time' => $booking->end_time->toIso8601String(),
                'formatted_date' => $booking->start_time->format('jS F Y'),
                'formatted_time' => $booking->start_time->format('g:i A') . ' - ' . $booking->end_time->format('g:i A'),
                'duration_minutes' => $booking->start_time->diffInMinutes($booking->end_time),
            ],
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
                'average_rating' => round($teacherRating, 1),
                'total_reviews' => $totalReviews,
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
        ]);
    }

    /**
     * Submit a reschedule request
     */
    public function store(Request $request, Booking $booking)
    {
        $user = Auth::user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        // Check if booking can be rescheduled
        if (!$booking->canBeRescheduled()) {
            return back()->withErrors(['error' => 'This booking cannot be rescheduled.']);
        }

        $request->validate([
            'new_start_time' => 'required|date|after:' . now()->subMinutes(10)->toDateTimeString(),
            'reason' => 'nullable|string|max:500',
        ]);

        $newStartTime = Carbon::parse($request->new_start_time);
        $duration = $booking->start_time->diffInMinutes($booking->end_time);
        $newEndTime = $newStartTime->copy()->addMinutes($duration);

        // Check if the new slot is available
        $isAvailable = $this->bookingService->isSlotAvailable(
            $booking->teacher,
            $newStartTime,
            $newEndTime,
            $booking->id // Exclude current booking from conflict check
        );

        if (!$isAvailable) {
            return back()->withErrors(['error' => 'The selected time slot is not available.']);
        }

        // Check if there's already a pending reschedule request
        $existingRequest = RescheduleRequest::where('booking_id', $booking->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return back()->withErrors(['error' => 'There is already a pending reschedule request for this booking.']);
        }

        DB::transaction(function () use ($booking, $user, $newStartTime, $newEndTime, $request) {
            // Create reschedule request
            $rescheduleRequest = RescheduleRequest::create([
                'booking_id' => $booking->id,
                'requested_by' => $user->id,
                'original_start_time' => $booking->start_time,
                'new_start_time' => $newStartTime,
                'new_end_time' => $newEndTime,
                'reason' => $request->reason,
                'status' => 'pending',
                'expires_at' => now()->addHours(48), // Teacher has 48 hours to respond
            ]);

            // Update booking status to rescheduling
            $booking->update(['status' => 'rescheduling']);

            // Notify teacher
            try {
                $booking->teacher->user->notify(new RescheduleRequestedNotification($rescheduleRequest));
            } catch (\Exception $e) {
                \Log::error("Failed to send reschedule notification: " . $e->getMessage());
            }
        });

        $redirectPath = $user->isGuardian() ? '/guardian/bookings' : '/student/bookings';
        return redirect($redirectPath)->with('success', 'Reschedule request submitted. Waiting for teacher approval.');
    }

    /**
     * Check availability for reschedule
     */
    public function checkAvailability(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->user_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'start_time' => 'required|date',
        ]);

        $newStartTime = Carbon::parse($request->start_time);
        $duration = $booking->start_time->diffInMinutes($booking->end_time);
        $newEndTime = $newStartTime->copy()->addMinutes($duration);

        $available = $this->bookingService->isSlotAvailable(
            $booking->teacher,
            $newStartTime,
            $newEndTime,
            $booking->id // Exclude current booking
        );

        return response()->json(['available' => $available]);
    }

    /**
     * Cancel a pending reschedule request
     */
    public function cancelRequest(RescheduleRequest $rescheduleRequest)
    {
        $user = Auth::user();

        // Verify ownership through booking
        if ($rescheduleRequest->booking->user_id !== $user->id) {
            abort(403);
        }

        if ($rescheduleRequest->status !== 'pending') {
            return back()->withErrors(['error' => 'This reschedule request cannot be cancelled.']);
        }

        DB::transaction(function () use ($rescheduleRequest) {
            $rescheduleRequest->update(['status' => 'cancelled']);
            
            // Restore booking status to confirmed
            $rescheduleRequest->booking->update(['status' => 'confirmed']);
        });

        return back()->with('success', 'Reschedule request cancelled.');
    }

}
