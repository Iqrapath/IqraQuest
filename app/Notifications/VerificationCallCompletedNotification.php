<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationCallCompletedNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public int $teacherId;
    public string $teacherName;

    public function __construct(Teacher $teacher)
    {
        $this->teacherId = $teacher->id;
        $this->teacherName = $teacher->user->name ?? 'Teacher';
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verification Call Completed - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your video verification call has been completed successfully.')
            ->line('Our team will now review your application and get back to you with the final decision.')
            ->line('Thank you for your patience!')
            ->salutation('Best regards, The IqraQuest Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Verification Call Completed',
            'message' => 'Your video verification call has been completed. We will review your application shortly.',
            'type' => 'verification_completed',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Verification Call Completed',
            'message' => 'Your video verification call has been completed!',
            'type' => 'verification_completed',
        ]);
    }
}
