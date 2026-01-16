<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Booking;
use App\Models\Review;
use App\Services\BookingStatusService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    protected BookingStatusService $bookingStatusService;

    public function __construct(BookingStatusService $bookingStatusService)
    {
        $this->bookingStatusService = $bookingStatusService;
    }

    /**
     * Display user's bookings (My Bookings page)
     */
    public function myBookings(Request $request)
    {
        $user = $request->user();
        $status = $request->get('status', 'upcoming');
        $perPage = $request->get('per_page', 10);

        // Validate status
        $validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled', 'all'];
        if (!in_array($status, $validStatuses)) {
            $status = 'upcoming';
        }

        // Get bookings for the requested status
        $bookings = $this->bookingStatusService->getBookings($user, $status, $perPage);
        $bookings->appends($request->query());

        // Get counts for all tabs
        $counts = $this->bookingStatusService->getStatusCounts($user);

        // Format bookings for response
        $formattedBookings = $bookings->through(function ($booking) use ($user) {
            return $this->bookingStatusService->formatBookingForResponse($booking, $user);
        });

        // Determine which page to render based on user role
        $page = $user->isGuardian() ? 'Guardian/Bookings/Index' : 'Student/Bookings/Index';

        return Inertia::render($page, [
            'bookings' => $formattedBookings,
            'counts' => $counts,
            'currentStatus' => $status,
            'filters' => [
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Get booking details (JSON API)
     */
    public function show(Booking $booking)
    {
        $user = request()->user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        $booking->load(['teacher.user', 'student', 'subject', 'rescheduleRequests']);

        return response()->json([
            'booking' => $this->bookingStatusService->formatBookingForResponse($booking, $user),
            'reschedule_requests' => $booking->rescheduleRequests->map(fn($r) => [
                'id' => $r->id,
                'new_start_time' => $r->new_start_time->toIso8601String(),
                'new_end_time' => $r->new_end_time->toIso8601String(),
                'reason' => $r->reason,
                'status' => $r->status,
                'created_at' => $r->created_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Show booking details page
     */
    public function details(Booking $booking)
    {
        $user = request()->user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        $booking->load(['teacher.user', 'teacher.subjects', 'teacher.availability', 'student', 'subject']);

        // Get teacher's average rating
        $teacherRating = \App\Models\Review::where('teacher_id', $booking->teacher_id)
            ->where('is_approved', true)
            ->avg('rating') ?? 0;

        $totalReviews = \App\Models\Review::where('teacher_id', $booking->teacher_id)
            ->where('is_approved', true)
            ->count();

        // Get availability summary
        $availability = $booking->teacher->availability;
        $availableDays = $availability->where('is_available', true)->pluck('day_of_week')->unique();
        $availabilitySummary = '';
        if ($availableDays->count() > 0) {
            $firstDay = substr($availableDays->first(), 0, 3);
            $lastDay = substr($availableDays->last(), 0, 3);
            $startTime = $availability->first()?->start_time ?? '09:00';
            $endTime = $availability->first()?->end_time ?? '17:00';
            $availabilitySummary = "{$firstDay}-{$lastDay}, {$startTime}-{$endTime}";
        }

        // Determine which page to render based on user role
        $page = $user->isGuardian() ? 'Guardian/Bookings/Show' : 'Student/Bookings/Show';

        return Inertia::render($page, [
            'booking' => [
                'id' => $booking->id,
                'subject' => [
                    'id' => $booking->subject->id,
                    'name' => $booking->subject->name,
                    'image' => $booking->subject->image ?? null,
                ],
                'teacher' => [
                    'id' => $booking->teacher->id,
                    'name' => $booking->teacher->user->name,
                    'avatar' => $booking->teacher->user->avatar_url,
                    'specializations' => $booking->teacher->subjects->pluck('name')->toArray(),
                    'location' => $booking->teacher->city,
                    'rating' => round($teacherRating, 1),
                    'total_reviews' => $totalReviews,
                    'availability_summary' => $availabilitySummary,
                ],
                'student' => [
                    'id' => $booking->student->id,
                    'name' => $booking->student->name,
                ],
                'start_time' => $booking->start_time->toIso8601String(),
                'end_time' => $booking->end_time->toIso8601String(),
                'formatted_date' => $booking->start_time->format('jS F Y'),
                'formatted_time' => $booking->start_time->format('g:i A') . ' - ' . $booking->end_time->format('g:i A'),
                'duration_minutes' => $booking->start_time->diffInMinutes($booking->end_time),
                'status' => $booking->status,
                'display_status' => $this->bookingStatusService->getDisplayStatus($booking),
                'payment_status' => $booking->payment_status,
                'total_price' => (float) $booking->total_price,
                'currency' => $booking->currency,
                'can_cancel' => $booking->canBeCancelledByStudent(),
                'can_reschedule' => $booking->canBeRescheduled(),
                'meeting_link' => $booking->meeting_link,
                'meeting_platform' => 'iqraclass', // Default, can be dynamic later
                'notes' => null,
            ],
        ]);
    }

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

        return Inertia::render('Student/Booking/Index', [
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

    public function checkAvailability(Request $request, \App\Services\BookingService $bookingService)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'start_time' => 'required|date',
            'duration' => 'required|integer',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);
        $start = \Carbon\Carbon::parse($request->start_time);
        $end = $start->copy()->addMinutes($request->duration);

        // Check if I (the current user) already have a pending booking for this slot.
        // If so, it's "Available" for ME to resume.
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

    public function store(Request $request, \App\Services\BookingService $bookingService)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'sessions' => 'required|array|min:1',
            'sessions.*.start_time' => 'required|date|after:' . now()->subMinutes(10)->toDateTimeString(),
            'sessions.*.end_time' => 'required|date|after:sessions.*.start_time',
            'duration' => 'required|integer|in:30,45,60', // minutes
            'is_recurring' => 'boolean',
            'recurrence_occurrences' => 'nullable|integer|min:2|max:12', // Max 12 weeks
            'notes' => 'nullable|string|max:1000',
            'currency' => 'required|string|in:USD,NGN',
        ]);

        $user = $request->user();
        if (!$user) abort(401);

        $teacher = \App\Models\Teacher::findOrFail($request->teacher_id);
        
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

    public function payNow(Booking $booking)
    {
        $user = request()->user();
        
        if ($booking->user_id !== $user->id) {
            abort(403);
        }

        if ($booking->status !== 'awaiting_payment') {
            return back()->withErrors(['error' => 'This booking does not require payment at this time.']);
        }

        try {
            // Attempt to process payment again
            \App\Jobs\ProcessBookingPaymentJob::dispatchSync($booking);
            
            if ($booking->fresh()->status === 'awaiting_payment') {
                throw new \Exception("Insufficient wallet balance. Please top up and try again.");
            }

            return back()->with('success', 'Payment successful! Booking is now awaiting teacher approval.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Process payment for multiple bookings at once (e.g. a recurring series)
     */
    public function bulkPay(Request $request)
    {
        $request->validate([
            'booking_ids' => 'required|array|min:1',
            'booking_ids.*' => 'exists:bookings,id'
        ]);

        $user = $request->user();
        $bookingIds = $request->booking_ids;
        
        // Fetch all bookings and verify ownership/status
        $bookings = Booking::whereIn('id', $bookingIds)
            ->where('user_id', $user->id)
            ->where('status', 'awaiting_payment')
            ->get();

        if ($bookings->isEmpty()) {
            return back()->withErrors(['error' => 'No valid bookings found to pay.']);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($bookings) {
                foreach ($bookings as $booking) {
                    \App\Jobs\ProcessBookingPaymentJob::dispatchSync($booking);
                    
                    if ($booking->fresh()->status === 'awaiting_payment') {
                        throw new \Exception("Insufficient wallet balance to pay for all selected sessions. Please top up and try again.");
                    }
                }
            });

            return back()->with('success', 'Payment successful for ' . $bookings->count() . ' sessions!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Submit a review for a completed booking
     */
    public function submitReview(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        // Verify booking is completed (using same logic as BookingStatusService)
        if (!$this->bookingStatusService->isCompleted($booking)) {
            return back()->withErrors(['error' => 'You can only review completed sessions.']);
        }

        // Check if already reviewed (by booking_id)
        $existingReview = Review::where('user_id', $user->id)
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingReview) {
            return back()->withErrors(['error' => 'You have already reviewed this session.']);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        // Create the review
        Review::create([
            'teacher_id' => $booking->teacher_id,
            'user_id' => $user->id,
            'booking_id' => $booking->id,
            'rating' => $request->rating,
            'comment' => $request->feedback,
            'is_approved' => true, // Auto-approve or set to false for moderation
        ]);

        return back()->with('success', 'Thank you for your review!');
    }

    /**
     * Update an existing review for a booking
     */
    public function updateReview(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Verify ownership
        if ($booking->user_id !== $user->id) {
            abort(403, 'You do not have access to this booking.');
        }

        // Find existing review
        $review = Review::where('user_id', $user->id)
            ->where('booking_id', $booking->id)
            ->first();

        if (!$review) {
            return back()->withErrors(['error' => 'No review found to update.']);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        // Update the review
        $review->update([
            'rating' => $request->rating,
            'comment' => $request->feedback,
        ]);

        return back()->with('success', 'Review updated successfully!');
    }
}
