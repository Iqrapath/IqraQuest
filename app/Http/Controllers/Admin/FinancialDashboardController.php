<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Payout;
use App\Models\PlatformEarning;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinancialDashboardController extends Controller
{
    /**
     * Financial overview dashboard
     */
    public function index()
    {
        // Total revenue (all completed transactions)
        $totalRevenue = Transaction::where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');

        // This month's revenue
        $thisMonthRevenue = Transaction::where('type', 'credit')
            ->where('status', 'completed')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        // Platform earnings (commissions)
        $totalPlatformEarnings = PlatformEarning::sum('amount');

        $thisMonthPlatformEarnings = PlatformEarning::whereHas('transaction', function($query) {
            $query->whereYear('created_at', now()->year)
                  ->whereMonth('created_at', now()->month);
        })->sum('amount');

        // Payouts
        $pendingPayouts = Payout::where('status', 'pending')->sum('amount');
        $completedPayoutsThisMonth = Payout::where('status', 'completed')
            ->whereYear('processed_at', now()->year)
            ->whereMonth('processed_at', now()->month)
            ->sum('amount');

        // Recent transactions
        $recentTransactions = Transaction::with('user')
            ->latest()
            ->take(10)
            ->get();

        // Revenue chart (last 6 months)
        $revenueChart = $this->getRevenueChartData();

        return Inertia::render('Admin/Financial/Dashboard', [
            'totalRevenue' => $totalRevenue,
            'thisMonthRevenue' => $thisMonthRevenue,
            'totalPlatformEarnings' => $totalPlatformEarnings,
            'thisMonthPlatformEarnings' => $thisMonthPlatformEarnings,
            'pendingPayouts' => $pendingPayouts,
            'completedPayoutsThisMonth' => $completedPayoutsThisMonth,
            'recentTransactions' => $recentTransactions,
            'revenueChart' => $revenueChart,
        ]);
    }

    /**
     * Get revenue chart data for last 6 months
     */
    protected function getRevenueChartData(): array
    {
        $data = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            
            $revenue = Transaction::where('type', 'credit')
                ->where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('amount');

            $commission = PlatformEarning::whereHas('transaction', function($query) use ($date) {
                $query->whereYear('created_at', $date->year)
                      ->whereMonth('created_at', $date->month);
            })->sum('amount');

            $data[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
                'commission' => (float) $commission,
            ];
        }

        return $data;
    }
}
