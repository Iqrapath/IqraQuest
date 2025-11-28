<?php

namespace App\Listeners;

use App\Models\SecurityLog;
use Illuminate\Auth\Events\PasswordReset;

class LogPasswordReset
{
    /**
     * Handle the event.
     */
    public function handle(PasswordReset $event): void
    {
        $request = request();

        SecurityLog::logEvent(
            eventType: 'password_reset',
            ipAddress: $request->ip(),
            userId: $event->user->id,
            description: 'User password was reset',
            metadata: [
                'user_agent' => $request->userAgent(),
            ],
            severity: 'warning'
        );
    }
}
