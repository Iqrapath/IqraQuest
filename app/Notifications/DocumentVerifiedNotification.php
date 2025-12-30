<?php

namespace App\Notifications;

use App\Models\TeacherCertificate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentVerifiedNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public int $certificateId;
    public string $certificateTitle;
    public string $actionUrl;

    public function __construct(TeacherCertificate $certificate)
    {
        // Store primitive values to avoid serialization issues in queue
        $this->certificateId = $certificate->id;
        $this->certificateTitle = $certificate->title;
        $this->actionUrl = config('app.url') . '/teacher/profile';
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Document Verified',
            'message' => 'Your document "' . $this->certificateTitle . '" has been verified.',
            'type' => 'document_verified',
            'certificate_id' => $this->certificateId,
            'action_url' => $this->actionUrl,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Document Verified',
            'message' => 'Your document "' . $this->certificateTitle . '" has been verified.',
            'type' => 'document_verified',
        ]);
    }
}
