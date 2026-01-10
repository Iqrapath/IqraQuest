<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherApplicationReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    
    /**
     * The number of times the job may be attempted.
     */
    public $tries = 5;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = 30;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Teacher $teacher)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Application Received - IqraQuest')
            ->greeting('As-salamu alaykum ' . $notifiable->name . '!')
            ->line('Thank you for submitting your teacher application to IqraQuest.')
            ->line('We have received your application and our team will review it shortly.')
            ->line('You will receive a notification once your application has been reviewed.')
            ->line('This process typically takes 1-3 business days.')
            ->action('View Application Status', route('teacher.waiting-area'))
            ->line('Thank you for your patience!')
            ->salutation('Best regards, The IqraPath Team');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Application Received',
            'message' => 'Your teacher application has been submitted successfully and is under review.',
            'teacher_id' => $this->teacher->id,
            'type' => 'application_received',
            'action_url' => route('teacher.waiting-area'),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Application Received',
            'message' => 'Your teacher application has been submitted successfully and is under review.',
            'teacher_id' => $this->teacher->id,
            'type' => 'application_received',
            'action_url' => route('teacher.waiting-area'),
        ]);
    }
}
