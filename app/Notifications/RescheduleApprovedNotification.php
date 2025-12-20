<?php

namespace App\Notifications;

use App\Models\RescheduleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescheduleApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected RescheduleRequest $rescheduleRequest;

    public function __construct(RescheduleRequest $rescheduleRequest)
    {
        $this->rescheduleRequest = $rescheduleRequest;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->rescheduleRequest->booking;
        $teacher = $booking->teacher->user;
        $subject = $booking->subject;

        $newDate = $this->rescheduleRequest->new_start_time->format('l, F j, Y');
        $newTime = $this->rescheduleRequest->new_start_time->format('g:i A') . ' - ' . 
                   $this->rescheduleRequest->new_end_time->format('g:i A');

        return (new MailMessage)
            ->subject('Reschedule Approved - ' . $subject->name)
            ->greeting('Assalamu Alaikum ' . $notifiable->name . ',')
            ->line('Great news! Your reschedule request has been approved by Ustadh ' . $teacher->name . '.')
            ->line('**New Schedule:**')
            ->line('📅 ' . $newDate)
            ->line('🕐 ' . $newTime)
            ->line('📚 ' . $subject->name)
            ->action('View Booking', url('/student/bookings'))
            ->line('We look forward to your session!');
    }

    public function toArray(object $notifiable): array
    {
        $booking = $this->rescheduleRequest->booking;

        return [
            'type' => 'reschedule_approved',
            'reschedule_request_id' => $this->rescheduleRequest->id,
            'booking_id' => $booking->id,
            'teacher_name' => $booking->teacher->user->name,
            'subject_name' => $booking->subject->name,
            'new_start_time' => $this->rescheduleRequest->new_start_time->toIso8601String(),
            'new_end_time' => $this->rescheduleRequest->new_end_time->toIso8601String(),
            'message' => 'Your reschedule request for ' . $booking->subject->name . ' has been approved',
        ];
    }
}
