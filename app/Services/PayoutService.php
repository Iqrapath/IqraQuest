<?php

namespace App\Services;

use App\Models\Payout;
use App\Models\Teacher;
use App\Models\Transaction;
use App\Models\PaymentSetting; // Import PaymentSetting
use App\Services\Payment\PaystackService;
use Illuminate\Support\Facades\DB;

class PayoutService
{
    protected PaystackService $paystackService;
    protected WalletService $walletService;

    public function __construct(PaystackService $paystackService, WalletService $walletService)
    {
        $this->paystackService = $paystackService;
        $this->walletService = $walletService;
    }

    /**
     * Request a payout
     */
    public function requestPayout(int $teacherId, float $amount, int $paymentMethodId): Payout
    {
        $teacher = Teacher::findOrFail($teacherId);
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

        return Payout::create([
            'teacher_id' => $teacherId,
            'amount' => $amount,
            'currency' => 'NGN',
            'status' => 'pending',
            'payment_method_id' => $paymentMethodId,
            'gateway' => $paymentMethod->payment_type === 'paypal' ? 'paypal' : 'paystack',
            'requested_at' => now(),
        ]);
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

        $payout->approve($adminId);

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

        $payout->reject($reason, $adminId);

        return $payout;
    }

    /**
     * Process an approved payout
     */
    public function processPayout(int $payoutId): Payout
    {
        return DB::transaction(function () use ($payoutId) {
            $payout = Payout::with('teacher', 'paymentMethod')->findOrFail($payoutId);

            if ($payout->status !== 'approved') {
                throw new \Exception('Only approved payouts can be processed');
            }

            $payout->markAsProcessing();

            try {
                // Process based on gateway
                if ($payout->gateway === 'paystack') {
                    $result = $this->processPaystackPayout($payout);
                } elseif ($payout->gateway === 'paypal') {
                    $result = $this->processPayPalPayout($payout);
                } else {
                    throw new \Exception('Unsupported payment gateway');
                }

                if ($result['status']) {
                    // Debit teacher's wallet
                    $this->walletService->debitWallet(
                        $payout->teacher->user_id,
                        $payout->amount,
                        "Payout to {$payout->paymentMethod->account_name}",
                        ['payout_id' => $payout->id],
                        $payout->gateway
                    );

                    // Mark as completed
                    $payout->update([
                        'status' => 'completed',
                        'gateway_reference' => $result['reference'],
                        'gateway_response' => $result['data'] ?? [],
                        'processed_at' => now(),
                    ]);
                } else {
                    $payout->update([
                        'status' => 'failed',
                        'gateway_response' => ['error' => $result['message']],
                    ]);

                    throw new \Exception($result['message']);
                }
            } catch (\Exception $e) {
                $payout->update(['status' => 'failed']);
                throw $e;
            }

            return $payout->fresh();
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

        // Handle "Starter Business" limitation in Test Mode ONLY
        // We check if the key starts with 'sk_test_' to ensure this NEVER happens in production
        $isTestMode = str_starts_with(config('services.paystack.secret_key'), 'sk_test_');

        if ($isTestMode && !$transferResult['status'] && str_contains($transferResult['message'], 'starter business')) {
            \Log::warning('Paystack Transfer Simulated (Starter Business Limitation): ' . $transferResult['message']);
            return [
                'status' => true,
                'reference' => $reference,
                'data' => [
                    'transfer_code' => 'TRF_SIMULATED_' . time(),
                    'status' => 'success',
                    'message' => 'Simulated success (Starter Business)'
                ]
            ];
        }

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
