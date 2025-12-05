<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Services\Payment\PaystackService;
use App\Services\Payment\PayPalService;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected WalletService $walletService;
    protected PaystackService $paystackService;
    protected PayPalService $payPalService;

    public function __construct(
        WalletService $walletService,
        PaystackService $paystackService,
        PayPalService $payPalService
    ) {
        $this->walletService = $walletService;
        $this->paystackService = $paystackService;
        $this->payPalService = $payPalService;
    }

    /**
     * Initialize payment
     */
    public function initializePayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'gateway' => 'required|in:paystack,paypal',
            'usd_amount' => 'required_if:gateway,paypal|numeric|min:1',
            'exchange_rate' => 'nullable|numeric',
        ]);

        $user = auth()->user();
        $amount = $request->input('amount'); // NGN amount (base currency)
        $gateway = $request->input('gateway');
        $reference = 'WAL-' . Str::upper(Str::random(10));

        // Create pending transaction in NGN (our base currency)
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'credit',
            'amount' => $amount,
            'currency' => 'NGN',
            'status' => 'pending',
            'payment_gateway' => $gateway,
            'gateway_reference' => $reference,
            'description' => 'Wallet credit',
            'metadata' => ['type' => 'wallet_credit'],
        ]);

        if ($gateway === 'paystack') {
            $result = $this->paystackService->initializeCardPayment(
                $user->email,
                $amount,
                $reference,
                ['user_id' => $user->id, 'transaction_id' => $transaction->id]
            );

            if ($result['status']) {
                return response()->json([
                    'status' => 'success',
                    'authorization_url' => $result['authorization_url'],
                    'reference' => $reference,
                ]);
            }
        } elseif ($gateway === 'paypal') {
            // Frontend converts NGN to USD and sends both amounts
            $usdAmount = $request->input('usd_amount');
            $exchangeRate = $request->input('exchange_rate');

            // Store conversion metadata for audit trail
            $transaction->update([
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'usd_amount' => $usdAmount,
                    'exchange_rate' => $exchangeRate,
                    'conversion_source' => 'frontend_currency_context',
                    'converted_at' => now()->toIso8601String(),
                ])
            ]);

            $result = $this->payPalService->createOrder(
                $usdAmount,
                'USD',
                $reference
            );

            if ($result['status']) {
                return response()->json([
                    'status' => 'success',
                    'approval_url' => $result['approval_url'],
                    'order_id' => $result['order_id'],
                    'converted_amount' => $usdAmount,
                    'exchange_rate' => $exchangeRate,
                ]);
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => $result['message'] ?? 'Payment initialization failed',
        ], 400);
    }

    /**
     * Handle payment callback from gateway
     */
    public function callback(Request $request)
    {
        $gateway = $request->input('gateway', 'paystack');
        $reference = $request->input('reference');
        $walletRoute = $this->getUserWalletRoute();

        if ($gateway === 'paystack') {
            $result = $this->paystackService->verifyPayment($reference);

            if ($result['status'] && $result['data']['status'] === 'success') {
                // Find transaction
                $transaction = Transaction::where('gateway_reference', $reference)->first();

                if ($transaction && $transaction->status === 'pending') {
                    // Just mark as completed - webhook will handle wallet credit
                    $transaction->markAsCompleted();

                    return redirect()->route($walletRoute)
                        ->with('success', 'Payment confirmed! Your wallet will be credited shortly.');
                }
            }

            return redirect()->route($walletRoute)->with('error', 'Payment verification failed');
        } elseif ($gateway === 'paypal') {
            $orderId = $request->input('token');
            
            if ($orderId) {
                $result = $this->payPalService->captureOrder($orderId);

                if ($result['status']) {
                    // Find transaction
                    $transaction = Transaction::where('gateway_reference', $reference)->first();

                    if ($transaction && $transaction->status === 'pending') {
                        // Just mark as completed - webhook will handle wallet credit  
                        $transaction->markAsCompleted();

                        return redirect()->route($walletRoute)
                            ->with('success', 'Payment confirmed! Your wallet will be credited shortly.');
                    }
                }
            }

            return redirect()->route($walletRoute)->with('error', 'Payment failed');
        }

        return redirect()->route($walletRoute);
    }

    /**
     * Get wallet route based on user role
     */
    protected function getUserWalletRoute(): string
    {
        $role = auth()->user()->role;
        
        return match($role) {
            'student' => 'student.wallet',
            'guardian' => 'guardian.wallet',
            'teacher' => 'teacher.wallet',
            default => 'student.wallet',
        };
    }

    /**
     * Verify payment status (AJAX)
     */
    public function verifyPayment(string $reference)
    {
        $transaction = Transaction::where('gateway_reference', $reference)->first();

        if (!$transaction) {
            return response()->json(['status' => 'not_found'], 404);
        }

        if ($transaction->status === 'completed') {
            return response()->json([
                'status' => 'success',
                'transaction' => $transaction,
            ]);
        }

        // Check with gateway
        if ($transaction->payment_gateway === 'paystack') {
            $result = $this->paystackService->verifyPayment($reference);

            if ($result['status'] && $result['data']['status'] === 'success') {
                $transaction->markAsCompleted();

                return response()->json([
                    'status' => 'success',
                    'transaction' => $transaction->fresh(),
                ]);
            }
        }

        return response()->json([
            'status' => $transaction->status,
            'transaction' => $transaction,
        ]);
    }
}
