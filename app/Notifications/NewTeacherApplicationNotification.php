<?php

namespace App\Notifications;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTeacherApplicationNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;
    
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 5;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 30;

    public int $teacherId;
    public string $applicantName;
    public string $applicantEmail;
    public string $submittedAt;

    public function __construct(
        Teacher $teacher,
        User $applicant
    ) {
        $this->teacherId = $teacher->id;
        $this->applicantName = $applicant->name;
        $this->applicantEmail = $applicant->email;
        $this->submittedAt = $teacher->created_at->toIso8601String();
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
            ->line('**Applicant:** ' . $this->applicantName)
            ->line('**Email:** ' . $this->applicantEmail)
            ->line('**Submitted:** ' . \Illuminate\Support\Carbon::parse($this->submittedAt)->diffForHumans())
            ->action('Review Application', route('admin.teachers.show', $this->teacherId))
            ->line('Please review the application and take appropriate action.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Teacher Application',
            'message' => $this->applicantName . ' has submitted a teacher application for review.',
            'teacher_id' => $this->teacherId,
            'applicant_name' => $this->applicantName,
            'applicant_email' => $this->applicantEmail,
            'type' => 'new_application',
            'action_url' => route('admin.teachers.show', $this->teacherId),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'New Teacher Application',
            'message' => $this->applicantName . ' has submitted a teacher application.',
            'teacher_id' => $this->teacherId,
            'applicant_name' => $this->applicantName,
            'type' => 'new_application',
            'action_url' => route('admin.teachers.show', $this->teacherId),
        ]);
    }
}
