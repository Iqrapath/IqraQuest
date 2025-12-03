<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendLoginNotification
{
    // Track login attempts to handle duplicate events
    private static $loginAttempts = [];
    
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $userId = $event->user->id;
        $now = microtime(true);
        
        // Initialize tracking for this user if not exists
        if (!isset(self::$loginAttempts[$userId])) {
            self::$loginAttempts[$userId] = [
                'count' => 0,
                'first_time' => $now,
            ];
        }
        
        $attempt = &self::$loginAttempts[$userId];
        $timeSinceFirst = $now - $attempt['first_time'];
        
        // If more than 3 seconds have passed, reset the counter (new login)
        if ($timeSinceFirst > 3) {
            $attempt = [
                'count' => 0,
                'first_time' => $now,
            ];
        }
        
        $attempt['count']++;
        
        \Log::info('SendLoginNotification: Login event received', [
            'user_id' => $userId,
            'attempt_count' => $attempt['count'],
            'time_since_first' => $timeSinceFirst,
        ]);

        // Only send notification on the LAST event (after a small delay, send on count 1 if no more events)
        // For now, send on first event and ignore subsequent ones within 2 seconds
        if ($attempt['count'] === 1) {
            // Send login notification to the user
            $event->user->notify(new \App\Notifications\UserLoggedInNotification());
            
            \Log::info('SendLoginNotification: Notification sent', [
                'user_id' => $event->user->id,
                'user_email' => $event->user->email,
                'user_role' => $event->user->role,
            ]);
        } else {
            \Log::info('SendLoginNotification: Duplicate event ignored', [
                'user_id' => $userId,
                'attempt_count' => $attempt['count'],
            ]);
        }
        
        // Clean up old entries (older than 10 seconds)
        foreach (self::$loginAttempts as $uid => $data) {
            if ($now - $data['first_time'] > 10) {
                unset(self::$loginAttempts[$uid]);
            }
        }
    }
}
