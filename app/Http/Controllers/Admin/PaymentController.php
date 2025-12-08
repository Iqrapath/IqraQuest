<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Main Payment Management Dashboard
     */
    public function index(Request $request)
    {
        $activeTab = $request->input('tab', 'teacher-payouts');
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $data = [
            'activeTab' => $activeTab,
            'filters' => $request->only(['status', 'search', 'payment_method', 'date_range']),
        ];

        // Load data based on active tab
        if ($activeTab === 'teacher-payouts') {
            $query = Payout::with(['teacher.user', 'paymentMethod']);

            // 1. Filter by Search (Teacher Name or Email)
            if ($search) {
                $query->whereHas('teacher.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // 2. Filter by Status
            if ($status !== 'all') {
                $query->where('status', $status);
            }

            // 3. Filter by Payment Method (Optional)
            if ($request->filled('payment_method') && $request->payment_method !== 'all') {
                $method = $request->payment_method;
                if ($method === 'Bank Transfer') {
                     $query->where('gateway', 'paystack');
                } elseif ($method === 'PayPal') {
                     $query->where('gateway', 'paypal');
                }
            }

             // 4. Date Range
             if ($request->filled('date_range') && $request->date_range !== 'all') {
                $range = $request->date_range;
                
                if ($range === 'last_7_days') {
                    $query->where('requested_at', '>=', now()->subDays(7));
                } elseif ($range === 'last_30_days') {
                     $query->where('requested_at', '>=', now()->subDays(30));
                } elseif ($range === 'this_month') {
                     $query->whereMonth('requested_at', now()->month)
                           ->whereYear('requested_at', now()->year);
                } elseif ($range === 'last_month') {
                     $query->whereMonth('requested_at', now()->subMonth()->month)
                           ->whereYear('requested_at', now()->subMonth()->year);
                }
             }

            $payouts = $query->latest('requested_at')->paginate(20)->withQueryString();

            $data['payouts'] = $payouts;
            
            $data['stats'] = [
                'pending_count' => Payout::where('status', 'pending')->count(),
            ];
        } 
        elseif ($activeTab === 'student-payments') {
            // Placeholder
            $data['studentPayments'] = [];
        }
        elseif ($activeTab === 'payment-settings') {
             // Fetch first row or default
             $data['paymentSettings'] = PaymentSetting::firstOrNew([], [
                'commission_rate' => 10.00,
                'commission_type' => 'fixed_percentage',
                'auto_payout_threshold' => 50000.00,
                'min_withdrawal_amount' => 10000.00,
                'bank_verification_enabled' => true,
                'apply_time' => 'set_now',
             ]);
        }

        return Inertia::render('Admin/Payments/Index', $data);
    }

    /**
     * Update Payment Settings
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0',
            'commission_type' => 'required|in:fixed_percentage,fixed_amount',
            'auto_payout_threshold' => 'required|numeric|min:0',
            'min_withdrawal_amount' => 'required|numeric|min:0',
            'bank_verification_enabled' => 'boolean',
            'withdrawal_note' => 'nullable|string',
            'apply_time' => 'required|in:set_now,schedule',
        ]);

        $settings = PaymentSetting::first();
        if (!$settings) {
            $settings = new PaymentSetting();
        }

        $settings->fill($validated);
        $settings->save();

        return redirect()->back()->with('success', 'Payment settings updated successfully.');
    }
}
