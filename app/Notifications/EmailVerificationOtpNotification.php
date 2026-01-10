<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The OTP code to send
     *
     * @var string
     */
    protected string $otpCode;

    /**
     * The OTP expiry minutes
     *
     * @var int
     */
    protected int $expiryMinutes;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $otpCode, int $expiryMinutes = 10)
    {
        $this->otpCode = $otpCode;
        $this->expiryMinutes = $expiryMinutes;
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
            ->subject('Verify Your Email Address')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Thank you for registering with IqraQuest.')
            ->line('To verify your email address, please use the following verification code:')
            ->line('**' . $this->otpCode . '**')
            ->line('This code will expire in ' . $this->expiryMinutes . ' minutes.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Best regards, The IqraQuest Team');
    }
}
