<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\DisputeResolvedNotification;
use App\Services\EscrowService;
use Illuminate\Huest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DisputeController extends Controller
{
    protected EscrowService $escrowService;

    public function __construct(EscrowService $escrowService)
    {
        $this->escrowService = $escrowService;
    }

    /**
     * List all disputes
     */
    public function index(Request $request)
    {
        $query = Booking::whereNotNull('dispute_raised_at')
            ->with(['student', 'teacher.user', 'subject']);

        // Filter by status
        if ($request->status === 'pending') {
            $query->whereNull('dispute_resolved_at');
        } elseif ($request->status === 'resolved') {
            $query->whereNotNull('dispute_resolved_at');
        }

        $disputes = $query->orderByDesc('dispute_raised_at')
            ->paginate(20)
            ->through(fn($booking) => [
                'id' => $booking->id,
                'student' => [
                    'id' => $booking->student->id,
                    'name' => $booking->student->name,
                    'email' => $booking->student->email,
                ],
                'teacher' => [
                    'id' => $booking->teacher->id,
                    'name' => $booking->teacher->user->name,
                    'email' => $booking->teacher->user->email,
                ],
                'subject' => $booking->subject->name,
                'amount' => $booking->total_price,
                'currency' => $booking->currency,
                'session_date' => $booking->start_time->format('M j, Y'),
                'dispute_raised_at' => $booking->dispute_raised_at->format('M j, Y H:i'),
                'dispute_reason' => $booking->dispute_reason,
                'dispute_resolved_at' => $booking->dispute_resolved_at?->format('M j, Y H:i'),
                'dispute_resolution' => $booking->dispute_resolution,
                'payment_status' => $booking->payment_status,
                'status' => $booking->dispute_resolved_at ? 'resolved' : 'pending',
            ]);

        return Inertia::render('Admin/Disputes/Index', [
            'disputes' => $disputes,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show dispute details
     */
    public function show(Booking $booking)
    {
        if (!$booking->dispute_raised_at) {
            abort(404, 'No dispute found for this booking.');
        }

        $booking->load(['student', 'teacher.user', 'subject']);

        return Inertia::render('Admin/Disputes/Show', [
            'dispute' => [
                'id' => $booking->id,
                'student' => [
                    'id' => $booking->student->id,
                    'name' => $booking->student->name,
                    'email' => $booking->student->email,
                ],
                'teacher' => [
                    'id' => $booking->teacher->id,
                    'name' => $booking->teacher->user->name,
                    'email' => $booking->teacher->user->email,
                ],
                'subject' => $booking->subject->name,
                'amount' => $booking->total_price,
                'currency' => $booking->currency,
                'session_date' => $booking->start_time->format('M j, Y'),
                'session_time' => $booking->start_time->format('h:i A') . ' - ' . $booking->end_time->format('h:i A'),
                'teacher_attended' => $booking->teacher_attended,
                'student_attended' => $booking->student_attended,
                'actual_duration' => $booking->actual_duration_minutes,
                'expected_duration' => $booking->getExpectedDurationMinutes(),
                'dispute_raised_at' => $booking->dispute_raised_at->format('M j, Y H:i'),
                'dispute_reason' => $booking->dispute_reason,
                'dispute_resolved_at' => $booking->dispute_resolved_at?->format('M j, Y H:i'),
                'dispute_resolution' => $booking->dispute_resolution,
                'payment_status' => $booking->payment_status,
            ],
        ]);
    }

    /**
     * Resolve dispute - release funds to teacher
     */
    public function resolveForTeacher(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'resolution' => 'required|string|max:1000',
        ]);

        if (!$booking->dispute_raised_at || $booking->dispute_resolved_at) {
            return back()->with('error', 'This dispute cannot be resolved.');
        }

        // Release funds to teacher
        $this->escrowService->releaseFunds($booking);

        // Mark dispute as resolved
        $booking->resolveDispute(
            $validated['resolution'],
            Auth::id(),
            'released'
        );

        // Notify both parties
        $this->notifyResolution($booking, 'teacher');

        return back()->with('success', 'Dispute resolved in favor of teacher. Funds released.');
    }

    /**
     * Resolve dispute - refund to student
     */
    public function resolveForStudent(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'resolution' => 'required|string|max:1000',
        ]);

        if (!$booking->dispute_raised_at || $booking->dispute_resolved_at) {
            return back()->with('error', 'This dispute cannot be resolved.');
        }

        // Refund to student
        $this->escrowService->refundFunds($booking, null, 'Dispute resolved in student\'s favor');

        // Mark dispute as resolved
        $booking->resolveDispute(
            $validated['resolution'],
            Auth::id(),
            'refunded'
        );

        // Notify both parties
        $this->notifyResolution($booking, 'student');

        return back()->with('success', 'Dispute resolved in favor of student. Funds refunded.');
    }

    /**
     * Resolve dispute - partial payment
     */
    public function resolvePartial(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'resolution' => 'required|string|max:1000',
            'teacher_percentage' => 'required|numeric|min:0|max:100',
        ]);

        if (!$booking->dispute_raised_at || $booking->dispute_resolved_at) {
            return back()->with('error', 'This dispute cannot be resolved.');
        }

        // Process partial payment
        $this->escrowService->processPartialPayment(
            $booking,
            $validated['teacher_percentage'],
            'Dispute resolved with partial payment'
        );

        // Mark dispute as resolved
        $booking->resolveDispute(
            $validated['resolution'],
            Auth::id(),
            'partial'
        );

        // Notify both parties
        $this->notifyResolution($booking, 'partial', $validated['teacher_percentage']);

        return back()->with('success', 'Dispute resolved with partial payment.');
    }

    /**
     * Notify both parties of resolution
     */
    protected function notifyResolution(Booking $booking, string $outcome, ?float $percentage = null): void
    {
        try {
            $booking->student->notify(new DisputeResolvedNotification($booking, $outcome, $percentage, true));
            $booking->teacher->user->notify(new DisputeResolvedNotification($booking, $outcome, $percentage, false));
        } catch (\Exception $e) {
            \Log::error("Failed to send dispute resolution notification: " . $e->getMessage());
        }
    }
}

