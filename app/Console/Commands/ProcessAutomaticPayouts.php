<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Teacher;
use App\Services\PayoutService;
use Illuminate\Support\Facades\Log;

class ProcessAutomaticPayouts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payouts:process-automatic';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process automatic payouts for eligible teachers';

    /**
     * Execute the console command.
     */
    public function handle(PayoutService $payoutService)
    {
        $this->info('Starting automatic payout processing...');

        $teachers = Teacher::where('automatic_payouts', true)->get();
        $count = 0;
        $errors = 0;

        foreach ($teachers as $teacher) {
            try {
                // 1. Check if teacher has a verified payment method
                // ideally getting the default or first verified one
                $paymentMethod = $teacher->paymentMethods()
                    ->where('is_verified', true)
                    ->first();

                if (!$paymentMethod) {
                    $this->warn("Teacher ID {$teacher->id} has auto-payout enabled but no verified payment method. Skipping.");
                    continue;
                }

                // 2. Calculate Available Balance
                $balance = $payoutService->calculateAvailableBalance($teacher->id);
                $minimumPayout = config('services.payout.minimum_amount', 5000);

                if ($balance < $minimumPayout) {
                    // Not enough funds, skip silently
                    continue;
                }

                $this->info("Processing payout for Teacher ID {$teacher->id}: Amount ₦{$balance}");

                // 3. Create Payout Request
                // We request the FULL available balance for auto-payouts
                $payout = $payoutService->requestPayout($teacher->id, $balance, $paymentMethod->id);

                // 4. Auto-Approve (System Approval)
                $payoutService->approvePayout($payout->id, 0); // 0 or null for System

                // 5. Process Payout (Trigger Gateway)
                $payoutService->processPayout($payout->id);

                $this->info("Payout ID {$payout->id} processed successfully.");
                $count++;

            } catch (\Exception $e) {
                $this->error("Failed to process payout for Teacher ID {$teacher->id}: " . $e->getMessage());
                Log::error("Auto-payout failed for Teacher {$teacher->id}", ['exception' => $e]);
                $errors++;
            }
        }

        $this->info("Automatic payout processing completed. Processed: {$count}, Errors: {$errors}");
    }
}
