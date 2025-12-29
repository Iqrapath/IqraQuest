<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private string $senderName;
    private string $messageContent;
    private string $replyUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $senderName, string $messageContent, string $replyUrl)
    {
        $this->senderName = $senderName;
        $this->messageContent = $messageContent;
        $this->replyUrl = $replyUrl;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Support Message from ' . $this->senderName)
            ->greeting('Hello Admin,')
            ->line('You have received a new support message from a teacher in the waiting area:')
            ->line('')
            ->line('**From:** ' . $this->senderName)
            ->line('**Message:**')
            ->line('"' . $this->messageContent . '"')
            ->line('')
            ->action('View & Reply', $this->replyUrl)
            ->line('Please respond as soon as possible.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_support_message',
            'title' => 'New Message from ' . $this->senderName,
            'message' => $this->messageContent,
            'sender_name' => $this->senderName,
            'action_url' => $this->replyUrl,
        ];
    }
}
