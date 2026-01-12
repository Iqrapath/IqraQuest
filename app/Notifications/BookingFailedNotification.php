<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingFailedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $booking;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking, string $reason)
    {
        $this->booking = $booking;
        $this->reason = $reason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Payment Pending: Session with ' . $this->booking->teacher->user->name)
                    ->greeting('Salaam ' . $notifiable->name . ',')
                    ->line('Your booking has been reserved but requires payment to be confirmed.')
                    ->line('**Teacher:** ' . $this->booking->teacher->user->name)
                    ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a'))
                    ->line('**Status:** Awaiting Payment')
                    ->line('Please visit your wallet to complete the payment within 1 hour, or the slot will be released.')
                    ->action('Pay Now', url('/student/wallet'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'title' => 'Payment Pending',
            'teacher_name' => $this->booking->teacher->user->name,
            'reason' => $this->reason,
            'message' => 'Booking reserved. Please complete payment to confirm.',
            'type' => 'booking_payment_pending'
        ];
    }
}
