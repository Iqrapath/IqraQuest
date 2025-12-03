<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IpBlockedNotification extends Notification
{
    use Queueable;

    /**
     * The IP address that was blocked
     *
     * @var string
     */
    protected string $ipAddress;

    /**
     * The duration in minutes
     *
     * @var int
     */
    protected int $blockDurationMinutes;

    /**
     * The reason for blocking
     *
     * @var string
     */
    protected string $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $ipAddress, int $blockDurationMinutes = 60, string $reason = 'Suspicious activity detected')
    {
        $this->ipAddress = $ipAddress;
        $this->blockDurationMinutes = $blockDurationMinutes;
        $this->reason = $reason;
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
            ->subject('⚠️ Security Alert: IP Address Blocked')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We detected suspicious activity from your IP address and have temporarily blocked it for security reasons.')
            ->line('**Details:**')
            ->line('- **IP Address:** ' . $this->ipAddress)
            ->line('- **Reason:** ' . $this->reason)
            ->line('- **Block Duration:** ' . $this->blockDurationMinutes . ' minutes')
            ->line('Your access will be automatically restored after ' . $this->blockDurationMinutes . ' minutes.')
            ->line('If you believe this was a mistake or you were not performing any suspicious activity, please contact our support team.')
            ->action('Contact Support', url('/contact'))
            ->line('Thank you for your understanding.')
            ->salutation('Best regards, The IqraQuest Security Team');
    }
}
