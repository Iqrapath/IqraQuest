<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

class AuditFinances extends Command
{
    protected $signature = 'system:audit-finances {--teacher= : Audit a specific teacher ID}';
    protected $description = 'Audit financial transactions and identify discrepancies in escrow and payouts.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $teacherId = $this->option('teacher');
        $this->info("Starting financial audit...");

        // 1. Escrow Summary
        $heldBookings = \App\Models\Booking::where('payment_status', 'held')
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->get();

        $totalHeld = $heldBookings->sum('total_price');
        $this->info("Total currently in Escrow (Payment status 'held'): " . number_format($totalHeld, 2));

        // 2. Stuck Escrow (Eligible for release but not released)
        $stuckBookings = \App\Models\Booking::where('payment_status', 'held')
            ->where('status', 'completed')
            ->whereNull('dispute_raised_at')
            ->where('end_time', '<=', now()->subHours(2))
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->get();

        if ($stuckBookings->isNotEmpty()) {
            $this->warn("Found " . $stuckBookings->count() . " bookings eligible for release but still 'held'.");
            $headers = ['ID', 'Teacher', 'Start', 'Price', 'Status'];
            $data = $stuckBookings->map(fn($b) => [
                $b->id,
                $b->teacher->user->name ?? 'N/A',
                $b->start_time,
                $b->total_price,
                $b->status
            ]);
            $this->table($headers, $data);
        } else {
            $this->info("No stuck escrow releases found.");
        }

        // 3. Calculation Check (Net vs Gross)
        $this->info("Checking calculation consistency (Gross - Commission = Net)...");
        $discrepancies = [];
        $query = \App\Models\Booking::where('status', 'completed')
            ->where('payment_status', 'paid');
        
        if ($teacherId) {
            $query->where('teacher_id', $teacherId);
            $this->info("Filtering for Teacher ID: $teacherId");
        }

        $bookingsToCheck = $query->limit(100)->get();

        foreach ($bookingsToCheck as $booking) {
            $commissionRate = $booking->commission_rate ?? 15;
            $expectedNet = $booking->total_price * (1 - ($commissionRate / 100));
            
            // Check transactions
            $teacherCredit = \App\Models\Transaction::where('transactionable_type', \App\Models\Booking::class)
                ->where('transactionable_id', $booking->id)
                ->where('type', 'credit')
                ->where('user_id', $booking->teacher->user_id)
                ->first();

            if ($teacherCredit && abs($teacherCredit->amount - $expectedNet) > 0.01) {
                $discrepancies[] = [
                    $booking->id,
                    number_format($booking->total_price, 2),
                    number_format($expectedNet, 2),
                    number_format($teacherCredit->amount, 2),
                    number_format($teacherCredit->amount - $expectedNet, 2)
                ];
            }
        }

        if (!empty($discrepancies)) {
            $this->error("Found " . count($discrepancies) . " calculation discrepancies!");
            $this->table(['Booking', 'Gross', 'Exp Net', 'Actual', 'Diff'], $discrepancies);
        }

        // 4. Targeted check for the reported 10:30 PM session
        $this->info("Investigating specific session window (10:30 PM - 11:00 PM)...");
        $reportedSessions = \App\Models\Booking::whereTime('start_time', '22:30:00')
            ->whereTime('end_time', '23:00:00')
            ->get();

        if ($reportedSessions->isEmpty()) {
            $this->warn("No sessions found in the 10:30 PM - 11:00 PM slot in this database.");
        } else {
            $headers = ['ID', 'Status', 'Payment', 'Teacher Attended', 'Student Attended'];
            $data = $reportedSessions->map(fn($s) => [
                $s->id, $s->status, $s->payment_status, 
                $s->teacher_attended ? 'Yes' : 'No', 
                $s->student_attended ? 'Yes' : 'No'
            ]);
            $this->table($headers, $data);
        }

        return 0;
    }
}
