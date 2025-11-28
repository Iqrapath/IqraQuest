<?php

namespace App\Listeners;

use App\Http\Middleware\BlockSuspiciousIPs;
use App\Models\LoginAttempt;
use App\Models\SecurityLog;
use Illuminate\Auth\Events\Failed;

class LogFailedLogin
{
    /**
     * Handle the event.
     */
    public function handle(Failed $event): void
    {
        $request = request();
        $email = $event->credentials['email'] ?? 'unknown';

        // Log failed login attempt
        LoginAttempt::logAttempt(
            email: $email,
            ipAddress: $request->ip(),
            successful: false,
            userAgent: $request->userAgent()
        );

        // Log security event
        SecurityLog::logEvent(
            eventType: 'login_failed',
            ipAddress: $request->ip(),
            userId: null,
            description: "Failed login attempt for email: {$email}",
            metadata: [
                'user_agent' => $request->userAgent(),
                'guard' => $event->guard,
            ],
            severity: 'warning'
        );

        // Increment failed attempts for IP blocking
        BlockSuspiciousIPs::incrementAttempts($request->ip());

        // Check for brute force attempts
        $recentFailures = LoginAttempt::recentFailedAttempts($email, 15);
        if ($recentFailures >= 5) {
            SecurityLog::logEvent(
                eventType: 'brute_force_detected',
                ipAddress: $request->ip(),
                userId: null,
                description: "Possible brute force attack detected for email: {$email}",
                metadata: [
                    'failed_attempts' => $recentFailures,
                ],
                severity: 'critical'
            );
        }
    }
}
