<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class TermsUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected bool $sendEmail,
        protected bool $sendDashboard
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = [];
        if ($this->sendEmail) {
            $channels[] = 'mail';
        }
        if ($this->sendDashboard) {
            $channels[] = 'database';
            $channels[] = 'broadcast';
        }
        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Updated Terms & Conditions - IqraQuest')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('We have updated our Terms & Conditions.')
            ->line('Please take a moment to review the changes to stay informed about our latest policies.')
            ->action('Review Terms & Conditions', url('/terms'))
            ->line('Thank you for being part of IqraQuest!')
            ->salutation('Best regards, The IqraQuest Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Terms & Conditions Updated',
            'message' => 'Our Terms & Conditions have been updated. Please review them.',
            'type' => 'system_notification',
            'link' => '/terms',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Terms & Conditions Updated',
            'message' => 'Our Terms & Conditions have been updated.',
            'type' => 'system_notification',
            'link' => '/terms',
        ]);
    }
}
