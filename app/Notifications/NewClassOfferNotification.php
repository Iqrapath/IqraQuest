<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewClassOfferNotification extends Notification implements ShouldQueue
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
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('New Class Offer from ' . $this->booking->teacher->user->name)
                    ->line('You have received a new private class offer.')
                    ->line('Date: ' . $this->booking->start_time->format('F j, Y, g:i a'))
                    ->action('Accept Offer', url('/student/bookings/' . $this->booking->id))
                    ->line('Please accept this offer to confirm your spot.');
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
            'teacher_name' => $this->booking->teacher->user->name,
            'start_time' => $this->booking->start_time,
            'amount' => $this->booking->total_price,
            'type' => 'offer',
            'message' => 'New class offer from ' . $this->booking->teacher->user->name
        ];
    }
}
