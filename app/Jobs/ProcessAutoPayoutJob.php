<?php

namespace App\Jobs;

use App\Models\Teacher;
use App\Models\Payout;
use App\Models\PaymentSetting;
use App\Services\PayoutService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessAutoPayoutJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    /**
     * The teacher ID to process payout for.
     */
    protected int $teacherId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $teacherId)
    {
        $this->teacherId = $teacherId;
    }

    /**
     * Execute the job.
     */
    public function handle(PayoutService $payoutService): void
    {
        try {
            // Use database lock to prevent race conditions
            DB::transaction(function () use ($payoutService) {
                // Lock teacher record
                $teacher = Teacher::lockForUpdate()->find($this->teacherId);

                if (!$teacher) {
                    Log::warning("Auto-payout job: Teacher {$this->teacherId} not found");
                    return;
                }

                // 1. Check if automatic payouts are enabled
                if (!$teacher->automatic_payouts) {
                    Log::info("Auto-payout job: Teacher {$teacher->id} has automatic payouts disabled");
                    return;
                }

                // 2. Check if already has pending/processing payout
                $hasPendingPayout = Payout::where('teacher_id', $teacher->id)
                    ->whereIn('status', ['pending', 'approved', 'processing'])
                    ->exists();

                if ($hasPendingPayout) {
                    Log::info("Auto-payout job: Teacher {$teacher->id} already has pending payout");
                    return;
                }

                // 3. Check daily limit (24 hours since last payout request)
                if ($teacher->last_payout_requested_at && 
                    $teacher->last_payout_requested_at->gt(now()->subDay())) {
                    Log::info("Auto-payout job: Teacher {$teacher->id} already requested payout today");
                    return;
                }

                // 4. Get payment settings
                $settings = PaymentSetting::first();
                $autoPayoutThreshold = $settings?->auto_payout_threshold ?? 50000;
                $minimumPayout = $settings?->min_withdrawal_amount ?? 10000;

                // 5. Calculate available balance
                $balance = $payoutService->calculateAvailableBalance($teacher->id);

                // 6. Check minimum payout
                if ($balance < $minimumPayout) {
                    Log::info("Auto-payout job: Teacher {$teacher->id} balance (₦{$balance}) below minimum (₦{$minimumPayout})");
                    return;
                }

                // 7. Check auto-payout threshold
                if ($balance < $autoPayoutThreshold) {
                    Log::info("Auto-payout job: Teacher {$teacher->id} balance (₦{$balance}) below threshold (₦{$autoPayoutThreshold})");
                    return;
                }

                // 8. Check for verified payment method
                $paymentMethod = $teacher->paymentMethods()
                    ->where('is_verified', true)
                    ->first();

                if (!$paymentMethod) {
                    Log::warning("Auto-payout job: Teacher {$teacher->id} has no verified payment method");
                    return;
                }

                Log::info("Auto-payout job: Processing payout for Teacher {$teacher->id}, Amount: ₦{$balance}");

                // 9. Create payout request
                $payout = $payoutService->requestPayout($teacher->id, $balance, $paymentMethod->id);

                // 10. Auto-approve (system approval)
                $payoutService->approvePayout($payout->id, null);

                // 11. Process payout (send to gateway) - this may throw exception if fails
                try {
                    $payoutService->processPayout($payout->id);
                    
                    // 12. If we reach here, payout was successful
                    // Update teacher's last auto-payout timestamp
                    $teacher->update(['last_auto_payout_at' => now()]);
                    
                    // 13. Send success notification to teacher
                    $payout->refresh(); // Get latest status
                    if ($payout->status === 'completed') {
                        Log::info("Auto-payout job: Sending success notification to teacher user ID {$teacher->user_id}");
                        $teacher->user->notify(new \App\Notifications\AutoPayoutProcessedNotification($payout));
                        Log::info("Auto-payout job: Success notification sent");
                    }
                    
                    Log::info("Auto-payout job: Successfully processed payout ID {$payout->id} for Teacher {$teacher->id}");
                } catch (\Exception $payoutException) {
                    // Payout processing failed (e.g., Paystack error)
                    Log::error("Auto-payout job: Payout processing failed for Teacher {$teacher->id}: " . $payoutException->getMessage());
                    
                    // Re-throw to trigger job retry and failure notification
                    throw $payoutException;
                }
            });
        } catch (\Exception $e) {
            Log::error("Auto-payout job failed for Teacher {$this->teacherId}: " . $e->getMessage(), [
                'exception' => $e,
                'teacher_id' => $this->teacherId,
            ]);

            // Re-throw to trigger retry logic
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Auto-payout job permanently failed for Teacher {$this->teacherId}", [
            'exception' => $exception->getMessage(),
            'teacher_id' => $this->teacherId,
        ]);

        // Notify all admin users about failed auto-payout
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\AutoPayoutFailedNotification(
                $this->teacherId,
                $exception->getMessage()
            ));
        }
    }
}
