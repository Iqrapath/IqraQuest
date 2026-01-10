<?php

namespace App\Notifications;

use App\Models\RescheduleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RescheduleRequestedNotification extends Notification implements ShouldQueue
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
        $student = $booking->student;
        $subject = $booking->subject;

        $originalDate = $this->rescheduleRequest->original_start_time->format('l, F j, Y');
        $originalTime = $this->rescheduleRequest->original_start_time->format('g:i A');
        $newDate = $this->rescheduleRequest->new_start_time->format('l, F j, Y');
        $newTime = $this->rescheduleRequest->new_start_time->format('g:i A') . ' - ' . 
                   $this->rescheduleRequest->new_end_time->format('g:i A');

        return (new MailMessage)
            ->subject('Reschedule Request - ' . $subject->name)
            ->greeting('Assalamu Alaikum ' . $notifiable->name . ',')
            ->line($student->name . ' has requested to reschedule their ' . $subject->name . ' session.')
            ->line('**Original Schedule:**')
            ->line($originalDate . ' at ' . $originalTime)
            ->line('**Requested New Schedule:**')
            ->line($newDate . ' at ' . $newTime)
            ->when($this->rescheduleRequest->reason, function ($message) {
                return $message->line('**Reason:** ' . $this->rescheduleRequest->reason);
            })
            ->line('Please respond within 48 hours.')
            ->action('View Request', url('/teacher/requests'))
            ->line('JazakAllahu Khairan for your dedication to teaching!');
    }

    public function toArray(object $notifiable): array
    {
        $booking = $this->rescheduleRequest->booking;

        return [
            'type' => 'reschedule_requested',
            'reschedule_request_id' => $this->rescheduleRequest->id,
            'booking_id' => $booking->id,
            'student_name' => $booking->student->name,
            'subject_name' => $booking->subject->name,
            'original_time' => $this->rescheduleRequest->original_start_time->toIso8601String(),
            'new_start_time' => $this->rescheduleRequest->new_start_time->toIso8601String(),
            'new_end_time' => $this->rescheduleRequest->new_end_time->toIso8601String(),
            'reason' => $this->rescheduleRequest->reason,
            'message' => $booking->student->name . ' requested to reschedule ' . $booking->subject->name,
        ];
    }
}
