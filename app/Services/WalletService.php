<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\PaymentSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class WalletService
{
    /**
     * Get or create wallet for user
     */
    public function getOrCreateWallet(int $userId, string $currency = 'NGN'): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $userId],
            ['currency' => $currency, 'balance' => 0]
        );
    }

    /**
     * Credit a user's wallet
     */
    public function creditWallet(
        int $userId,
        float $amount,
        string $description,
        array $metadata = [],
        ?string $gateway = null,
        ?string $gatewayReference = null
    ): Transaction {
        return DB::transaction(function () use ($userId, $amount, $description, $metadata, $gateway, $gatewayReference) {
            $wallet = $this->getOrCreateWallet($userId);

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => $userId,
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'currency' => $wallet->currency,
                'status' => 'completed',
                'payment_gateway' => $gateway,
                'gateway_reference' => $gatewayReference,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            // Update wallet balance
            $wallet->increment('balance', $amount);

            return $transaction;
        });
    }

    /**
     * Debit a user's wallet
     */
    public function debitWallet(
        int $userId,
        float $amount,
        string $description,
        array $metadata = [],
        ?string $gateway = null
    ): Transaction {
        return DB::transaction(function () use ($userId, $amount, $description, $metadata, $gateway) {
            $wallet = $this->getOrCreateWallet($userId);

            if (!$this->canDebit($userId, $amount)) {
                throw new \Exception('Insufficient wallet balance');
            }

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => $userId,
                'wallet_id' => $wallet->id,
                'type' => 'debit',
                'amount' => $amount,
                'currency' => $wallet->currency,
                'status' => 'completed',
                'payment_gateway' => $gateway,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            // Update wallet balance
            $wallet->decrement('balance', $amount);

            return $transaction;
        });
    }

    /**
     * Get wallet balance
     */
    public function getBalance(int $userId): float
    {
        $wallet = $this->getOrCreateWallet($userId);
        return (float) $wallet->balance;
    }

    /**
     * Check if user can debit amount
     */
    public function canDebit(int $userId, float $amount): bool
    {
        $balance = $this->getBalance($userId);
        return $balance >= $amount;
    }

    /**
     * Create a transaction record
     */
    public function createTransaction(array $data): Transaction
    {
        return Transaction::create($data);
    }

    /**
     * Get transaction history for user
     */
    public function getTransactionHistory(int $userId, array $filters = [])
    {
        $query = Transaction::where('user_id', $userId);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Process booking payment from wallet
     */
    public function processBookingPayment(
        int $studentId,
        int $teacherId,
        float $amount,
        int $bookingId
    ): array {
        return DB::transaction(function () use ($studentId, $teacherId, $amount, $bookingId) {
            // Fetch commission settings
            $settings = PaymentSetting::first();
            $commissionRate = $settings?->commission_rate ?? 10.00;
            $commissionType = $settings?->commission_type ?? 'fixed_percentage';

            // Debit student wallet
            $studentTransaction = $this->debitWallet(
                $studentId,
                $amount,
                "Payment for booking #{$bookingId}",
                ['booking_id' => $bookingId, 'type' => 'booking_payment']
            );

            // Calculate commission based on type
            if ($commissionType === 'fixed_percentage') {
                $platformCommission = ($amount * $commissionRate) / 100;
            } else {
                // Fixed amount commission
                $platformCommission = min($commissionRate, $amount); // Don't exceed payment amount
            }
            
            $teacherEarnings = $amount - $platformCommission;

            // Credit teacher wallet
            $teacherTransaction = $this->creditWallet(
                $teacherId,
                $teacherEarnings,
                "Earnings from booking #{$bookingId}",
                ['booking_id' => $bookingId, 'type' => 'booking_earnings']
            );

            // Record platform earnings
            \App\Models\PlatformEarning::create([
                'transaction_id' => $studentTransaction->id,
                'booking_id' => $bookingId,
                'amount' => $platformCommission,
                'percentage' => $commissionType === 'fixed_percentage' ? $commissionRate : 0,
            ]);

            return [
                'student_transaction' => $studentTransaction,
                'teacher_transaction' => $teacherTransaction,
                'platform_commission' => $platformCommission,
                'teacher_earnings' => $teacherEarnings,
            ];
        });
    }
}
