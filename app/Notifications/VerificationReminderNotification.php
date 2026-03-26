<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $scheduledAt;
    public $joinUrl;

    public function __construct(Teacher $teacher, $scheduledAt)
    {
        $this->scheduledAt = $scheduledAt;
        $this->joinUrl = config('app.url') . "/teacher/verification/room/{$teacher->id}";
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reminder: Verification Call Upcoming - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('This is a reminder that your video verification call is coming up shortly.')
            ->line('Scheduled Time: ' . \Carbon\Carbon::parse($this->scheduledAt)->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('F j, Y, g:i A'))
            ->line('Please be ready to join the verification room 15 minutes prior to the scheduled time.')
            ->action('Join Verification Room', $this->joinUrl)
            ->line('If you need to reschedule, please contact support immediately.')
            ->salutation('Best regards, The IqraQuest Team');
    }
}
