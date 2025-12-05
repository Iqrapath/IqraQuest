<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PayoutService;
use App\Models\Payout;
use App\Models\PlatformEarning;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayoutController extends Controller
{
    protected PayoutService $payoutService;

    public function __construct(PayoutService $payoutService)
    {
        $this->payoutService = $payoutService;
    }

    /**
     * Payout approval queue
     */
    public function index(Request $request)
    {
        $status = $request->input('status', 'pending');

        $query = Payout::with(['teacher.user', 'paymentMethod']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $payouts = $query->latest('requested_at')->paginate(20);

        // Get statistics
        $stats = [
            'pending_count' => Payout::where('status', 'pending')->count(),
            'pending_amount' => Payout::where('status', 'pending')->sum('amount'),
            'approved_count' => Payout::where('status', 'approved')->count(),
            'approved_amount' => Payout::where('status', 'approved')->sum('amount'),
            'processing_count' => Payout::where('status', 'processing')->count(),
        ];

        return Inertia::render('Admin/Payouts/Index', [
            'payouts' => $payouts,
            'stats' => $stats,
            'currentStatus' => $status,
        ]);
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

        return Inertia::render('Admin/Payouts/Show', [
            'payout' => $payout,
        ]);
    }

    /**
     * Approve a payout
     */
    public function approve(int $id)
    {
        try {
            $payout = $this->payoutService->approvePayout($id, auth()->id());

            return back()->with('success', "Payout approved successfully. Total: ₦{$payout->amount}");
        } catch (\Exception $e) {
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
