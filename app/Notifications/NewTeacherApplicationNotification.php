<?php

namespace App\Notifications;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTeacherApplicationNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public Teacher $teacher,
        public User $applicant
    ) {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Teacher Application - IqraQuest Admin')
            ->greeting('Hello Admin,')
            ->line('A new teacher application has been submitted and requires your review.')
            ->line('**Applicant:** ' . $this->applicant->name)
            ->line('**Email:** ' . $this->applicant->email)
            ->line('**Submitted:** ' . $this->teacher->created_at->diffForHumans())
            ->action('Review Application', route('admin.teachers.show', $this->teacher->id))
            ->line('Please review the application and take appropriate action.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Teacher Application',
            'message' => $this->applicant->name . ' has submitted a teacher application for review.',
            'teacher_id' => $this->teacher->id,
            'applicant_name' => $this->applicant->name,
            'applicant_email' => $this->applicant->email,
            'type' => 'new_application',
            'action_url' => route('admin.teachers.show', $this->teacher->id),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'New Teacher Application',
            'message' => $this->applicant->name . ' has submitted a teacher application.',
            'teacher_id' => $this->teacher->id,
            'applicant_name' => $this->applicant->name,
            'type' => 'new_application',
            'action_url' => route('admin.teachers.show', $this->teacher->id),
        ]);
    }
}
