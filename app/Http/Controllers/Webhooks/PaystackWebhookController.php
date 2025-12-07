<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Services\Payment\PaystackService;
use App\Models\Transaction;
use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    protected PaystackService $paystackService;
    protected WalletService $walletService;

    public function __construct(PaystackService $paystackService, WalletService $walletService)
    {
        $this->paystackService = $paystackService;
        $this->walletService = $walletService;
    }

    public function handle(Request $request)
    {
        // DEBUG LOGGING
        Log::info('Paystack webhook RAW content', ['content' => $request->getContent()]);
        Log::info('Paystack webhook ALL inputs', $request->all());

        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        $input = $request->getContent();

        if (!$this->paystackService->verifyWebhookSignature($signature, $input)) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        Log::info('Paystack webhook received', ['event' => $event, 'reference' => $data['reference'] ?? null]);

        try {
            switch ($event) {
                case 'charge.success':
                    $this->handleChargeSuccess($data);
                    break;

                case 'transfer.success':
                    $this->handleTransferSuccess($data);
                    break;

                case 'transfer.failed':
                    $this->handleTransferFailed($data);
                    break;

                case 'dedicatedaccount.assign.success':
                    $this->handleDedicatedAccountAssigned($data);
                    break;

                default:
                    Log::info('Unhandled Paystack webhook event', ['event' => $event]);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Paystack webhook processing failed', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Handle successful charge (payment)
     */
    protected function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'];
        $amount = $data['amount'] / 100; // Convert from kobo

        // Find pending transaction by reference
        $transaction = Transaction::where('gateway_reference', $reference)->first();

        if (!$transaction) {
            Log::warning('Transaction not found for Paystack charge', ['reference' => $reference]);
            return;
        }

        // IDEMPOTENCY CHECK: Skip if already processed
        if ($transaction->status === 'completed') {
            Log::info('Transaction already completed - skipping duplicate webhook', [
                'reference' => $reference,
                'transaction_id' => $transaction->id,
            ]);
            return;
        }

        // Mark transaction as completed
        $transaction->markAsCompleted();

        // If it's a wallet credit, update wallet balance
        // We check metadata or type to ensure it's a wallet funding transaction
        if ($transaction->type === 'credit' && isset($transaction->metadata['type']) && $transaction->metadata['type'] === 'wallet_credit') {
            
            // Get or create user wallet
            $wallet = $transaction->user->wallet ?? $transaction->user->wallet()->create(['balance' => 0]);
            
            // Increment balance
            $wallet->increment('balance', $amount);
            
            // Ensure transaction is linked to wallet if not already
            if (!$transaction->wallet_id) {
                $transaction->update(['wallet_id' => $wallet->id]);
            }
            
            Log::info('Wallet credited via webhook', [
                'reference' => $reference,
                'user_id' => $transaction->user_id,
                'amount' => $amount,
                'new_balance' => $wallet->fresh()->balance
            ]);

            // Broadcast real-time notification to user (Uncomment if event exists)
            // broadcast(new \App\Events\WalletCredited(
            //     $transaction->user_id,
            //     $amount,
            //     $wallet->balance,
            //     $transaction->payment_gateway ?? 'paystack',
            //     $reference
            // ))->toOthers();
        }

        Log::info('Paystack charge success processed', [
            'reference' => $reference,
            'transaction_id' => $transaction->id,
        ]);
    }

    /**
     * Handle successful transfer (payout)
     */
    protected function handleTransferSuccess(array $data): void
    {
        $reference = $data['reference'];

        // Find payout by reference
        $payout = Payout::where('gateway_reference', $reference)
            ->where('status', 'processing')
            ->first();

        if ($payout) {
            $payout->markAsCompleted();

            Log::info('Paystack transfer success processed', [
                'reference' => $reference,
                'payout_id' => $payout->id,
            ]);
        } else {
            Log::warning('Payout not found for Paystack transfer', ['reference' => $reference]);
        }
    }

    /**
     * Handle failed transfer (payout)
     */
    protected function handleTransferFailed(array $data): void
    {
        $reference = $data['reference'];

        // Find payout by reference
        $payout = Payout::where('gateway_reference', $reference)
            ->where('status', 'processing')
            ->first();

        if ($payout) {
            $payout->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);

            // Credit back teacher's wallet
            $this->walletService->creditWallet(
                $payout->teacher->user_id,
                $payout->amount,
                "Payout refund - Transfer failed",
                ['payout_id' => $payout->id, 'reason' => 'transfer_failed'],
                'paystack'
            );

            Log::warning('Paystack transfer failed processed', [
                'reference' => $reference,
                'payout_id' => $payout->id,
            ]);
        }
    }

    /**
     * Handle dedicated virtual account assignment
     */
    protected function handleDedicatedAccountAssigned(array $data): void
    {
        // Log for now, implement when virtual accounts are actively used
        Log::info('Dedicated account assigned', [
            'customer' => $data['customer']['customer_code'] ?? null,
            'account_number' => $data['dedicated_account']['account_number'] ?? null,
        ]);
    }
}
