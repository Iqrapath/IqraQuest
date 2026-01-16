<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Subject;
use App\Models\Transaction;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\BookingRejectedNotification;
use App\Notifications\RescheduleApprovedNotification;
use App\Notifications\RescheduleRejectedNotification;
use App\Services\BookingStatusService;
use App\Services\EscrowService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    protected $walletService;
    protected $escrowService;
    protected $bookingStatusService;

    public function __construct(WalletService $walletService, EscrowService $escrowService, BookingStatusService $bookingStatusService)
    {
        $this->walletService = $walletService;
        $this->escrowService = $escrowService;
        $this->bookingStatusService = $bookingStatusService;
    }

    public function index()
    {
        $teacher = Auth::user()->teacher;

        $requests = Booking::where('teacher_id', $teacher->id)
            ->whereIn('status', ['awaiting_approval', 'rescheduling'])
            ->with(['student', 'subject', 'rescheduleRequests' => function($query) {
                $query->where('status', 'pending')->latest();
            }])
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function ($booking) {
                $reschedule = $booking->status === 'rescheduling' ? $booking->rescheduleRequests->first() : null;
                
                return [
                    'id' => $booking->id,
                    'status' => $booking->status,
                    'parent_booking_id' => $booking->parent_booking_id,
                    'student' => [
                        'name' => $booking->student->name,
                        'avatar' => $booking->student->avatar,
                        'level' => 'Intermediate',
                    ],
                    'subject' => [
                        'name' => $booking->subject->name,
                    ],
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'total_price' => $booking->total_price,
                    'currency' => $booking->currency,
                    'days_requested' => $booking->start_time->format('l, M j'),
                    'time_range' => $booking->start_time->format('h:i A') . ' - ' . $booking->end_time->format('h:i A'),
                    // Reschedule specific data
                    'is_reschedule' => $booking->status === 'rescheduling',
                    'reschedule_id' => $reschedule?->id,
                    'new_start_time' => $reschedule?->new_start_time,
                    'new_end_time' => $reschedule?->new_end_time,
                    'reschedule_reason' => $reschedule?->reason,
                    'new_days_requested' => $reschedule?->new_start_time?->format('l, M j'),
                    'new_time_range' => $reschedule ? ($reschedule->new_start_time->format('h:i A') . ' - ' . $reschedule->new_end_time->format('h:i A')) : null,
                ];
            });

        $subjects = Subject::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Teacher/Requests/Index', [
            'requests' => $requests,
            'subjects' => $subjects
        ]);
    }

    /**
     * Display teacher's bookings (My Bookings page)
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

        return Inertia::render('Teacher/Bookings/Index', [
            'bookings' => $formattedBookings,
            'counts' => $counts,
            'currentStatus' => $status,
            'filters' => [
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function accept(Booking $booking)
    {
        // Security check
        if ($booking->teacher_id !== Auth::user()->teacher->id) {
            abort(403);
        }

        if ($booking->status !== 'awaiting_approval') {
            return back()->with('error', 'This booking is no longer pending approval.');
        }

        $booking->update(['status' => 'confirmed']);

        // Notify Student (Reuse existing Confirmation Notification)
        $booking->student->notify(new BookingConfirmedNotification($booking));

        return back()->with('success', 'Booking confirmed successfully.');
    }

    public function bulkAccept(Request $request)
    {
        $request->validate([
            'booking_ids' => 'required|array',
            'booking_ids.*' => 'exists:bookings,id'
        ]);

        $teacherId = Auth::user()->teacher->id;
        $bookings = Booking::whereIn('id', $request->booking_ids)
            ->where('teacher_id', $teacherId)
            ->where('status', 'awaiting_approval')
            ->get();

        if ($bookings->isEmpty()) {
            return back()->with('error', 'No valid pending bookings found to accept.');
        }

        DB::transaction(function () use ($bookings) {
            foreach ($bookings as $booking) {
                $booking->update(['status' => 'confirmed']);
                $booking->student->notify(new BookingConfirmedNotification($booking));
            }
        });

        return back()->with('success', count($bookings) . ' bookings confirmed successfully.');
    }

    public function reject(Booking $booking)
    {
        // Security check
        if ($booking->teacher_id !== Auth::user()->teacher->id) {
            abort(403);
        }

        if ($booking->status !== 'awaiting_approval') {
            return back()->with('error', 'This booking is no longer pending approval.');
        }

        DB::transaction(function () use ($booking) {
            // 1. Update Status
            $booking->update(['status' => 'cancelled', 'cancellation_reason' => 'Teacher declined']);

            // 2. Refund Student via Escrow Service
            $this->escrowService->refundFunds($booking, null, 'Teacher declined the booking request');

            // 3. Notify Student
            $booking->student->notify(new BookingRejectedNotification($booking));
        });

        return back()->with('success', 'Booking declined and refund processed.');
    }

    public function bulkReject(Request $request)
    {
        $request->validate([
            'booking_ids' => 'required|array',
            'booking_ids.*' => 'exists:bookings,id',
            'reason' => 'nullable|string|max:500'
        ]);

        $teacherId = Auth::user()->teacher->id;
        $bookings = Booking::whereIn('id', $request->booking_ids)
            ->where('teacher_id', $teacherId)
            ->where('status', 'awaiting_approval')
            ->get();

        if ($bookings->isEmpty()) {
            return back()->with('error', 'No valid pending bookings found to decline.');
        }

        $reason = $request->reason ?? 'Teacher declined';

        DB::transaction(function () use ($bookings, $reason) {
            foreach ($bookings as $booking) {
                $booking->update(['status' => 'cancelled', 'cancellation_reason' => $reason]);
                $this->escrowService->refundFunds($booking, null, $reason);
                $booking->student->notify(new BookingRejectedNotification($booking));
            }
        });

        return back()->with('success', count($bookings) . ' bookings declined and refunds processed.');
    }

    public function acceptReschedule(Booking $booking)
    {
        // Security check
        if ($booking->teacher_id !== Auth::user()->teacher->id) {
            abort(403);
        }

        if ($booking->status !== 'rescheduling') {
            return back()->with('error', 'This booking is not in rescheduling status.');
        }

        $rescheduleRequest = $booking->rescheduleRequests()->where('status', 'pending')->latest()->first();
        if (!$rescheduleRequest) {
            return back()->with('error', 'No pending reschedule request found.');
        }

        DB::transaction(function () use ($booking, $rescheduleRequest) {
            // 1. Update Booking
            $booking->update([
                'start_time' => $rescheduleRequest->new_start_time,
                'end_time' => $rescheduleRequest->new_end_time,
                'status' => 'confirmed'
            ]);

            // 2. Update Reschedule Request
            $rescheduleRequest->update(['status' => 'approved']);

            // 3. Notify Student
            $booking->student->notify(new RescheduleApprovedNotification($rescheduleRequest));
        });

        return back()->with('success', 'Reschedule request accepted.');
    }

    public function rejectReschedule(Booking $booking)
    {
        // Security check
        if ($booking->teacher_id !== Auth::user()->teacher->id) {
            abort(403);
        }

        if ($booking->status !== 'rescheduling') {
            return back()->with('error', 'This booking is not in rescheduling status.');
        }

        $rescheduleRequest = $booking->rescheduleRequests()->where('status', 'pending')->latest()->first();
        if (!$rescheduleRequest) {
            return back()->with('error', 'No pending reschedule request found.');
        }

        DB::transaction(function () use ($booking, $rescheduleRequest) {
            // 1. Update Booking (back to confirmed)
            $booking->update(['status' => 'confirmed']);

            // 2. Update Reschedule Request
            $rescheduleRequest->update(['status' => 'rejected']);

            // 3. Notify Student
            $booking->student->notify(new RescheduleRejectedNotification($rescheduleRequest));
        });

        return back()->with('success', 'Reschedule request declined.');
    }

    /**
     * Get cancellation details for a teacher
     */
    public function getCancellationDetails(Booking $booking)
    {
        if ($booking->teacher_id !== Auth::user()->teacher->id) {
            abort(403);
        }

        // For teachers, cancellation is usually simpler - full refund to student
        // But we check if it can be cancelled
        $allowed = true;
        $reason = null;

        if ($booking->status === 'cancelled') {
            $allowed = false;
            $reason = 'This booking is already cancelled.';
        } elseif ($booking->status === 'completed' || ($booking->status === 'confirmed' && $booking->end_time->isPast())) {
            $allowed = false;
            $reason = 'Completed sessions cannot be cancelled.';
        }

        return response()->json([
            'can_cancel' => $allowed,
            'reason' => $reason,
            'refund_percentage' => 100,
            'refund_amount' => $booking->total_price,
            'cancellation_fee' => 0,
            'total_price' => $booking->total_price,
            'currency' => $booking->currency,
            'hours_until_session' => now()->diffInHours($booking->start_time, false),
            'policy_tier' => 'teacher_cancellation',
            'is_recurring' => $booking->parent_booking_id !== null || $booking->childBookings()->exists(),
            'child_bookings_count' => $booking->childBookings()->where('status', '!=', 'cancelled')->count(),
        ]);
    }

    /**
     * Cancel a booking by teacher
     */
    public function cancel(Request $request, Booking $booking)
    {
        if ($booking->teacher_id !== Auth::user()->teacher->id) {
            abort(403);
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        DB::transaction(function () use ($booking, $request) {
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason ?? 'Cancelled by teacher'
            ]);

            // Refund student
            $this->escrowService->refundFunds($booking, null, 'Teacher cancelled the session');

            // Notify student
            // Use existing or new notification
             $booking->student->notify(new \App\Notifications\BookingRejectedNotification($booking));
        });

        return back()->with('success', 'Booking cancelled successfully.');
    }
}
