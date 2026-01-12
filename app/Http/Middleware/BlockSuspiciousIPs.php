<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Notifications\IpBlockedNotification;
use App\Notifications\IpUnblockedNotification;
use Symfony\Component\HttpFoundation\Response;

class BlockSuspiciousIPs
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // Check if IP is blocked
        if ($this->isBlocked($ip)) {
            abort(403, 'Your IP address has been temporarily blocked due to suspicious activity.');
        }

        return $next($request);
    }

    /**
     * Check if IP is blocked
     */
    protected function isBlocked(string $ip): bool
    {
        // Check database instead of Cache
        $block = \App\Models\BlockedIp::where('ip_address', $ip)
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();

        return (bool) $block;
    }

    /**
     * Block an IP address and notify the user
     */
    public static function blockIP(string $ip, int $minutes = 60, string $reason = 'Suspicious activity detected', ?string $email = null): void
    {
        // Try to identify the user
        $user = auth()->user();

        // Fallback 1: Try to find by email if provided
        if (!$user && $email) {
            $user = \App\Models\User::where('email', $email)->first();
        }

        // Fallback 2: Try to find by IP if not currently authenticated
        if (!$user) {
            $user = \App\Models\User::where('last_login_ip', $ip)->first();
        }
        
        \App\Models\BlockedIp::updateOrCreate(
            ['ip_address' => $ip],
            [
                'reason' => $reason,
                'blocked_at' => now(),
                'expires_at' => now()->addMinutes($minutes),
                'user_id' => $user?->id,
                'is_active' => true,
            ]
        );
        
        if ($user) {
            try {
                $user->notify(new IpBlockedNotification($ip, $minutes, $reason));
            } catch (\Exception $e) {
                // Log error but don't crash the request if email fails (e.g. SMTP limits)
                \Illuminate\Support\Facades\Log::error("Failed to send IP blocked notification: " . $e->getMessage());
            }
        }
    }

    /**
     * Unblock an IP address and notify the user
     */
    public static function unblockIP(string $ip): void
    {
        // "Soft" unblock by setting is_active to false
        // This keeps the history of the block
        \App\Models\BlockedIp::where('ip_address', $ip)->update(['is_active' => false]);
        
        // Also clear any cache if it exists (for backward compatibility or fast lookup if we implemented cache later)
        Cache::forget("blocked_ip:{$ip}");
        
        $user = \App\Models\User::where('last_login_ip', $ip)->first();
        
        if ($user) {
            $user->notify(new IpUnblockedNotification($ip));
        }
    }

    /**
     * Increment failed attempts for an IP
     */
    public static function incrementAttempts(string $ip, ?string $email = null): void
    {
        $key = "failed_attempts:{$ip}";
        $attempts = Cache::get($key, 0) + 1;
        
        Cache::put($key, $attempts, now()->addHour());

        // Block IP if too many attempts
        $maxAttempts = config('security.ip_blocking.max_attempts', 10);
        if ($attempts >= $maxAttempts) {
            $blockDuration = config('security.ip_blocking.block_duration_minutes', 60);
            self::blockIP($ip, $blockDuration, 'Too many failed attempts', $email);
        }
    }
}
