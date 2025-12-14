<?php

namespace App\Jobs;

use App\Models\Booking;
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
    public function handle(WalletService $walletService): void
    {
        Log::info("Processing payment for Booking ID: {$this->booking->id}");

        $student = $this->booking->student;
        $amount = $this->booking->total_price;

        if ($walletService->canDebit($student->id, $amount)) {
            // Deduct funds
            $walletService->debitWallet(
                $student->id, 
                $amount, 
                "Payment for class with " . $this->booking->teacher->user->name,
                ['booking_id' => $this->booking->id, 'type' => 'booking_payment']
            );
            
            // Confirm Booking
            $this->booking->update(['status' => 'awaiting_approval']); // Changed status to awaiting_approval
            
            // Send Success Notification to Student
            $student->notify(new BookingRequestedNotification($this->booking));
            
            // Send Notification to Teacher (Delayed 20s to ensure Student email completes and Mailtrap limit resets)
            $this->booking->teacher->user->notify((new NewBookingRequestNotification($this->booking))->delay(now()->addSeconds(20)));
            
            Log::info("Payment successful. Booking confirmed.");
        } else {
            // Insufficient funds
            $this->booking->update(['status' => 'cancelled', 'cancellation_reason' => 'Insufficient wallet balance']);
            
            // Send Failure Notification
            $student->notify(new \App\Notifications\BookingFailedNotification($this->booking, 'Insufficient wallet balance'));
            
            Log::warning("Payment failed. Insufficient funds.");
        }
    }
}
