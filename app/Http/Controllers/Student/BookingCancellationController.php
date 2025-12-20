<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingCancelledByStudentNotification;
use App\Services\EscrowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingCancellationController extends Controller
{
    protected EscrowService $escrowService;

    // Cancellation policy thresholds (hours before session)
    const FULL_REFUND_HOURS = 24;        // > 24h = 100% refund
    const LATE_CANCEL_TIER1_HOURS = 12;  // 12-24h = 75% refund
    const LATE_CANCEL_TIER2_HOURS = 6;   // 6-12h = 50% refund
    // < 6h = 0% refund

    public function __construct(EscrowService $escrowService)
    {
        $this->escrowService = $escrowService;
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, Booking $booking)
    {
        // Verify ownership (student or guardian who made the booking)
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to cancel this booking.');
        }

        // Check if booking can be cancelled
        $cancellationCheck = $this->canBeCancelled($booking);
        if (!$cancellationCheck['allowed']) {
            return back()->with('error', $cancellationCheck['reason']);
        }

        // Validate request
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
            'cancel_series' => 'nullable|boolean', // For recurring bookings
        ]);

        $reason = $validated['reason'] ?? 'Cancelled by student';
        $cancelSeries = $validated['cancel_series'] ?? false;

        DB::transaction(function () use ($booking, $reason, $cancelSeries) {
            // Cancel the booking
            $this->processCancellation($booking, $reason);

            // If recurring and user wants to cancel series
            if ($cancelSeries && $booking->parent_booking_id) {
                $this->cancelRemainingSeries($booking, $reason);
            } elseif ($cancelSeries && $booking->childBookings()->exists()) {
                $this->cancelChildBookings($booking, $reason);
            }
        });

        return back()->with('success', 'Booking cancelled successfully. Refund has been processed to your wallet.');
    }

    /**
     * Get cancellation details (refund amount, policy info)
     */
    public function getCancellationDetails(Booking $booking)
    {
        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        $cancellationCheck = $this->canBeCancelled($booking);
        $refundInfo = $this->calculateRefund($booking);

        return response()->json([
            'can_cancel' => $cancellationCheck['allowed'],
            'reason' => $cancellationCheck['reason'] ?? null,
            'refund_percentage' => $refundInfo['percentage'],
            'refund_amount' => $refundInfo['amount'],
            'cancellation_fee' => $refundInfo['fee'],
            'total_price' => $booking->total_price,
            'currency' => $booking->currency,
            'hours_until_session' => $refundInfo['hours_until'],
            'policy_tier' => $refundInfo['tier'],
            'is_recurring' => $booking->parent_booking_id !== null || $booking->childBookings()->exists(),
            'child_bookings_count' => $booking->childBookings()->where('status', '!=', 'cancelled')->count(),
        ]);
    }

    /**
     * Check if booking can be cancelled
     */
    protected function canBeCancelled(Booking $booking): array
    {
        // Already cancelled
        if ($booking->status === 'cancelled') {
            return ['allowed' => false, 'reason' => 'This booking is already cancelled.'];
        }

        // Completed sessions can't be cancelled
        if ($booking->status === 'completed') {
            return ['allowed' => false, 'reason' => 'Completed sessions cannot be cancelled.'];
        }

        // Disputed bookings can't be cancelled
        if ($booking->status === 'disputed' || $booking->payment_status === 'disputed') {
            return ['allowed' => false, 'reason' => 'Disputed bookings cannot be cancelled. Please wait for resolution.'];
        }

        // Session already started
        if ($booking->session_started_at) {
            return ['allowed' => false, 'reason' => 'Cannot cancel a session that has already started.'];
        }

        // Session time has passed
        if ($booking->start_time->isPast()) {
            return ['allowed' => false, 'reason' => 'Cannot cancel a session that has already passed.'];
        }

        // Funds already released
        if ($booking->payment_status === 'released') {
            return ['allowed' => false, 'reason' => 'Cannot cancel - payment has already been released.'];
        }

        return ['allowed' => true];
    }

    /**
     * Calculate refund based on cancellation policy
     */
    protected function calculateRefund(Booking $booking): array
    {
        $hoursUntil = now()->diffInHours($booking->start_time, false);
        $totalPrice = (float) $booking->total_price;

        // If awaiting approval (teacher hasn't accepted), always full refund
        if ($booking->status === 'awaiting_approval') {
            return [
                'percentage' => 100,
                'amount' => $totalPrice,
                'fee' => 0,
                'hours_until' => $hoursUntil,
                'tier' => 'awaiting_approval',
            ];
        }

        // If pending (not yet paid), no refund needed
        if ($booking->payment_status === 'pending') {
            return [
                'percentage' => 100,
                'amount' => 0,
                'fee' => 0,
                'hours_until' => $hoursUntil,
                'tier' => 'not_paid',
            ];
        }

        // Apply tiered refund policy
        if ($hoursUntil > self::FULL_REFUND_HOURS) {
            // > 24 hours: 100% refund
            return [
                'percentage' => 100,
                'amount' => $totalPrice,
                'fee' => 0,
                'hours_until' => $hoursUntil,
                'tier' => 'full_refund',
            ];
        } elseif ($hoursUntil > self::LATE_CANCEL_TIER1_HOURS) {
            // 12-24 hours: 75% refund
            $refundAmount = $totalPrice * 0.75;
            return [
                'percentage' => 75,
                'amount' => round($refundAmount, 2),
                'fee' => round($totalPrice - $refundAmount, 2),
                'hours_until' => $hoursUntil,
                'tier' => 'late_tier1',
            ];
        } elseif ($hoursUntil > self::LATE_CANCEL_TIER2_HOURS) {
            // 6-12 hours: 50% refund
            $refundAmount = $totalPrice * 0.50;
            return [
                'percentage' => 50,
                'amount' => round($refundAmount, 2),
                'fee' => round($totalPrice - $refundAmount, 2),
                'hours_until' => $hoursUntil,
                'tier' => 'late_tier2',
            ];
        } else {
            // < 6 hours: 0% refund
            return [
                'percentage' => 0,
                'amount' => 0,
                'fee' => $totalPrice,
                'hours_until' => $hoursUntil,
                'tier' => 'no_refund',
            ];
        }
    }

    /**
     * Process the cancellation and refund
     */
    protected function processCancellation(Booking $booking, string $reason): void
    {
        $refundInfo = $this->calculateRefund($booking);

        // Update booking status
        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        // Process refund if funds are held
        if ($booking->payment_status === 'held') {
            if ($refundInfo['percentage'] === 100) {
                // Full refund
                $this->escrowService->refundFunds($booking, null, "Student cancelled: {$reason}");
            } elseif ($refundInfo['percentage'] > 0) {
                // Partial refund - student gets percentage, teacher gets cancellation fee
                $this->processPartialCancellationRefund($booking, $refundInfo, $reason);
            } else {
                // No refund - teacher gets full amount (minus commission)
                $this->escrowService->releaseFunds($booking);
            }
        }

        // Notify teacher
        try {
            $booking->teacher->user->notify(new BookingCancelledByStudentNotification($booking, $refundInfo));
        } catch (\Exception $e) {
            \Log::error("Failed to send cancellation notification: " . $e->getMessage());
        }
    }

    /**
     * Process partial refund for late cancellation
     */
    protected function processPartialCancellationRefund(Booking $booking, array $refundInfo, string $reason): void
    {
        // Use escrow service's partial payment method
        // Teacher gets the cancellation fee percentage
        $teacherPercentage = 100 - $refundInfo['percentage'];
        $this->escrowService->processPartialPayment(
            $booking,
            $teacherPercentage,
            "Late cancellation by student: {$reason}"
        );
    }

    /**
     * Cancel remaining bookings in a recurring series
     */
    protected function cancelRemainingSeries(Booking $booking, string $reason): void
    {
        // Get all future bookings in the same series
        $siblingBookings = Booking::where('parent_booking_id', $booking->parent_booking_id)
            ->where('id', '!=', $booking->id)
            ->where('start_time', '>', now())
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->get();

        foreach ($siblingBookings as $sibling) {
            $this->processCancellation($sibling, "Series cancelled: {$reason}");
        }
    }

    /**
     * Cancel child bookings of a parent booking
     */
    protected function cancelChildBookings(Booking $booking, string $reason): void
    {
        $childBookings = $booking->childBookings()
            ->where('start_time', '>', now())
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->get();

        foreach ($childBookings as $child) {
            $this->processCancellation($child, "Series cancelled: {$reason}");
        }
    }
}

