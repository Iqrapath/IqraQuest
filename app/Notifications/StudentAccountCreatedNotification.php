<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentAccountCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $password;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $password)
    {
        $this->password = $password;
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
        $role = ucfirst($notifiable->role->value);
        
        return (new MailMessage)
            ->subject("Welcome to IqraQuest - Your Account Details")
            ->greeting("Hello {$notifiable->name},")
            ->line("An account has been created for you as a {$role} on IqraQuest.")
            ->line('Here are your login credentials:')
            ->line("Email: {$notifiable->email}")
            ->line("Password: {$this->password}")
            ->action('Login to Dashboard', route('login'))
            ->line('Please change your password after your first login.')
            ->line('Thank you for joining us!');
    }
}
