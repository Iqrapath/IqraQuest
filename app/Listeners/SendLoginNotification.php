<?php

namespace App\Listeners;

use App\Notifications\UserLoggedInNotification;
use Illuminate\Auth\Events\Login;

class SendLoginNotification
{
    // Track login attempts to handle duplicate events
    private static $loginAttempts = [];

    /**
     * Log without breaking login when storage/logs is not writable (e.g. bad deploy permissions).
     */
    private function logInfo(string $message, array $context = []): void
    {
        try {
            \Log::info($message, $context);
        } catch (\Throwable) {
            //
        }
    }

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
        if (! isset(self::$loginAttempts[$userId])) {
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

        $this->logInfo('SendLoginNotification: Login event received', [
            'user_id' => $userId,
            'attempt_count' => $attempt['count'],
            'time_since_first' => $timeSinceFirst,
        ]);

        // Only send notification on the LAST event (after a small delay, send on count 1 if no more events)
        // For now, send on first event and ignore subsequent ones within 2 seconds
        if ($attempt['count'] === 1) {
            // Send login notification to the user
            $event->user->notify(new UserLoggedInNotification);

            $this->logInfo('SendLoginNotification: Notification sent', [
                'user_id' => $event->user->id,
                'user_email' => $event->user->email,
                'user_role' => $event->user->role,
            ]);
        } else {
            $this->logInfo('SendLoginNotification: Duplicate event ignored', [
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
