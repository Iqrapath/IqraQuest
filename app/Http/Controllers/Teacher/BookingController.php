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

    public function __construct(WalletService $walletService, EscrowService $escrowService)
    {
        $this->walletService = $walletService;
        $this->escrowService = $escrowService;
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
}
