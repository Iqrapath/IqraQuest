<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingFailedNotification extends Notification
{
    // use Queueable;

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
                    ->subject('Booking Failed: Class with ' . $this->booking->teacher->user->name)
                    ->error() // Uses error styling
                    ->greeting('Salaam ' . $notifiable->name . ',')
                    ->line('We were unable to confirm your booking for the following session:')
                    ->line('**Teacher:** ' . $this->booking->teacher->user->name)
                    ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a'))
                    ->line('**Reason:** ' . $this->reason)
                    ->line('Please check your wallet balance or try again.')
                    ->action('Go to Wallet', url('/student/wallet'));
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
            'title' => 'Booking Failed',
            'teacher_name' => $this->booking->teacher->user->name,
            'reason' => $this->reason,
            'message' => 'Booking failed: ' . $this->reason,
            'type' => 'booking_failed'
        ];
    }
}
