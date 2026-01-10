<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeTeacherNotification extends Notification implements ShouldBroadcastNow, ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to IqraQuest! 🌟')
            ->greeting('As-salamu alaykum ' . $notifiable->name . '!')
            ->line('Welcome to IqraQuest - your platform for Islamic education.')
            ->line('We\'re excited to have you join our community of dedicated teachers.')
            ->line('To get started, please complete your teacher profile by providing:')
            ->line('• Your teaching qualifications and experience')
            ->line('• Subject specializations')
            ->line('• Teaching certifications (if applicable)')
            ->line('• Availability and schedule preferences')
            ->line('Once your profile is complete, our team will review your application.')
            ->action('Complete Your Profile', route('teacher.onboarding.step1'))
            ->line('If you have any questions, our support team is here to help.')
            ->line('JazakAllah Khair for choosing IqraQuest!')
            ->salutation('Best regards, The IqraPath Team');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome to IqraQuest! 🌟',
            'message' => 'Complete your teacher profile to get started.',
            'type' => 'welcome',
            'action_url' => route('teacher.onboarding.step1'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Welcome to IqraQuest! 🌟',
            'message' => 'Complete your teacher profile to get started.',
            'type' => 'welcome',
            'action_url' => route('teacher.onboarding.step1'),
        ]);
    }
}
