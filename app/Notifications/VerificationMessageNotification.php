<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationMessageNotification extends Notification implements ShouldQueue
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
            ->subject('New Message from IqraQuest Verification Team')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('You have received a new message regarding your verification:')
            ->line('')
            ->line('**From:** ' . $this->senderName)
            ->line('**Message:**')
            ->line('"' . $this->messageContent . '"')
            ->line('')
            ->action('View & Reply', $this->replyUrl)
            ->line('If you have any questions, please reply to this message through the link above.')
            ->line('Thank you for your patience during the verification process!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'verification_message',
            'title' => 'New Message from Verification Team',
            'message' => $this->messageContent,
            'sender_name' => $this->senderName,
            'action_url' => $this->replyUrl,
        ];
    }
}
