<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class VerificationCallScheduledNotification extends Notification implements ShouldQueue, ShouldBroadcastNow
{
    use Queueable;

    public int $teacherId;
    public string $teacherName;
    public string $roomUrl;

    public function __construct(
        Teacher $teacher,
        public string $scheduledAt,
        public ?string $notes = null
    ) {
        // Store primitive values instead of Eloquent model to avoid serialization issues
        $this->teacherId = $teacher->id;
        $this->teacherName = $teacher->user->name ?? 'Teacher';
        
        // Pre-compute the URL using the teacher route (not admin)
        $this->roomUrl = config('app.url') . '/teacher/verification/room/' . $teacher->id;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $scheduledDate = Carbon::parse($this->scheduledAt)->format('M d, Y \a\t h:i A');

        return (new MailMessage)
            ->subject('Video Verification Call Scheduled - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your video verification call has been scheduled by the admin.')
            ->line('**Scheduled Time:** ' . $scheduledDate)
            ->line('**Notes:** ' . ($this->notes ?? 'No additional notes provided.'))
            ->action('Join Verification Room', $this->roomUrl)
            ->line('Please ensure you are available at the scheduled time. You can join the room directly from your dashboard or via the link above.')
            ->line('Thank you for choosing IqraQuest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Verification Call Scheduled',
            'message' => 'Your verification call is scheduled for ' . Carbon::parse($this->scheduledAt)->format('M d, Y h:i A'),
            'type' => 'verification_call',
            'scheduled_at' => $this->scheduledAt,
            'room_url' => $this->roomUrl,
            'action_url' => $this->roomUrl,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Verification Call Scheduled',
            'message' => 'Your verification call is scheduled for ' . Carbon::parse($this->scheduledAt)->format('M d, Y h:i A'),
            'type' => 'verification_call',
            'room_url' => $this->roomUrl,
        ]);
    }
}
