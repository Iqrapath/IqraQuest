<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewMessageNotification extends Notification implements ShouldQueue
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

    protected Message $message;
    protected User $sender;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
        $this->sender = $message->sender;
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
        $role = $notifiable->role->value;
        $url = route($role . '.messages.index', ['conversation' => $this->message->conversation_id]);
        
        $content = $this->message->content;
        if ($this->message->type !== 'text') {
            $content = 'Sent a ' . $this->message->type;
        }

        return (new MailMessage)
            ->subject('New Message from ' . $this->sender->name)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('You have received a new message from ' . $this->sender->name . '.')
            ->line('')
            ->line('**Message:**')
            ->line('"' . Str::limit($content, 150) . '"')
            ->line('')
            ->action('View Message & Reply', $url)
            ->line('Thank you for being part of IqraQuest!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_message',
            'title' => 'New Message',
            'message' => 'New message from ' . $this->sender->name,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'conversation_id' => $this->message->conversation_id,
            'content_snippet' => Str::limit($this->message->content ?? 'Sent a file', 50),
        ];
    }
}
