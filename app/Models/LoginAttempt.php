<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginAttempt extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'email',
        'ip_address',
        'successful',
        'user_agent',
        'attempted_at',
    ];

    protected $casts = [
        'successful' => 'boolean',
        'attempted_at' => 'datetime',
    ];

    /**
     * Log a login attempt
     */
    public static function logAttempt(
        string $email,
        string $ipAddress,
        bool $successful,
        ?string $userAgent = null
    ): self {
        return self::create([
            'email' => $email,
            'ip_address' => $ipAddress,
            'successful' => $successful,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Get recent failed attempts for an email
     */
    public static function recentFailedAttempts(string $email, int $minutes = 15): int
    {
        return self::where('email', $email)
            ->where('successful', false)
            ->where('attempted_at', '>=', now()->subMinutes($minutes))
            ->count();
    }

    /**
     * Get recent failed attempts for an IP
     */
    public static function recentFailedAttemptsFromIP(string $ipAddress, int $minutes = 15): int
    {
        return self::where('ip_address', $ipAddress)
            ->where('successful', false)
            ->where('attempted_at', '>=', now()->subMinutes($minutes))
            ->count();
    }
}
