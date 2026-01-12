<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Notifications\BookingPaymentExpiredNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CancelExpiredAwaitingPaymentBookings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Checking for expired awaiting_payment bookings...');

        $expiredBookings = Booking::where('status', 'awaiting_payment')
            ->where('created_at', '<=', now()->subHour())
            ->with(['student', 'teacher.user'])
            ->get();

        if ($expiredBookings->isEmpty()) {
            Log::info('No expired bookings found.');
            return;
        }

        Log::info("Found {$expiredBookings->count()} expired bookings. Cancelling...");

        foreach ($expiredBookings as $booking) {
            try {
                $booking->update([
                    'status' => 'cancelled',
                    'cancellation_reason' => 'Payment grace period expired'
                ]);

                // Notify Student
                $booking->student->notify(new BookingPaymentExpiredNotification($booking));

                Log::info("Cancelled Booking ID: {$booking->id}");
            } catch (\Exception $e) {
                Log::error("Failed to cancel Booking ID: {$booking->id}. Error: {$e->getMessage()}");
            }
        }

        Log::info('Expired bookings cleanup completed.');
    }
}
