<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Models\Transaction;
use App\Models\PlatformEarning;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EarningsController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Earnings dashboard
     */
    public function index()
    {
        $teacher = auth()->user()->teacher;
        $userId = auth()->id();

        // Get wallet balance
        $balance = $this->walletService->getBalance($userId);

        // Calculate available balance (minus pending payouts)
        $pendingPayouts = $teacher->payouts()
            ->whereIn('status', ['pending', 'approved', 'processing'])
            ->sum('amount');
        
        $availableBalance = max(0, $balance - $pendingPayouts);

        // Get earnings stats
        $totalEarnings = Transaction::where('user_id', $userId)
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');

        $thisMonthEarnings = Transaction::where('user_id', $userId)
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        // Get earnings chart data (last 6 months)
        $earningsChart = $this->getEarningsChartData($userId);

        // Recent transactions
        $recentTransactions = $this->walletService->getTransactionHistory($userId, [
            'per_page' => 5,
        ]);

        return Inertia::render('Teacher/Earnings/Index', [
            'balance' => $balance,
            'availableBalance' => $availableBalance,
            'pendingPayouts' => $pendingPayouts,
            'totalEarnings' => $totalEarnings,
            'thisMonthEarnings' => $thisMonthEarnings,
            'earningsChart' => $earningsChart,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * Get earnings chart data
     */
    protected function getEarningsChartData(int $userId): array
    {
        $data = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthEarnings = Transaction::where('user_id', $userId)
                ->where('type', 'credit')
                ->where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('amount');

            $data[] = [
                'month' => $date->format('M Y'),
                'earnings' => (float) $monthEarnings,
            ];
        }

        return $data;
    }

    /**
     * Get full transaction history
     */
    public function transactions(Request $request)
    {
        $userId = auth()->id();
        
        $filters = [
            'type' => $request->input('type'),
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
            'per_page' => $request->input('per_page', 20),
        ];

        $transactions = $this->walletService->getTransactionHistory($userId, $filters);

        return Inertia::render('Teacher/Earnings/Transactions', [
            'transactions' => $transactions,
            'filters' => $filters,
        ]);
    }

    /**
     * Export earnings report
     */
    public function exportReport(Request $request)
    {
        $userId = auth()->id();
        $month = $request->input('month', now()->format('Y-m'));
        
        [$year, $monthNum] = explode('-', $month);

        // Get transactions for the month
        $transactions = Transaction::where('user_id', $userId)
            ->where('type', 'credit')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $monthNum)
            ->orderBy('created_at')
            ->get();

        $totalEarnings = $transactions->sum('amount');

        // Calculate platform commission
        $platformCommissionTotal = PlatformEarning::whereIn('transaction_id', $transactions->pluck('id'))
            ->sum('amount');

        $csv = "IqraQuest Earnings Report - {$month}\n\n";
        $csv .= "Date,Description,Amount,Status\n";

        foreach ($transactions as $transaction) {
            $csv .= sprintf(
                "%s,%s,%s,%s\n",
                $transaction->created_at->format('Y-m-d H:i'),
                str_replace(',', ';', $transaction->description ?? ''),
                number_format($transaction->amount, 2),
                $transaction->status
            );
        }

        $csv .= "\n";
        $csv .= "Total Earnings,₦" . number_format($totalEarnings, 2) . "\n";
        $csv .= "Platform Commission,₦" . number_format($platformCommissionTotal, 2) . "\n";
        $csv .= "Net Earnings,₦" . number_format($totalEarnings - $platformCommissionTotal, 2) . "\n";

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"earnings-{$month}.csv\"");
    }
}
