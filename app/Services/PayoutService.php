<?php

namespace App\Services;

use App\Models\Payout;
use App\Models\Teacher;
use App\Models\Transaction;
use App\Models\PaymentSetting; // Import PaymentSetting
use App\Services\Payment\PaystackService;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class PayoutService
{
    protected PaystackService $paystackService;
    protected WalletService $walletService;
    protected AuditService $auditService;

    public function __construct(PaystackService $paystackService, WalletService $walletService, AuditService $auditService)
    {
        $this->paystackService = $paystackService;
        $this->walletService = $walletService;
        $this->auditService = $auditService;
    }

    /**
     * Request a payout
     */
    public function requestPayout(int $teacherId, float $amount, int $paymentMethodId): Payout
    {
        return DB::transaction(function () use ($teacherId, $amount, $paymentMethodId) {
            // Lock the teacher record to prevent concurrent payout requests
            $teacher = Teacher::where('id', $teacherId)->lockForUpdate()->findOrFail($teacherId);

            // Check daily payout limit (24 hours since last request)
            if (
                $teacher->last_payout_requested_at &&
                $teacher->last_payout_requested_at->gt(now()->subDay())
            ) {
                $nextAvailable = $teacher->last_payout_requested_at->addDay();
                throw new \Exception(
                    "You can only request one payout per day. Next available: " .
                    $nextAvailable->diffForHumans() . " (" . $nextAvailable->format('M d, Y g:i A') . ")"
                );
            }

            $availableBalance = $this->calculateAvailableBalance($teacherId);

            if ($amount > $availableBalance) {
                throw new \Exception('Insufficient available balance for payout');
            }

            $settings = PaymentSetting::first();
            $minAmount = $settings->min_withdrawal_amount ?? 10000;
            $verificationEnabled = $settings->bank_verification_enabled ?? true;

            if ($amount < $minAmount) {
                throw new \Exception("Minimum payout amount is ₦" . number_format($minAmount, 2));
            }

            $paymentMethod = $teacher->paymentMethods()->findOrFail($paymentMethodId);

            if ($verificationEnabled && !$paymentMethod->is_verified) {
                throw new \Exception('Payment method must be verified before requesting payout');
            }

            $payout = Payout::create([
                'teacher_id' => $teacherId,
                'amount' => $amount,
                'currency' => 'NGN',
                'status' => 'pending',
                'payment_method_id' => $paymentMethodId,
                'gateway' => $paymentMethod->payment_type === 'paypal' ? 'paypal' : 'paystack',
                'requested_at' => now(),
            ]);

            // Update teacher's last payout request timestamp
            $teacher->update(['last_payout_requested_at' => now()]);

            // Audit Log
            $this->auditService->log(
                'PAYOUT_REQUESTED',
                $payout,
                [],
                ['amount' => $amount, 'method_id' => $paymentMethodId],
                "Payout requested by teacher #{$teacherId}"
            );

            return $payout;
        });
    }

    /**
     * Approve a payout
     */
    public function approvePayout(int $payoutId, ?int $adminId = null): Payout
    {
        $payout = Payout::findOrFail($payoutId);

        if ($payout->status !== 'pending') {
            throw new \Exception('Only pending payouts can be approved');
        }

        $oldStatus = $payout->status;
        $payout->approve($adminId);

        // Audit Log
        $this->auditService->log(
            'PAYOUT_APPROVED',
            $payout,
            ['status' => $oldStatus],
            ['status' => 'approved', 'admin_id' => $adminId],
            "Payout #{$payoutId} approved by admin #{$adminId}"
        );

        return $payout;
    }

    /**
     * Reject a payout
     */
    public function rejectPayout(int $payoutId, string $reason, int $adminId): Payout
    {
        $payout = Payout::findOrFail($payoutId);

        if ($payout->status !== 'pending') {
            throw new \Exception('Only pending payouts can be rejected');
        }

        $oldStatus = $payout->status;
        $payout->reject($reason, $adminId);

        // Audit Log
        $this->auditService->log(
            'PAYOUT_REJECTED',
            $payout,
            ['status' => $oldStatus],
            ['status' => 'rejected', 'admin_id' => $adminId, 'reason' => $reason],
            "Payout #{$payoutId} rejected by admin #{$adminId}"
        );

        return $payout;
    }

    /**
     * Process an approved payout.
     *
     * SAFETY: The third-party HTTP transfer MUST NOT run inside a DB transaction.
     * If the HTTP call succeeded but the subsequent DB commit failed, the teacher
     * would receive money without any wallet debit — a double-spend.
     *
     * Pattern used here:
     *   1. Transaction A  – mark payout as `processing` (idempotent write).
     *   2. No transaction – execute the external HTTP transfer.
     *   3. Transaction B  – on success: debit wallet & mark `completed`.
     *                        on failure: mark `failed` only.
     */
    public function processPayout(int $payoutId): Payout
    {
        // ── Phase 1: Mark as processing in an isolated transaction ──────────────
        $payout = DB::transaction(function () use ($payoutId) {
            $payout = Payout::with('teacher', 'paymentMethod')->lockForUpdate()->findOrFail($payoutId);

            if ($payout->status !== 'approved') {
                throw new \Exception('Only approved payouts can be processed');
            }

            $payout->markAsProcessing();

            return $payout->fresh(['teacher', 'paymentMethod']);
        });

        // ── Phase 2: Execute external HTTP transfer (outside any transaction) ───
        try {
            if ($payout->gateway === 'paystack') {
                $result = $this->processPaystackPayout($payout);
            } elseif ($payout->gateway === 'paypal') {
                $result = $this->processPayPalPayout($payout);
            } else {
                throw new \Exception('Unsupported payment gateway');
            }
        } catch (\Exception $e) {
            // Network / gateway exception — mark failed and re-throw.
            // No wallet debit occurred so no funds are at risk.
            DB::transaction(function () use ($payout, $e) {
                $payout->update([
                    'status' => 'failed',
                    'gateway_response' => ['error' => $e->getMessage()],
                ]);
            });
            throw $e;
        }

        // ── Phase 3: Finalise in a new isolated transaction ──────────────────────
        return DB::transaction(function () use ($payout, $result) {
            // Re-fetch inside the new transaction to get the freshest state.
            $freshPayout = Payout::with('teacher', 'paymentMethod')->lockForUpdate()->findOrFail($payout->id);

            if ($result['status']) {
                // Debit teacher's wallet — safe to do here because the HTTP transfer
                // already succeeded; the two operations are in the same transaction so
                // both succeed or both roll back together.
                $this->walletService->debitWallet(
                    $freshPayout->teacher->user_id,
                    $freshPayout->amount,
                    "Payout to {$freshPayout->paymentMethod->account_name}",
                    ['payout_id' => $freshPayout->id],
                    $freshPayout->gateway
                );

                $freshPayout->update([
                    'status' => 'completed',
                    'gateway_reference' => $result['reference'],
                    'gateway_response' => $result['data'] ?? [],
                    'processed_at' => now(),
                ]);
            } else {
                $freshPayout->update([
                    'status' => 'failed',
                    'gateway_response' => ['error' => $result['message']],
                ]);

                throw new \Exception($result['message']);
            }

            return $freshPayout->fresh();
        });
    }

    /**
     * Process payout via Paystack
     */
    protected function processPaystackPayout(Payout $payout): array
    {
        $paymentMethod = $payout->paymentMethod;

        // Create transfer recipient if not exists
        if (!$paymentMethod->recipient_code) {
            // Handle Test Account Bypass
            $bankCode = $paymentMethod->bank_code;
            if ($paymentMethod->account_number === '0000000000') {
                $bankCode = '057'; // Force Zenith Bank for test account
            }

            $recipientResult = $this->paystackService->createTransferRecipient(
                $paymentMethod->account_name,
                $paymentMethod->account_number,
                $bankCode
            );

            if (!$recipientResult['status']) {
                return $recipientResult;
            }

            $paymentMethod->update(['recipient_code' => $recipientResult['data']['recipient_code']]);
        }

        // Initiate transfer
        $reference = 'PAYOUT-' . $payout->id . '-' . time();

        $transferResult = $this->paystackService->transferToBank(
            $paymentMethod->recipient_code,
            $payout->amount,
            "IqraQuest Payout - " . now()->format('M Y'),
            $reference
        );

        // NOTE: We do NOT simulate success for failed transfers
        // If Paystack fails (even in test mode with "starter business"), 
        // the payout should properly fail and be marked as 'failed'
        // This ensures data integrity and prevents false positives

        return $transferResult;
    }

    /**
     * Process payout via PayPal (placeholder)
     */
    protected function processPayPalPayout(Payout $payout): array
    {
        // TODO: Implement PayPal payout
        throw new \Exception('PayPal payout not yet implemented');
    }

    /**
     * Calculate available balance for teacher
     */
    public function calculateAvailableBalance(int $teacherId): float
    {
        $teacher = Teacher::findOrFail($teacherId);

        // Get wallet balance
        $walletBalance = $this->walletService->getBalance($teacher->user_id);

        // Subtract pending payouts
        $pendingPayouts = Payout::where('teacher_id', $teacherId)
            ->whereIn('status', ['pending', 'approved', 'processing'])
            ->sum('amount');

        return max(0, $walletBalance - $pendingPayouts);
    }

    /**
     * Get pending earnings (not yet cleared)
     */
    public function getPendingEarnings(int $teacherId): float
    {
        // For now, return 0. This will be implemented when booking system is built
        // to track earnings from sessions that haven't been completed yet
        return 0;
    }
}
