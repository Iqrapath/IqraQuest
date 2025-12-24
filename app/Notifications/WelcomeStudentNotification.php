<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeStudentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        // Only use database and broadcast for now
        // Mail can be added back when SMTP is properly configured
        return ['database', 'broadcast', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Marhaban! 🎓 Welcome to IqraQuest',
            'message' => 'Your student profile is ready. Start exploring teachers today!',
            'type' => 'welcome',
            'action_url' => route('student.dashboard'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Marhaban! 🎓 Welcome to IqraQuest',
            'message' => 'Your student profile is ready. Start exploring teachers today!',
            'type' => 'welcome',
            'action_url' => route('student.dashboard'),
        ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Marhaban! 🎓 Welcome to IqraQuest')
            ->greeting('Hello!')
            ->line('Your student profile is ready. Start exploring teachers today!')
            ->action('Explore Teachers', route('student.dashboard'))
            ->line('Thank you for using IqraQuest!');
    }
}
