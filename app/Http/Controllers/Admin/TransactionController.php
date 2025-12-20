<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * List all transactions
     */
    public function index(Request $request)
    {
        $query = Transaction::with('user');

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('gateway')) {
            $query->where('payment_gateway', $request->input('gateway'));
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('gateway_reference', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate(20);

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'status', 'gateway', 'from_date', 'to_date', 'search']),
            'pageTitle' => 'Transaction Management',
        ]);
    }

    /**
     * Show transaction details
     */
    public function show(int $id)
    {
        $transaction = Transaction::with(['user', 'wallet', 'transactionable'])->findOrFail($id);

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Issue a refund
     */
    public function refund(int $id, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        $transaction = Transaction::findOrFail($id);

        if ($transaction->type !== 'debit' && $transaction->status !== 'completed') {
            return back()->withErrors(['error' => 'Only completed debit transactions can be refunded']);
        }

        try {
            // Credit back the user's wallet
            $refund = $this->walletService->creditWallet(
                $transaction->user_id,
                $transaction->amount,
                "Refund: {$request->input('reason')}",
                [
                    'original_transaction_id' => $transaction->id,
                    'type' => 'refund',
                    'reason' => $request->input('reason'),
                ]
            );

            return back()->with('success', "Refund of ₦{$transaction->amount} issued successfully");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Export transactions
     */
    public function export(Request $request)
    {
        $query = Transaction::with('user');

        // Apply same filters as index
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $transactions = $query->latest()->get();

        $csv = "Date,User,Type,Amount,Status,Gateway,Reference,Description\n";

        foreach ($transactions as $transaction) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s\n",
                $transaction->created_at->format('Y-m-d H:i:s'),
                $transaction->user->name ?? 'N/A',
                $transaction->type,
                number_format($transaction->amount, 2),
                $transaction->status,
                $transaction->payment_gateway ?? 'N/A',
                $transaction->gateway_reference ?? 'N/A',
                str_replace(',', ';', $transaction->description ?? '')
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="transactions-' . now()->format('Y-m-d') . '.csv"');
    }
}
