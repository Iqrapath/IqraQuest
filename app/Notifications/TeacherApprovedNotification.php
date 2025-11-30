<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherApprovedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(public Teacher $teacher)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('🎉 Application Approved - Welcome to IqraQuest!')
            ->greeting('Congratulations ' . $notifiable->name . '!')
            ->line('We are excited to inform you that your teacher application has been approved!')
            ->line('You now have full access to the IqraQuest teaching platform.')
            ->line('You can start creating courses, managing students, and sharing your knowledge.')
            ->action('Go to Dashboard', route('teacher.dashboard'))
            ->line('Welcome to the IqraQuest teaching community!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Application Approved! 🎉',
            'message' => 'Congratulations! Your teacher application has been approved. You can now access your dashboard.',
            'teacher_id' => $this->teacher->id,
            'type' => 'application_approved',
            'action_url' => route('teacher.dashboard'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Application Approved! 🎉',
            'message' => 'Congratulations! Your teacher application has been approved.',
            'teacher_id' => $this->teacher->id,
            'type' => 'application_approved',
            'action_url' => route('teacher.dashboard'),
        ]);
    }
}
