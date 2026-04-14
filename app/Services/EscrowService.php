<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\PlatformEarning;
use App\Models\PaymentSetting;
use App\Notifications\FundsReleasedNotification;
use App\Notifications\FundsRefundedNotification;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EscrowService
{
    protected WalletService $walletService;
    protected AuditService $auditService;

    // Configuration defaults (can be overridden by PaymentSettings)
    const DEFAULT_DISPUTE_WINDOW_HOURS = 2; // Reduced from 24
    const DEFAULT_MIN_COMPLETION_PERCENTAGE = 80;

    public function __construct(WalletService $walletService, AuditService $auditService)
    {
        $this->walletService = $walletService;
        $this->auditService = $auditService;
    }

    /**
     * Hold funds in escrow when student pays for booking
     */
    public function holdFunds(Booking $booking): bool
    {
        return DB::transaction(function () use ($booking) {
            $student = $booking->student;
            $amount = $booking->total_price;

            // Check if student has sufficient balance
            if (!$this->walletService->canDebit($student->id, $amount)) {
                Log::warning("Escrow: Insufficient funds for booking #{$booking->id}");
                return false;
            }

            // Debit student wallet
            $this->walletService->debitWallet(
                $student->id,
                $amount,
                "Payment held for booking #{$booking->id} with " . $booking->teacher->user->name,
                [
                    'booking_id' => $booking->id,
                    'type' => 'escrow_hold',
                    'teacher_id' => $booking->teacher_id,
                ]
            );

            // Update booking payment status
            $booking->update([
                'payment_status' => 'held',
                'funds_held_at' => now(),
            ]);

            Log::info("Escrow: Funds held for booking #{$booking->id}, amount: {$amount}");
            return true;
        });
    }

    /**
     * Release funds to teacher after session completion
     */
    public function releaseFunds(Booking $booking, ?float $customAmount = null): bool
    {
        if ($booking->payment_status !== 'held') {
            Log::warning("Escrow: Cannot release funds for booking #{$booking->id} - status is {$booking->payment_status}");
            return false;
        }

        return DB::transaction(function () use ($booking, $customAmount) {
            $teacher = $booking->teacher;
            $totalAmount = $booking->total_price;

            // Calculate amounts
            $releaseAmount = $customAmount ?? $totalAmount;
            $commissionRate = $booking->commission_rate ?? $this->getCommissionRate();
            $platformCommission = ($releaseAmount * $commissionRate) / 100;
            $teacherEarnings = $releaseAmount - $platformCommission;

            // Credit teacher wallet
            $transaction = $this->walletService->creditWallet(
                $teacher->user_id,
                $teacherEarnings,
                "Earnings from booking #{$booking->id} - Session with " . $booking->student->name,
                [
                    'booking_id' => $booking->id,
                    'type' => 'escrow_release',
                    'gross_amount' => $releaseAmount,
                    'commission' => $platformCommission,
                    'commission_rate' => $commissionRate,
                ]
            );

            // Record platform earnings
            PlatformEarning::create([
                'transaction_id' => $transaction->id,
                'booking_id' => $booking->id,
                'amount' => $platformCommission,
                'percentage' => $commissionRate,
            ]);

            // Update booking
            $oldStatus = $booking->payment_status;
            $booking->update([
                'payment_status' => 'released',
                'funds_released_at' => now(),
                'amount_released' => $teacherEarnings,
            ]);

            // Audit Log
            $this->auditService->log(
                'ESCROW_RELEASE',
                $booking,
                ['payment_status' => $oldStatus],
                ['payment_status' => 'released', 'amount' => $teacherEarnings],
                "Funds released to teacher for booking #{$booking->id}"
            );

            // Notify teacher
            try {
                $teacher->user->notify(new FundsReleasedNotification($booking, $teacherEarnings));
            } catch (\Exception $e) {
                Log::error("Failed to send funds released notification: " . $e->getMessage());
            }

            Log::info("Escrow: Funds released for booking #{$booking->id}, teacher earnings: {$teacherEarnings}");
            return true;
        });
    }


    /**
     * Refund funds to student
     */
    public function refundFunds(Booking $booking, ?float $customAmount = null, string $reason = 'Booking cancelled'): bool
    {
        if (!in_array($booking->payment_status, ['held', 'disputed'])) {
            Log::warning("Escrow: Cannot refund funds for booking #{$booking->id} - status is {$booking->payment_status}");
            return false;
        }

        return DB::transaction(function () use ($booking, $customAmount, $reason) {
            $student = $booking->student;
            $refundAmount = $customAmount ?? $booking->total_price;

            // Credit student wallet
            $this->walletService->creditWallet(
                $student->id,
                $refundAmount,
                "Refund for booking #{$booking->id}: {$reason}",
                [
                    'booking_id' => $booking->id,
                    'type' => 'escrow_refund',
                    'reason' => $reason,
                ]
            );

            // Update booking
            $oldStatus = $booking->payment_status;
            $booking->update([
                'payment_status' => 'refunded',
                'funds_refunded_at' => now(),
                'amount_refunded' => $refundAmount,
            ]);

            // Audit Log
            $this->auditService->log(
                'ESCROW_REFUND',
                $booking,
                ['payment_status' => $oldStatus],
                ['payment_status' => 'refunded', 'amount' => $refundAmount, 'reason' => $reason],
                "Funds refunded to student for booking #{$booking->id}"
            );

            // Notify student
            try {
                $student->notify(new FundsRefundedNotification($booking, $refundAmount, $reason));
            } catch (\Exception $e) {
                Log::error("Failed to send funds refunded notification: " . $e->getMessage());
            }

            Log::info("Escrow: Funds refunded for booking #{$booking->id}, amount: {$refundAmount}");
            return true;
        });
    }

    /**
     * Process partial payment (e.g., for no-shows or early endings)
     */
    public function processPartialPayment(Booking $booking, float $teacherPercentage, string $reason): bool
    {
        if ($booking->payment_status !== 'held') {
            return false;
        }

        return DB::transaction(function () use ($booking, $teacherPercentage, $reason) {
            $totalAmount = $booking->total_price;
            $teacherAmount = ($totalAmount * $teacherPercentage) / 100;
            $refundAmount = $totalAmount - $teacherAmount;

            // Release partial to teacher
            if ($teacherAmount > 0) {
                $commissionRate = $booking->commission_rate ?? $this->getCommissionRate();
                $platformCommission = ($teacherAmount * $commissionRate) / 100;
                $teacherEarnings = $teacherAmount - $platformCommission;

                $transaction = $this->walletService->creditWallet(
                    $booking->teacher->user_id,
                    $teacherEarnings,
                    "Partial earnings from booking #{$booking->id}: {$reason}",
                    [
                        'booking_id' => $booking->id,
                        'type' => 'escrow_partial_release',
                        'percentage' => $teacherPercentage,
                    ]
                );

                PlatformEarning::create([
                    'transaction_id' => $transaction->id,
                    'booking_id' => $booking->id,
                    'amount' => $platformCommission,
                    'percentage' => $commissionRate,
                ]);

                $booking->update(['amount_released' => $teacherEarnings]);
            }

            // Refund remainder to student
            if ($refundAmount > 0) {
                $this->walletService->creditWallet(
                    $booking->user_id,
                    $refundAmount,
                    "Partial refund for booking #{$booking->id}: {$reason}",
                    [
                        'booking_id' => $booking->id,
                        'type' => 'escrow_partial_refund',
                    ]
                );

                $booking->update(['amount_refunded' => $refundAmount]);
            }

            $booking->update([
                'payment_status' => 'partial',
                'funds_released_at' => now(),
            ]);

            Log::info("Escrow: Partial payment processed for booking #{$booking->id}, teacher: {$teacherPercentage}%");
            return true;
        });
    }

    /**
     * Handle session completion and determine payment
     */
    public function handleSessionCompletion(Booking $booking): void
    {
        // Idempotency guard — only process if funds are still held
        if ($booking->payment_status !== 'held') {
            Log::warning("Escrow: Skipping handleSessionCompletion for booking #{$booking->id} — payment_status is '{$booking->payment_status}'");
            return;
        }

        // ── Option B: Sync flags from actual attendance records before deciding ──
        $this->syncAttendanceFlagsFromRecords($booking);

        // Determine payment based on attendance (set terminal status per branch)
        if (!$booking->teacher_attended && !$booking->student_attended) {
            // Both no-show - full refund to student
            $this->refundFunds($booking, null, 'Session not attended by either party');
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'Session not attended by either party',
            ]);
        } elseif (!$booking->teacher_attended) {
            // Teacher no-show - full refund
            $this->refundFunds($booking, null, 'Teacher did not attend the session');
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'Teacher did not attend the session',
            ]);
        } elseif (!$booking->student_attended) {
            // Student no-show while teacher was present — full refund, class cancelled, teacher gets nothing
            $this->refundFunds($booking, null, 'Student did not attend the session');
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'Student no-show',
            ]);
        } else {
            // Both attended - check completion percentage
            $completionPercentage = $booking->getCompletionPercentage();
            $minCompletion = $this->getMinCompletionPercentage();

            if ($completionPercentage >= $minCompletion) {
                // Check if teacher is VIP for instant release
                if ($booking->teacher->isVip()) {
                    $this->releaseFunds($booking);
                    Log::info("Escrow: Booking #{$booking->id} completed, instant release for VIP teacher");
                } else {
                    // Full payment - but wait for dispute window
                    // Funds will be released by scheduled job after 2h
                    Log::info("Escrow: Booking #{$booking->id} completed, awaiting 2h dispute window");
                }
                $booking->update(['status' => 'completed']);
            } else {
                // Pro-rated payment based on actual duration
                $this->processPartialPayment(
                    $booking,
                    $completionPercentage,
                    "Session ended early ({$booking->actual_duration_minutes} minutes)"
                );
                $booking->update(['status' => 'completed']);
            }
        }
    }

    /**
     * Sync attendance flags from actual ClassroomAttendance records.
     * Safety net: if someone joined (has attendance records) but their flag wasn't set, fix it.
     */
    protected function syncAttendanceFlagsFromRecords(Booking $booking): void
    {
        $hasTeacher = \App\Models\ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'teacher')
            ->exists();

        $hasStudent = \App\Models\ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'student')
            ->exists();

        $updates = [];
        if ($hasTeacher && !$booking->teacher_attended) {
            $updates['teacher_attended'] = true;
        }
        if ($hasStudent && !$booking->student_attended) {
            $updates['student_attended'] = true;
        }

        if (!empty($updates)) {
            $booking->update($updates);
            $booking->refresh();
            Log::info("Escrow: Auto-fixed attendance flags for booking #{$booking->id}", $updates);
        }
    }

    /**
     * Process eligible bookings for fund release (called by scheduled job)
     */
    public function processEligibleReleases(): array
    {
        $results = ['released' => 0, 'failed' => 0, 'errors' => []];

        $eligibleBookings = Booking::eligibleForRelease()->get();

        foreach ($eligibleBookings as $booking) {
            try {
                if ($this->releaseFunds($booking)) {
                    $results['released']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = "Booking #{$booking->id}: " . $e->getMessage();
                Log::error("Escrow release failed for booking #{$booking->id}: " . $e->getMessage());
            }
        }

        return $results;
    }

    /**
     * Handle teacher no-show scenario
     */
    public function handleTeacherNoShow(Booking $booking): void
    {
        $this->refundFunds($booking, null, 'Teacher did not join the session');
        $booking->update(['status' => 'cancelled', 'cancellation_reason' => 'Teacher no-show']);
    }

    /**
     * Handle student no-show scenario
     */
    public function handleStudentNoShow(Booking $booking): void
    {
        $this->refundFunds($booking, null, 'Student did not join the session');
        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Student no-show',
        ]);
    }

    // ===== CONFIGURATION HELPERS =====

    protected function getCommissionRate(): float
    {
        $settings = PaymentSetting::first();
        return $settings?->commission_rate ?? 15.0;
    }

    protected function getDisputeWindowHours(): int
    {
        return self::DEFAULT_DISPUTE_WINDOW_HOURS;
    }

    protected function getMinCompletionPercentage(): float
    {
        return self::DEFAULT_MIN_COMPLETION_PERCENTAGE;
    }
}
