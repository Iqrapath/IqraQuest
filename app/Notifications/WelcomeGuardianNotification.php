<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeGuardianNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Marhaban! 👨‍👩‍👧‍👦 Welcome to IqraQuest',
            'message' => 'Your guardian profile is set up. You can now manage your family\'s learning journey!',
            'type' => 'welcome',
            'action_url' => route('guardian.dashboard'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Marhaban! 👨‍👩‍👧‍👦 Welcome to IqraQuest',
            'message' => 'Your guardian profile is set up. You can now manage your family\'s learning journey!',
            'type' => 'welcome',
            'action_url' => route('guardian.dashboard'),
        ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Marhaban! 👨‍👩‍👧‍👦 Welcome to IqraQuest')
            ->greeting('Marhaban, ' . $notifiable->name . '!')
            ->line('Your guardian profile has been successfully set up.')
            ->line('You can now manage your children\'s profiles, browse teachers, and track their Islamic education progress.')
            ->action('Go to Dashboard', route('guardian.dashboard'))
            ->line('Thank you for being part of our community!');
    }
}
