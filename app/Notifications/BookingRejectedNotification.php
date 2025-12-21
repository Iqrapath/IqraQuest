<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable, RespectsNotificationPreferences;

    protected $booking;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return $this->getChannels($notifiable, 'session');
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Booking Request Declined: ' . $this->booking->teacher->user->name)
                    ->greeting('Salaam ' . $notifiable->name . ',')
                    ->line('Your booking request has been declined by the teacher.')
                    ->line('**Teacher:** ' . $this->booking->teacher->user->name)
                    ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a') . ' (' . ($notifiable->timezone ?? 'UTC') . ')')
                    ->line('---')
                    ->line('**Refund Processed**')
                    ->line('The amount of ' . ($this->booking->currency === 'USD' ? '$' : '₦') . number_format($this->booking->total_price, 0) . ' has been fully refunded to your wallet.')
                    ->line('---')
                    ->action('Find Another Teacher', url('/teachers'))
                    ->line('We encourage you to browse other available teachers.');
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
            'title' => 'Booking Declined',
            'teacher_name' => $this->booking->teacher->user->name,
            'reason' => 'Teacher unavailable',
            'message' => 'Your request with ' . $this->booking->teacher->user->name . ' was declined. Refund processed.',
            'type' => 'booking_rejected'
        ];
    }
}
