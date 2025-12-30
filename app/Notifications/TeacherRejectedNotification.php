<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherRejectedNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public int $teacherId;
    public string $rejectionReason;

    public function __construct(Teacher $teacher, string $rejectionReason)
    {
        $this->teacherId = $teacher->id;
        $this->rejectionReason = $rejectionReason;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Application Update - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Thank you for your interest in joining IqraQuest as a teacher.')
            ->line('After careful review, we regret to inform you that we are unable to approve your application at this time.')
            ->line('**Reason:** ' . $this->rejectionReason)
            ->line('We encourage you to review our requirements and reapply in the future.')
            ->action('View Application Details', route('teacher.waiting-area'))
            ->line('If you have any questions, please don\'t hesitate to contact our support team.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Application Not Approved',
            'message' => 'Your teacher application was not approved. Please review the details.',
            'teacher_id' => $this->teacherId,
            'rejection_reason' => $this->rejectionReason,
            'type' => 'application_rejected',
            'action_url' => route('teacher.waiting-area'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Application Not Approved',
            'message' => 'Your teacher application was not approved.',
            'teacher_id' => $this->teacherId,
            'rejection_reason' => $this->rejectionReason,
            'type' => 'application_rejected',
            'action_url' => route('teacher.waiting-area'),
        ]);
    }
}
