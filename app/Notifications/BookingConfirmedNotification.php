<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmedNotification extends Notification implements ShouldQueue
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
                    ->subject('Booking Confirmed: Class with ' . $this->booking->teacher->user->name)
                    ->greeting('Assalamu Alaikum ' . $notifiable->name . ',')
                    ->line('Your booking for a Quran class has been confirmed and payment processed.')
                    ->line('**Teacher:** ' . $this->booking->teacher->user->name)
                    ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a') . ' (' . ($notifiable->timezone ?? 'UTC') . ')')
                    ->line('**Subject:** ' . ($this->booking->subject->name ?? 'Quran Study'))
                    ->line('---')
                    ->line('**Payment Receipt**')
                    ->line('**Amount Paid:** ' . ($this->booking->currency === 'USD' ? '$' : '₦') . number_format($this->booking->total_price, 0))
                    ->line('**Payment Method:** Wallet Balance')
                    ->line('**Reference ID:** BKG-' . str_pad($this->booking->id, 6, '0', STR_PAD_LEFT))
                    ->line('---')
                    ->line('**Meeting Link:** Link will be available on your dashboard 15 minutes before the session.')
                    ->action('View My Bookings', url('/student/dashboard'))
                    ->line('JazakaAllahu Khair for learning with IqraQuest.');
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
            'title' => 'Booking Confirmed',
            'teacher_name' => $this->booking->teacher->user->name,
            'start_time' => $this->booking->start_time,
            'message' => 'Your class with ' . $this->booking->teacher->user->name . ' is confirmed.',
            'type' => 'booking_confirmed'
        ];
    }
}
