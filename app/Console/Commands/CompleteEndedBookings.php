<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;

class CompleteEndedBookings extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'bookings:complete-ended';

    /**
     * The console command description.
     */
    protected $description = 'Mark confirmed bookings as completed when their session time has ended';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for ended bookings...');

        // Find all confirmed bookings where end_time has passed
        $endedBookings = Booking::where('status', 'confirmed')
            ->where('end_time', '<', now())
            ->get();

        if ($endedBookings->isEmpty()) {
            $this->info('No ended bookings found.');
            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($endedBookings as $booking) {
            $booking->update(['status' => 'completed']);
            $count++;
            
            $this->line("  ✓ Booking #{$booking->id} marked as completed");
        }

        $this->info("Completed {$count} booking(s).");

        return Command::SUCCESS;
    }
}
