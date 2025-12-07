<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Services\Payment\PaystackService;
use App\Services\Payment\PayPalService;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Http\Request;
use Inertia\Inertia;


class WalletController extends Controller
{
    /**
     * Update wallet currency
     */
    public function updateCurrency(Request $request)
    {
        $request->validate([
            'currency' => 'required|in:NGN,USD',
        ]);

        $user = auth()->user();
        
        // Ensure wallet exists
        if (!$user->wallet) {
            $user->wallet()->create(['balance' => 0]);
        }

        $user->wallet->update([
            'currency' => $request->input('currency'),
        ]);

        return response()->json([
            'status' => 'success',
            'currency' => $request->input('currency')
        ]);
    }
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
     * Wallet dashboard
     */
    public function index()
    {
        $userId = auth()->id();
        $userRole = auth()->user()->role;
        $userRole = $userRole instanceof \BackedEnum ? $userRole->value : $userRole;
        $balance = $this->walletService->getBalance($userId);
        
        // Get recent transactions
        $transactions = $this->walletService->getTransactionHistory($userId, [
            'per_page' => 10,
        ]);

        // Get available gateways
        $gateways = PaymentGatewayFactory::available();

        // Determine view path based on role
        $viewPath = match($userRole) {
            'student' => 'Student/Wallet/Index',
            'guardian' => 'Guardian/Wallet/Index',
            'teacher' => 'Teacher/Wallet/Index',
            default => 'Student/Wallet/Index',
        };

        // Get saved payment methods
        $paymentMethods = [];
        $student = auth()->user()->student;
        $guardian = auth()->user()->guardian;
        
        if ($student) {
             $paymentMethods = \App\Models\StudentPaymentMethod::where('student_id', $student->id)
                ->orderBy('is_primary', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($guardian) {
             $paymentMethods = \App\Models\GuardianPaymentMethod::where('guardian_id', $guardian->id)
                ->orderBy('is_primary', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render($viewPath, [
            'balance' => $balance,
            'currency' => auth()->user()->wallet->currency ?? 'NGN',
            'transactions' => $transactions,
            'paymentMethods' => $paymentMethods,
            'gateways' => $gateways,
            'paystack_public_key' => config('services.paystack.public_key'),
        ]);
    }

    /**
     * Show credit wallet page
     */
    public function creditWallet()
    {
        $userRole = auth()->user()->role;
        $userRole = $userRole instanceof \BackedEnum ? $userRole->value : $userRole;
        $gateways = PaymentGatewayFactory::available();

        // Determine view path based on role
        $viewPath = match($userRole) {
            'student' => 'Student/Wallet/CreditWallet',
            'guardian' => 'Guardian/Wallet/CreditWallet',
            'teacher' => 'Teacher/Wallet/CreditWallet',
            default => 'Student/Wallet/CreditWallet',
        };

        return Inertia::render($viewPath, [
            'gateways' => $gateways,
        ]);
    }

    /**
     * Get transaction history
     */
    public function transactions(Request $request)
    {
        $userId = auth()->id();
        $userRole = auth()->user()->role;
        $userRole = $userRole instanceof \BackedEnum ? $userRole->value : $userRole;
        
        $filters = [
            'type' => $request->input('type'),
            'status' => $request->input('status'),
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
            'per_page' => $request->input('per_page', 20),
        ];

        $transactions = $this->walletService->getTransactionHistory($userId, $filters);

        // Determine view path based on role
        $viewPath = match($userRole) {
            'student' => 'Student/Wallet/Transactions',
            'guardian' => 'Guardian/Wallet/Transactions',
            'teacher' => 'Teacher/Wallet/Transactions',
            default => 'Student/Wallet/Transactions',
        };

        return Inertia::render($viewPath, [
            'transactions' => $transactions,
            'filters' => $filters,
        ]);
    }

    /**
     * Export transactions as CSV
     */
    public function exportTransactions(Request $request)
    {
        $userId = auth()->id();
        
        $filters = [
            'type' => $request->input('type'),
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
        ];

        $transactions = $this->walletService->getTransactionHistory($userId, array_merge($filters, [
            'per_page' => 10000, // Get all for export
        ]));

        $csv = $this->generateTransactionsCsv($transactions->items());

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="transactions-' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Generate CSV from transactions
     */
    protected function generateTransactionsCsv($transactions): string
    {
        $csv = "Date,Type,Description,Amount,Status,Gateway\n";

        foreach ($transactions as $transaction) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s\n",
                $transaction->created_at->format('Y-m-d H:i:s'),
                $transaction->type,
                str_replace(',', ';', $transaction->description ?? ''),
                $transaction->amount,
                $transaction->status,
                $transaction->payment_gateway ?? 'N/A'
            );
        }

        return $csv;
    }
}
