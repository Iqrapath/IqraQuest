<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\EscrowService;
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

    protected EscrowService $escrowService;

    public function __construct(EscrowService $escrowService)
    {
        parent::__construct();
        $this->escrowService = $escrowService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for ended bookings...');

        // Find all confirmed bookings where end_time has passed in UTC
        $endedBookings = Booking::where('status', 'confirmed')
            ->where('end_time', '<=', now()->setTimezone('UTC'))
            ->get();

        if ($endedBookings->isEmpty()) {
            $this->info('No ended bookings found.');
            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($endedBookings as $booking) {
            try {
                $this->escrowService->handleSessionCompletion($booking);
                $count++;
                $this->line("  ✓ Booking #{$booking->id} processed by EscrowService");
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to process Escrow for Booking #{$booking->id}: " . $e->getMessage());
                $this->error("  ✗ Failed to process Booking #{$booking->id}");
            }
        }

        $this->info("Completed {$count} booking(s).");

        return Command::SUCCESS;
    }
}
