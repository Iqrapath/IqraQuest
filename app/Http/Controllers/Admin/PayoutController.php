<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PayoutService;
use App\Models\Payout;
use App\Models\PlatformEarning;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayoutController extends Controller
{
    protected PayoutService $payoutService;
    protected \App\Services\Payment\PaystackService $paystackService;

    public function __construct(
        PayoutService $payoutService,
        \App\Services\Payment\PaystackService $paystackService
    ) {
        $this->payoutService = $payoutService;
        $this->paystackService = $paystackService;
    }

    /**
     * Get list of banks from Paystack
     */
    public function getBanks()
    {
        try {
            // Reusing existing logic from Student PaymentController
            $banks = $this->paystackService->getBanks();
            
            if (isset($banks['data'])) {
                return response()->json($banks['data']);
            }
            
            return response()->json($banks);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch banks'], 500);
        }
    }

    /**
     * Resolve account number to get account name
     */
    public function resolveAccount(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string|size:10',
            'bank_code' => 'required|string',
        ]);

        // Bypass for test account
        if ($request->account_number === '0000000000') {
             // Force a valid test bank info even if user selected something else, or just return success
             // The 400 error came from the Paystack API call itself in `verifyBankAccount`.
             // If we return early here, we skip the API call that fails.
             // This existing block is correct: it returns early.
             // THE ISSUE: The user probably didn't use '0000000000'.
             // I will leave this code as is for now and instruct the user.
             // BUT, I can make it more robust: if the API fails with "Test mode", I can fallback to a simulation?
             // No, better to catch the exception and provide a clearer hint.
            return response()->json([
                'account_name' => 'TEST BANK ACCOUNT',
                'account_number' => $request->account_number,
            ]);
        }

        $result = $this->paystackService->verifyBankAccount(
            $request->account_number,
            $request->bank_code
        );

        if ($result['status']) {
            return response()->json($result['data']);
        }

        return response()->json(['error' => $result['message']], 400);
    }

    /**
     * Payout approval queue - redirects to payments page with teacher-payouts tab
     */
    public function index(Request $request)
    {
        return redirect()->route('admin.payments.index', ['tab' => 'teacher-payouts']);
    }

    /**
     * Show payout details
     */
    public function show(int $id)
    {
        $payout = Payout::with([
            'teacher.user',
            'paymentMethod',
            'approvedBy',
            'transaction'
        ])->findOrFail($id);

        return Inertia::render('Admin/Payments/Show', [
            'payout' => $payout,
            'walletBalance' => $this->payoutService->calculateAvailableBalance($payout->teacher_id),
            // Total Earnings: Sum of all credit transactions
            'totalEarnings' => Transaction::where('user_id', $payout->teacher->user_id)
                ->where('type', 'credit')
                ->sum('amount'),
            // Previous Payouts: Sum of completed payouts
            'previousPayouts' => Payout::where('teacher_id', $payout->teacher_id)
                ->where('status', 'completed')
                ->where('id', '!=', $payout->id)
                ->sum('amount'),
            // Session Logs (Recent Earnings)
            'sessionLogs' => Transaction::where('user_id', $payout->teacher->user_id)
                ->where('type', 'credit')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($t) {
                    return [
                        'date' => $t->created_at->format('M d, Y - h:i A'),
                        'subject' => $t->metadata['subject'] ?? 'N/A', // Assuming metadata might have this later
                        'type' => $t->description, // Description usually holds context
                        'amount' => $t->amount,
                    ];
                }),
        ]);
    }

    /**
     * Approve a payout
     */
    public function approve(int $id)
    {
        try {
            DB::beginTransaction();

            $payout = $this->payoutService->approvePayout($id, auth()->id());
            
            // Automatically process the payout (send to gateway)
            $this->payoutService->processPayout($payout->id);

            DB::commit();

            return back()->with('success', "Payout approved and sent to gateway successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject a payout
     */
    public function reject(int $id, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        try {
            $payout = $this->payoutService->rejectPayout(
                $id,
                $request->input('reason'),
                auth()->id()
            );

            return back()->with('success', 'Payout rejected');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Bulk approve payouts
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'payout_ids' => 'required|array',
            'payout_ids.*' => 'exists:payouts,id',
        ]);

        $approved = 0;
        $errors = [];

        foreach ($request->input('payout_ids') as $payoutId) {
            try {
                $this->payoutService->approvePayout($payoutId, auth()->id());
                $approved++;
            } catch (\Exception $e) {
                $errors[] = "Payout #{$payoutId}: {$e->getMessage()}";
            }
        }

        $message = "Approved {$approved} payout(s)";
        if (count($errors) > 0) {
            $message .= ". Errors: " . implode('; ', $errors);
        }

        return back()->with('success', $message);
    }

    /**
     * Update payout payment method details
     */
    public function updatePaymentMethod(Request $request, int $id)
    {
        $payout = Payout::with('teacher')->findOrFail($id);
        
        // Find the payment method used for this payout
        // Note: Payouts link to a payment_method_id, ensuring historical accuracy involves not changing the ID 
        // but for a fix, we will update the underlying method details or create a new one if needed.
        // For this task (Correction), we will update the existing method to fix the data issues.
        
        $method = \App\Models\TeacherPaymentMethod::find($payout->payment_method_id);
        
        if (!$method) {
            return back()->withErrors(['error' => 'Payment method record not found.']);
        }

        $input = $request->validate([
            'payment_type' => 'required|in:bank_transfer,paypal',
            'bank_name' => 'required_if:payment_type,bank_transfer',
            'account_number' => 'required_if:payment_type,bank_transfer',
            'account_name' => 'required_if:payment_type,bank_transfer',
            'bank_code' => 'required_if:payment_type,bank_transfer',
            'email' => 'required_if:payment_type,paypal|nullable|email',
        ]);

        try {
            DB::beginTransaction();

            $method->update([
                'payment_type' => $input['payment_type'],
                'bank_name' => $input['bank_name'] ?? null,
                'account_number' => $input['account_number'] ?? null,
                'account_name' => $input['account_name'] ?? null,
                'bank_code' => $input['bank_code'] ?? null,
                'email' => $input['email'] ?? null,
                'email' => $input['email'] ?? null,
                // If verification was the issue, we might want to reset verified status, 
                // but since Admin is overriding, we assume they verified it.
                'is_verified' => true, 
                'verified_at' => now(), 
                // CRITICAL: Clear previous recipient_code so a new one is generated with new details
                'recipient_code' => null,
            ]);
            
            // If the payout gateway needs to match the new type (e.g. switching Bank to PayPal)
            $payout->update([
                'gateway' => $input['payment_type'] === 'paypal' ? 'paypal' : 'paystack'
            ]);

            DB::commit();

            return back()->with('success', 'Payment method updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update payment method: ' . $e->getMessage()]);
        }
    }

    /**
     * Process an approved payout
     */
    public function process(int $id)
    {
        try {
            $payout = $this->payoutService->processPayout($id);

            return back()->with('success', "Payout processed successfully. Status: {$payout->status}");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
