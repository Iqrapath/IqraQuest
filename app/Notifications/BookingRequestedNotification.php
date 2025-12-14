<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingRequestedNotification extends Notification implements ShouldQueue
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
                    ->subject('Booking Request Sent: ' . $this->booking->teacher->user->name)
                    ->greeting('Salaam ' . $notifiable->name . ',')
                    ->line('Your booking request has been sent and is awaiting teacher approval.')
                    ->line('**Teacher:** ' . $this->booking->teacher->user->name)
                    ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a') . ' (' . ($notifiable->timezone ?? 'UTC') . ')')
                    ->line('**Subject:** ' . ($this->booking->subject->name ?? 'Quran Study'))
                    ->line('---')
                    ->line('**Payment Status: Funds Held**')
                    ->line('Your payment has been secured and will be transferred to the teacher once they accept the request. If declined, it will be refunded to your wallet.')
                    ->line('**Amount Held:** ' . ($this->booking->currency === 'USD' ? '$' : '₦') . number_format($this->booking->total_price, 0))
                    ->line('**Booking Ref:** BKG-' . str_pad($this->booking->id, 6, '0', STR_PAD_LEFT))
                    ->line('---')
                    ->action('View Booking Status', url('/student/dashboard'))
                    ->line('We will notify you as soon as the teacher responds.');
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
            'title' => 'Booking Request Sent',
            'teacher_name' => $this->booking->teacher->user->name,
            'start_time' => $this->booking->start_time,
            'message' => 'Request sent to ' . $this->booking->teacher->user->name . '. Awaiting approval.',
            'type' => 'booking_requested'
        ];
    }
}
