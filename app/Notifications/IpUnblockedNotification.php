<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IpUnblockedNotification extends Notification
{
    use Queueable;

    /**
     * The IP address that was unblocked
     *
     * @var string
     */
    protected string $ipAddress;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $ipAddress)
    {
        $this->ipAddress = $ipAddress;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('✅ IP Address Access Restored')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your IP address has been unblocked and your access to IqraQuest has been restored.')
            ->line('**IP Address:** ' . $this->ipAddress)
            ->line('You can now continue using our platform normally.')
            ->line('If you continue to experience issues or have any questions, please contact our support team.')
            ->action('Visit IqraQuest', url('/'))
            ->salutation('Best regards, The IqraQuest Security Team');
    }
}
