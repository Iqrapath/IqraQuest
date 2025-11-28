<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        return Cache::has("blocked_ip:{$ip}");
    }

    /**
     * Block an IP address
     */
    public static function blockIP(string $ip, int $minutes = 60): void
    {
        Cache::put("blocked_ip:{$ip}", true, now()->addMinutes($minutes));
    }

    /**
     * Increment failed attempts for an IP
     */
    public static function incrementAttempts(string $ip): void
    {
        $key = "failed_attempts:{$ip}";
        $attempts = Cache::get($key, 0) + 1;
        
        Cache::put($key, $attempts, now()->addHour());

        // Block IP if too many attempts
        $maxAttempts = config('security.ip_blocking.max_attempts', 10);
        if ($attempts >= $maxAttempts) {
            $blockDuration = config('security.ip_blocking.block_duration_minutes', 60);
            self::blockIP($ip, $blockDuration);
        }
    }
}
