<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationSentNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Verification Email Sent',
            'message' => 'A verification email has been sent to your email address. Please check your inbox.',
            'type' => 'email_verification',
            'action_url' => null,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Verification Email Sent',
            'message' => 'A verification email has been sent to your email address. Please check your inbox.',
            'type' => 'email_verification',
            'action_url' => null,
        ]);
    }
}
