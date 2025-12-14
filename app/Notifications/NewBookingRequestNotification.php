<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBookingRequestNotification extends Notification implements ShouldQueue
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
                    ->subject('New Booking Request from ' . $this->booking->student->name)
                    ->greeting('Salaam ' . $notifiable->name . ',')
                    ->line('You have received a new booking request.')
                    ->line('**Student:** ' . $this->booking->student->name)
                    ->line('**Date:** ' . $this->booking->start_time->format('F j, Y, g:i a') . ' (' . ($notifiable->timezone ?? 'UTC') . ')')
                    ->line('**Subject:** ' . ($this->booking->subject->name ?? 'Quran Study'))
                    ->line('**Revenue:** ' . ($this->booking->currency === 'USD' ? '$' : '₦') . number_format($this->booking->total_price * 0.90, 0) . ' (est. after commission)')
                    ->line('---')
                    ->action('View Request', url('/teacher/requests'))
                    ->line('Please accept or decline this request within 24 hours.');
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
            'title' => 'New Booking Request',
            'student_name' => $this->booking->student->name,
            'start_time' => $this->booking->start_time,
            'message' => 'New request from ' . $this->booking->student->name,
            'type' => 'new_booking_request'
        ];
    }
}
