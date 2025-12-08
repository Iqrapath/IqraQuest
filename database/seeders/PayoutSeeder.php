<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Teacher;
use App\Models\Payout;
use App\Models\TeacherPaymentMethod;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PayoutSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = Teacher::all();

        if ($teachers->isEmpty()) {
            $this->command->info('No teachers found. Creating some...');
            // Optional: Create generic teachers if none exist, but prefer using existing ones.
            return;
        }

        $admin = User::where('role', 'admin')->first();
        $adminId = $admin ? $admin->id : 1; 
        
        // Inject WalletService manually since Seeders don't support effortless DI in run() usually, 
        // but we can resolve it.
        $walletService = app(\App\Services\WalletService::class);

        foreach ($teachers as $teacher) {
            // Ensure teacher has enough balance to cover payouts
            // Credit 10,000,000 NGN to be safe
            $walletService->creditWallet(
                $teacher->user_id,
                10000000, 
                "Seeded Funds for Payout Testing",
                ['is_seeded' => true]
            );

            // Get or Create Payment Method
            // Get or Create Payment Method
            $method = $teacher->paymentMethods()->first();

            if (!$method) {
                // Skews: 80% Bank, 20% PayPal
                $type = rand(1, 100) <= 80 ? 'bank_transfer' : 'paypal';
                
                $method = TeacherPaymentMethod::create([
                    'teacher_id' => $teacher->id,
                    'payment_type' => $type,
                    'is_primary' => true,
                    'is_verified' => true,
                    'verified_at' => now(),
                    // Bank details
                    'bank_name' => $type === 'bank_transfer' ? 'Access Bank' : null,
                    'account_number' => $type === 'bank_transfer' ? '0123456789' : null,
                    'account_name' => $type === 'bank_transfer' ? $teacher->user->name : null,
                    'bank_code' => $type === 'bank_transfer' ? '044' : null,
                    // PayPal details
                    'email' => $type === 'paypal' ? $teacher->user->email : null,
                ]);
            }

            // Create 5-10 Payouts
            $count = rand(5, 10);
            
            for ($i = 0; $i < $count; $i++) {
                $status = $this->getRandomStatus();
                $date = $this->getRandomDate();
                $amount = rand(5000, 150000);

                Payout::create([
                    'teacher_id' => $teacher->id,
                    'amount' => $amount,
                    'currency' => 'NGN',
                    'status' => $status,
                    'payment_method_id' => $method->id,
                    'gateway' => $method->payment_type === 'paypal' ? 'paypal' : 'paystack',
                    'requested_at' => $date,
                    'approved_at' => in_array($status, ['approved', 'processing', 'completed']) ? $date->copy()->addHours(2) : null,
                    'approved_by' => in_array($status, ['approved', 'processing', 'completed', 'rejected']) ? $adminId : null,
                    'processed_at' => $status === 'completed' ? $date->copy()->addHours(4) : null,
                    'rejected_at' => $status === 'rejected' ? $date->copy()->addHours(1) : null,
                    'rejection_reason' => $status === 'rejected' ? 'Incorrect account details' : null,
                ]);
            }
        }
    }

    private function getRandomStatus()
    {
        $statuses = ['pending', 'approved', 'rejected', 'completed', 'failed'];
        // Weights: Pending (30%), Completed (40%), Approved (10%), Rejected (10%), Failed (10%)
        $rand = rand(1, 100);
        if ($rand <= 30) return 'pending';
        if ($rand <= 70) return 'completed';
        if ($rand <= 80) return 'approved';
        if ($rand <= 90) return 'rejected';
        return 'failed';
    }

    private function getRandomDate()
    {
        // Random date within last 60 days
        return now()->subDays(rand(0, 60))->subHours(rand(0, 23));
    }
}
