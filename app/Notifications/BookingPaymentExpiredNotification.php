<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingPaymentExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Booking Reservation Expired')
            ->greeting("Hello {$notifiable->name},")
            ->line("Your reservation for the session with {$this->booking->teacher->user->name} on {$this->booking->start_time->format('M j, Y \a\t g:i A')} has expired due to non-payment.")
            ->line('The time slot has been released and is now available for other students to book.')
            ->action('Book Again', url('/student/teachers'))
            ->line('If you have any questions, please contact our support team.');
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
            'message' => "Your reservation for the session with {$this->booking->teacher->user->name} has expired.",
            'type' => 'payment_expired',
        ];
    }
}
