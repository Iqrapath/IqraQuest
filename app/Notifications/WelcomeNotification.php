<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class WelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
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
        $roleName = ucfirst($notifiable->role->value ?? 'User');
        
        $message = (new MailMessage)
            ->subject('Welcome to IqraQuest! 🌟')
            ->greeting('As-salamu alaykum ' . $notifiable->name . '!')
            ->line('Welcome to IqraQuest - your premium platform for Islamic education.')
            ->line('We are thrilled to have you join our community as a ' . $roleName . '.');

        if ($notifiable->isTeacher()) {
            $message->line('You have started your journey to share knowledge. We will guide you through completing your profile shortly.')
                   ->action('Complete Teacher Profile', route('teacher.onboarding.step1'));
        } elseif ($notifiable->isStudent() || $notifiable->role->value === 'student') {
            $message->line('Get ready to explore a world of Islamic knowledge with top-rated teachers.')
                   ->action('Explore Dashboard', route('student.dashboard'));
        } elseif ($notifiable->isGuardian() || $notifiable->role->value === 'guardian') {
            $message->line('Manage your family\'s Islamic education journey with ease.')
                   ->action('Guardian Dashboard', route('guardian.dashboard'));
        } else {
            $message->action('Visit Dashboard', url('/dashboard'));
        }

        return $message->line('Thank you for choosing IqraQuest!')
            ->salutation('JazakAllah Khair, ' . config('app.name') . ' Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome to IqraQuest! 🌟',
            'message' => 'Thank you for joining our community.',
            'type' => 'welcome',
            'action_url' => url('/dashboard'),
        ];
    }
}
