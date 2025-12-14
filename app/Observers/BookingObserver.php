<?php

namespace App\Observers;

use App\Models\Booking;
use Illuminate\Support\Facades\Log;

class BookingObserver
{
    /**
     * Handle the Booking "created" event.
     */
    public function created(Booking $booking): void
    {
        Log::info("New Booking Created: ID {$booking->id} by User {$booking->user_id}");
        // Here we could dispatch a SendEmailJob
    }

    /**
     * Handle the Booking "updated" event.
     */
    public function updated(Booking $booking): void
    {
        if ($booking->isDirty('status') && $booking->status === 'cancelled') {
            Log::info("Booking ID {$booking->id} was cancelled.");
            // Trigger refund logic if applicable
        }
    }
}
