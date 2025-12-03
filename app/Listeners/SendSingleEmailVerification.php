<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;

class SendSingleEmailVerification
{
    private static $sentEmails = [];

    /**
     * Handle the event to prevent duplicate emails
     */
    public function handle(Registered $event): void
    {
        $userId = $event->user->id;
        
        // Check if we've already sent an email for this user in this request
        if (isset(self::$sentEmails[$userId])) {
            \Log::info('Duplicate email verification prevented', ['user_id' => $userId]);
            return;
        }
        
        // Mark as sent and send the email
        self::$sentEmails[$userId] = true;
        
        $listener = new SendEmailVerificationNotification();
        $listener->handle($event);
    }
}
