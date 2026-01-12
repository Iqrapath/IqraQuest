<?php

namespace App\Listeners;

use App\Http\Middleware\BlockSuspiciousIPs;
use App\Models\LoginAttempt;
use App\Models\SecurityLog;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Cache;

class LogFailedLogin
{
    /**
     * Handle the event.
     */
    public function handle(Failed $event): void
    {
        $request = request();
        $email = $event->credentials['email'] ?? 'unknown';
        $ip = $request->ip();

        // Log failed login attempt
        LoginAttempt::logAttempt(
            email: $email,
            ipAddress: $ip,
            successful: false,
            userAgent: $request->userAgent()
        );

        // Log security event
        SecurityLog::logEvent(
            eventType: 'login_failed',
            ipAddress: $ip,
            userId: null,
            description: "Failed login attempt for email: {$email}",
            metadata: [
                'user_agent' => $request->userAgent(),
                'guard' => $event->guard,
            ],
            severity: 'warning'
        );

        // Increment failed attempts for IP blocking
        BlockSuspiciousIPs::incrementAttempts($ip, $email);

        // Calculate remaining attempts before IP block
        $maxAttempts = config('security.ip_blocking.max_attempts', 10);
        $currentAttempts = Cache::get("failed_attempts:{$ip}", 0);
        $remainingAttempts = max(0, $maxAttempts - $currentAttempts);

        // Flash remaining attempts to session for frontend display
        if ($remainingAttempts <= 5 && $remainingAttempts > 0) {
            session()->flash('login_warning', "Warning: {$remainingAttempts} attempt(s) remaining before your IP is temporarily blocked.");
        } elseif ($remainingAttempts === 0) {
            session()->flash('login_error', 'Your IP has been blocked due to too many failed attempts. Please try again later.');
        }

        // Check for brute force attempts
        $recentFailures = LoginAttempt::recentFailedAttempts($email, 15);
        if ($recentFailures >= 5) {
            SecurityLog::logEvent(
                eventType: 'brute_force_detected',
                ipAddress: $ip,
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
