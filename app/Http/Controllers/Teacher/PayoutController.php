<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Services\PayoutService;
use App\Models\Payout;
use App\Models\TeacherPaymentMethod;
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
     * List payout history
     */
    public function index(Request $request)
    {
        $teacher = auth()->user()->teacher;
        
        $query = $teacher->payouts()->with('paymentMethod');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $payouts = $query->latest('requested_at')->paginate(20);

        // Get available balance
        $availableBalance = $this->payoutService->calculateAvailableBalance($teacher->id);

        return Inertia::render('Teacher/Payouts/Index', [
            'payouts' => $payouts,
            'availableBalance' => $availableBalance,
        ]);
    }

    /**
     * Show request payout form
     */
    public function create()
    {
        $teacher = auth()->user()->teacher;
        
        // Get available balance
        $availableBalance = $this->payoutService->calculateAvailableBalance($teacher->id);

        // Get verified payment methods
        $paymentMethods = $teacher->paymentMethods()
            ->where('is_verified', true)
            ->get();

        $minimumPayout = config('services.payout.minimum_amount', 5000);

        return Inertia::render('Teacher/Payouts/Create', [
            'availableBalance' => $availableBalance,
            'paymentMethods' => $paymentMethods,
            'minimumPayout' => $minimumPayout,
        ]);
    }

    /**
     * Submit payout request
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'payment_method_id' => 'required|exists:teacher_payment_methods,id',
        ]);

        $teacher = auth()->user()->teacher;

        try {
            $payout = $this->payoutService->requestPayout(
                $teacher->id,
                $request->input('amount'),
                $request->input('payment_method_id')
            );

            return redirect()
                ->route('teacher.payouts.show', $payout->id)
                ->with('success', 'Payout request submitted successfully!');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show payout details
     */
    public function show(int $id)
    {
        $teacher = auth()->user()->teacher;
        
        $payout = $teacher->payouts()
            ->with(['paymentMethod', 'approvedBy'])
            ->findOrFail($id);

        return Inertia::render('Teacher/Payouts/Show', [
            'payout' => $payout,
        ]);
    }

    /**
     * Cancel pending payout
     */
    public function cancel(int $id)
    {
        $teacher = auth()->user()->teacher;
        
        $payout = $teacher->payouts()->findOrFail($id);

        if (!$payout->canBeCancelled()) {
            return back()->withErrors(['error' => 'This payout cannot be cancelled']);
        }

        $payout->update(['status' => 'cancelled']);

        return redirect()
            ->route('teacher.payouts.index')
            ->with('success', 'Payout request cancelled successfully');
    }
}
