<?php

namespace App\Notifications;

use App\Models\TeacherCertificate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentRejectedNotification extends Notification implements ShouldQueue, ShouldBroadcastNow
{
    use Queueable;

    public int $certificateId;
    public string $certificateTitle;
    public string $actionUrl;

    public function __construct(
        TeacherCertificate $certificate,
        public string $reason
    ) {
        // Store primitive values to avoid serialization issues in queue
        $this->certificateId = $certificate->id;
        $this->certificateTitle = $certificate->title;
        $this->actionUrl = config('app.url') . '/teacher/profile';
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Document Verification Rejected - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your document "' . $this->certificateTitle . '" has been rejected during verification.')
            ->line('**Reason for Rejection:** ' . $this->reason)
            ->action('Re-upload Document', $this->actionUrl)
            ->line('Please review the reason and re-upload a valid document to proceed with your verification.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Document Rejected',
            'message' => 'Your document "' . $this->certificateTitle . '" was rejected. Reason: ' . $this->reason,
            'type' => 'document_rejected',
            'certificate_id' => $this->certificateId,
            'reason' => $this->reason,
            'action_url' => $this->actionUrl,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Document Rejected',
            'message' => 'Your document "' . $this->certificateTitle . '" was rejected.',
            'type' => 'document_rejected',
            'reason' => $this->reason,
        ]);
    }
}
