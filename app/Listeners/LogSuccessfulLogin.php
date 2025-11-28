<?php

namespace App\Listeners;

use App\Models\LoginAttempt;
use App\Models\SecurityLog;
use Illuminate\Auth\Events\Login;

class LogSuccessfulLogin
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $request = request();

        // Log successful login attempt
        LoginAttempt::logAttempt(
            email: $event->user->email,
            ipAddress: $request->ip(),
            successful: true,
            userAgent: $request->userAgent()
        );

        // Log security event
        SecurityLog::logEvent(
            eventType: 'login_success',
            ipAddress: $request->ip(),
            userId: $event->user->id,
            description: 'User logged in successfully',
            metadata: [
                'user_agent' => $request->userAgent(),
                'guard' => $event->guard,
            ],
            severity: 'info'
        );
    }
}
