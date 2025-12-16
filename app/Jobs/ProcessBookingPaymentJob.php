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
            $student->notify(new BookingRequestedNotification($this->booking));
            
            // Send Notification to Teacher (Delayed 20s to ensure Student email completes and Mailtrap limit resets)
            $this->booking->teacher->user->notify((new NewBookingRequestNotification($this->booking))->delay(now()->addSeconds(20)));
            
            Log::info("Payment held in escrow. Booking awaiting teacher approval.");
        } else {
            // Insufficient funds or escrow failed
            $this->booking->update(['status' => 'cancelled', 'cancellation_reason' => 'Insufficient wallet balance']);
            
            // Send Failure Notification
            $student->notify(new \App\Notifications\BookingFailedNotification($this->booking, 'Insufficient wallet balance'));
            
            Log::warning("Payment failed. Insufficient funds.");
        }
    }
}
