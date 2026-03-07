<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class UserLoggedInNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['broadcast', 'database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome back, ' . $notifiable->name . '! 👋',
            'message' => 'You have successfully logged in.',
            'type' => 'login',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Welcome back, ' . $notifiable->name . '! 👋',
            'message' => 'You have successfully logged in.',
            'type' => 'login',
        ]);
    }
}
