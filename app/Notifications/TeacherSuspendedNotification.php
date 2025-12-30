<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherSuspendedNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public int $teacherId;
    public string $suspensionReason;

    public function __construct(Teacher $teacher, string $suspensionReason)
    {
        $this->teacherId = $teacher->id;
        $this->suspensionReason = $suspensionReason;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Account Status Update - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We are writing to inform you that your teacher account on IqraQuest has been suspended.')
            ->line('**Reason for Suspension:** ' . $this->suspensionReason)
            ->line('During suspension, you will not be able to access your dashboard or accept new bookings.')
            ->action('View Account Status', route('teacher.waiting-area'))
            ->line('If you believe this is a mistake or would like to appeal this decision, please contact our support team.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Account Suspended',
            'message' => 'Your teacher account has been suspended. Please check the details.',
            'teacher_id' => $this->teacherId,
            'suspension_reason' => $this->suspensionReason,
            'type' => 'account_suspended',
            'action_url' => route('teacher.waiting-area'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Account Suspended',
            'message' => 'Your teacher account has been suspended.',
            'teacher_id' => $this->teacherId,
            'suspension_reason' => $this->suspensionReason,
            'type' => 'account_suspended',
            'action_url' => route('teacher.waiting-area'),
        ]);
    }
}
