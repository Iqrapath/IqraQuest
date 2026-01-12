<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Services\EscrowService;
use App\Services\WalletService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Notifications\BookingRequestedNotification;
use App\Notifications\NewBookingRequestNotification;

class ProcessBookingPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $booking;

    /**
     * Create a new job instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Execute the job.
     */
    public function handle(EscrowService $escrowService): void
    {
        Log::info("Processing payment for Booking ID: {$this->booking->id}");

        $student = $this->booking->student;

        // Hold funds in escrow (will be released after session completion)
        if ($escrowService->holdFunds($this->booking)) {
            // Update booking status to awaiting teacher approval
            $this->booking->update(['status' => 'awaiting_approval']);
            
            // Send Success Notification to Student
            try {
                $student->notify((new BookingRequestedNotification($this->booking))->delay(now()->addSeconds(5)));
            } catch (\Exception $e) {
                Log::error("Failed to send student booking notification: " . $e->getMessage());
            }
            
            // Send Notification to Teacher
            try {
                 $this->booking->teacher->user->notify((new NewBookingRequestNotification($this->booking))->delay(now()->addSeconds(10)));
            } catch (\Exception $e) {
                Log::error("Failed to send teacher booking notification: " . $e->getMessage());
            }
            
            Log::info("Payment held in escrow. Booking awaiting teacher approval.");
        } else {
            // Insufficient funds or escrow failed - defer payment instead of cancelling
            $this->booking->update(['status' => 'awaiting_payment']);
            
            // Send Failure Notification
            try {
                $student->notify((new \App\Notifications\BookingFailedNotification($this->booking, 'Insufficient wallet balance. Please top up your wallet to complete this booking.'))->delay(now()->addSeconds(5)));
            } catch (\Exception $e) {
                 Log::error("Failed to send student booking failed notification: " . $e->getMessage());
            }
            
            Log::warning("Payment failed. Insufficient funds.");
        }
    }
}
