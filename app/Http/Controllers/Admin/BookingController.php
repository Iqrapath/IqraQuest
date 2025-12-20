<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\User;
use App\Notifications\TeacherReassignedNotification;
use App\Notifications\BookingApprovedNotification;
use App\Notifications\BookingCancelledByAdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display booking overview with filters
     */
    public function index(Request $request)
    {
        $query = Booking::with(['student', 'teacher.user', 'subject']);

        // Search by student name or email
        if ($search = $request->get('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            if ($status === 'upcoming') {
                $query->whereIn('status', ['confirmed', 'awaiting_approval', 'rescheduling'])
                      ->where('start_time', '>', now());
            } elseif ($status === 'completed') {
                $query->where('status', 'completed');
            } elseif ($status === 'missed') {
                $query->where('status', 'no_show');
            } elseif ($status === 'cancelled') {
                $query->where('status', 'cancelled');
            } elseif ($status === 'pending') {
                $query->where('status', 'pending');
            } elseif ($status === 'awaiting_approval') {
                $query->where('status', 'awaiting_approval');
            }
        }

        // Filter by teacher
        if ($teacherId = $request->get('teacher_id')) {
            $query->where('teacher_id', $teacherId);
        }

        // Filter by subject
        if ($subjectId = $request->get('subject_id')) {
            $query->where('subject_id', $subjectId);
        }

        // Filter by date range
        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('start_time', '>=', $dateFrom);
        }
        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('start_time', '<=', $dateTo);
        }

        // Sort by date (newest first by default)
        $query->orderBy('start_time', 'desc');

        $bookings = $query->paginate(15)->through(fn($booking) => [
            'id' => $booking->id,
            'student' => [
                'id' => $booking->student->id,
                'name' => $booking->student->name,
                'email' => $booking->student->email,
                'avatar' => $booking->student->avatar,
            ],
            'teacher' => [
                'id' => $booking->teacher->id,
                'name' => $booking->teacher->user->name,
                'avatar' => $booking->teacher->user->avatar,
            ],
            'subject' => [
                'id' => $booking->subject->id,
                'name' => $booking->subject->name,
            ],
            'formatted_date' => $booking->start_time->format('M j'),
            'formatted_time' => $booking->start_time->format('g:i A'),
            'start_time' => $booking->start_time->toIso8601String(),
            'end_time' => $booking->end_time->toIso8601String(),
            'status' => $booking->status,
            'display_status' => $this->getDisplayStatus($booking),
            'payment_status' => $booking->payment_status,
            'total_price' => (float) $booking->total_price,
            'currency' => $booking->currency,
        ]);

        // Get filter options
        $teachers = Teacher::with('user')
            ->where('status', 'approved')
            ->get()
            ->map(fn($t) => ['id' => $t->id, 'name' => $t->user->name]);

        $subjects = Subject::orderBy('name')->get(['id', 'name']);

        // Get counts for status tabs
        $counts = [
            'all' => Booking::count(),
            'upcoming' => Booking::whereIn('status', ['confirmed', 'awaiting_approval', 'rescheduling'])
                ->where('start_time', '>', now())->count(),
            'completed' => Booking::where('status', 'completed')->count(),
            'missed' => Booking::where('status', 'no_show')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
            'pending' => Booking::where('status', 'pending')->count(),
            'awaiting_approval' => Booking::where('status', 'awaiting_approval')->count(),
        ];

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'counts' => $counts,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'teacher_id' => $request->get('teacher_id', ''),
                'subject_id' => $request->get('subject_id', ''),
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
            ],
            'pageTitle' => 'Booking Management',
        ]);
    }

    /**
     * Show booking details
     */
    public function show(Booking $booking)
    {
        $booking->load(['student', 'teacher.user', 'subject', 'rescheduleRequests', 'review']);

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'student' => [
                    'id' => $booking->student->id,
                    'name' => $booking->student->name,
                    'email' => $booking->student->email,
                    'avatar' => $booking->student->avatar,
                    'phone' => $booking->student->phone,
                ],
                'teacher' => [
                    'id' => $booking->teacher->id,
                    'name' => $booking->teacher->user->name,
                    'email' => $booking->teacher->user->email,
                    'avatar' => $booking->teacher->user->avatar,
                ],
                'subject' => [
                    'id' => $booking->subject->id,
                    'name' => $booking->subject->name,
                ],
                'start_time' => $booking->start_time->toIso8601String(),
                'end_time' => $booking->end_time->toIso8601String(),
                'formatted_date' => $booking->start_time->format('jS F Y'),
                'formatted_time' => $booking->start_time->format('g:i A') . ' - ' . $booking->end_time->format('g:i A'),
                'duration_minutes' => $booking->start_time->diffInMinutes($booking->end_time),
                'status' => $booking->status,
                'display_status' => $this->getDisplayStatus($booking),
                'payment_status' => $booking->payment_status,
                'total_price' => (float) $booking->total_price,
                'currency' => $booking->currency,
                'commission_rate' => $booking->commission_rate,
                'teacher_earnings' => $booking->calculateTeacherEarnings(),
                'platform_commission' => $booking->calculatePlatformCommission(),
                'meeting_link' => $booking->meeting_link,
                'cancellation_reason' => $booking->cancellation_reason,
                'dispute_reason' => $booking->dispute_reason,
                'dispute_resolution' => $booking->dispute_resolution,
                'teacher_attended' => $booking->teacher_attended,
                'student_attended' => $booking->student_attended,
                'actual_duration_minutes' => $booking->actual_duration_minutes,
                'created_at' => $booking->created_at->format('jS F Y, g:i A'),
                'reschedule_requests' => $booking->rescheduleRequests->map(fn($r) => [
                    'id' => $r->id,
                    'new_start_time' => $r->new_start_time->format('jS F Y, g:i A'),
                    'new_end_time' => $r->new_end_time->format('g:i A'),
                    'reason' => $r->reason,
                    'status' => $r->status,
                    'created_at' => $r->created_at->format('jS F Y'),
                ]),
                'review' => $booking->review ? [
                    'rating' => $booking->review->rating,
                    'comment' => $booking->review->comment,
                    'created_at' => $booking->review->created_at->format('jS F Y'),
                ] : null,
            ],
        ]);
    }



    /**
     * Approve a pending or awaiting_approval booking
     */
    public function approve(Booking $booking)
    {
        if (!in_array($booking->status, ['pending', 'awaiting_approval'])) {
            return back()->with('error', 'Only pending or awaiting approval bookings can be approved.');
        }

        $booking->update(['status' => 'confirmed']);

        // Load relationships and send notifications to both parties
        $booking->load(['student', 'teacher.user', 'subject']);
        
        // Notify student
        $booking->student->notify(new BookingApprovedNotification($booking, 'student'));
        
        // Notify teacher
        $booking->teacher->user->notify(new BookingApprovedNotification($booking, 'teacher'));

        return back()->with('success', 'Booking approved successfully. Both parties have been notified.');
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, Booking $booking)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'This booking cannot be cancelled.');
        }

        // Load relationships before transaction
        $booking->load(['student', 'teacher.user', 'subject']);
        $reason = $request->reason;

        DB::transaction(function () use ($booking, $reason) {
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
            ]);

            // If funds were held, refund them
            if ($booking->payment_status === 'held') {
                $booking->update([
                    'payment_status' => 'refunded',
                    'funds_refunded_at' => now(),
                    'amount_refunded' => $booking->total_price,
                ]);
            }
        });

        // Refresh booking to get updated status
        $booking->refresh();

        // Notify both parties
        $booking->student->notify(new BookingCancelledByAdminNotification($booking, $reason, 'student'));
        $booking->teacher->user->notify(new BookingCancelledByAdminNotification($booking, $reason, 'teacher'));

        return back()->with('success', 'Booking cancelled successfully. Both parties have been notified.');
    }

    /**
     * Reassign teacher for a booking
     */
    public function reassignTeacher(Request $request, Booking $booking)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'reason' => 'nullable|string|max:500',
        ]);

        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'Cannot reassign teacher for this booking.');
        }

        $newTeacher = Teacher::findOrFail($request->teacher_id);

        // Check if new teacher teaches this subject
        if (!$newTeacher->subjects()->where('subject_id', $booking->subject_id)->exists()) {
            return back()->with('error', 'Selected teacher does not teach this subject.');
        }

        // Store old teacher before updating
        $oldTeacher = $booking->teacher;
        $reason = $request->reason;

        $booking->update(['teacher_id' => $request->teacher_id]);

        // Reload booking with relationships
        $booking->load(['student', 'teacher.user', 'subject']);

        // Send notifications to all parties
        // Notify student
        $booking->student->notify(new TeacherReassignedNotification($booking, $oldTeacher, $newTeacher, $reason, 'student'));
        
        // Notify old teacher
        $oldTeacher->user->notify(new TeacherReassignedNotification($booking, $oldTeacher, $newTeacher, $reason, 'old_teacher'));
        
        // Notify new teacher
        $newTeacher->user->notify(new TeacherReassignedNotification($booking, $oldTeacher, $newTeacher, $reason, 'new_teacher'));

        return back()->with('success', 'Teacher reassigned successfully. All parties have been notified.');
    }

    /**
     * Admin reschedule a booking
     */
    public function reschedule(Request $request, Booking $booking)
    {
        $request->validate([
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'reason' => 'nullable|string|max:500',
        ]);

        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return back()->with('error', 'Cannot reschedule this booking.');
        }

        $booking->update([
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'confirmed',
        ]);

        // TODO: Send notification to student and teacher

        return back()->with('success', 'Booking rescheduled successfully.');
    }

    /**
     * Bulk approve bookings
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'booking_ids' => 'required|array',
            'booking_ids.*' => 'exists:bookings,id',
        ]);

        $count = Booking::whereIn('id', $request->booking_ids)
            ->where('status', 'pending')
            ->update(['status' => 'confirmed']);

        return back()->with('success', "{$count} bookings approved successfully.");
    }

    /**
     * Bulk cancel bookings
     */
    public function bulkCancel(Request $request)
    {
        $request->validate([
            'booking_ids' => 'required|array',
            'booking_ids.*' => 'exists:bookings,id',
            'reason' => 'required|string|max:500',
        ]);

        $bookings = Booking::whereIn('id', $request->booking_ids)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->get();

        DB::transaction(function () use ($bookings, $request) {
            foreach ($bookings as $booking) {
                $booking->update([
                    'status' => 'cancelled',
                    'cancellation_reason' => $request->reason,
                ]);

                if ($booking->payment_status === 'held') {
                    $booking->update([
                        'payment_status' => 'refunded',
                        'funds_refunded_at' => now(),
                        'amount_refunded' => $booking->total_price,
                    ]);
                }
            }
        });

        return back()->with('success', count($bookings) . ' bookings cancelled successfully.');
    }

    /**
     * Get available teachers for reassignment
     */
    public function getAvailableTeachers(Request $request, Booking $booking)
    {
        $teachers = Teacher::with('user')
            ->where('status', 'approved')
            ->where('id', '!=', $booking->teacher_id)
            ->whereHas('subjects', function ($q) use ($booking) {
                $q->where('subject_id', $booking->subject_id);
            })
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name,
                'avatar' => $t->user->avatar,
                'hourly_rate' => $t->subjects()->where('subject_id', $booking->subject_id)->first()?->pivot->hourly_rate,
            ]);

        return response()->json(['teachers' => $teachers]);
    }

    /**
     * Get display status for booking
     */
    protected function getDisplayStatus(Booking $booking): string
    {
        if (in_array($booking->status, ['confirmed', 'awaiting_approval']) && $booking->start_time->isFuture()) {
            return $booking->status === 'awaiting_approval' ? 'awaiting_approval' : 'upcoming';
        }

        return match ($booking->status) {
            'pending' => 'pending',
            'awaiting_approval' => 'awaiting_approval',
            'confirmed' => 'confirmed',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'no_show' => 'missed',
            'rescheduling' => 'rescheduling',
            'disputed' => 'disputed',
            default => $booking->status,
        };
    }
}

