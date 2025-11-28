<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogSuspiciousActivity
{
    /**
     * Suspicious patterns in URLs and inputs
     */
    protected array $suspiciousPatterns = [
        '/\.\.\//',                    // Directory traversal
        '/<script[^>]*>.*?<\/script>/i', // XSS attempts
        '/javascript:/i',              // JavaScript protocol
        '/on\w+\s*=/i',               // Event handlers
        '/eval\(/i',                   // Eval attempts
        '/base64_decode/i',            // Base64 decode
        '/system\(/i',                 // System calls
        '/exec\(/i',                   // Exec calls
        '/passthru\(/i',              // Passthru calls
        '/shell_exec/i',              // Shell exec
        '/phpinfo/i',                 // PHP info
        '/\$_(GET|POST|REQUEST|COOKIE|SERVER)/i', // Superglobal access
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->checkForSuspiciousActivity($request);

        return $next($request);
    }

    /**
     * Check for suspicious activity and log it
     */
    protected function checkForSuspiciousActivity(Request $request): void
    {
        $url = $request->fullUrl();
        $inputs = $request->all();
        $userAgent = $request->userAgent();

        // Check URL
        if ($this->isSuspicious($url)) {
            $this->logSuspiciousReqt($request, 'Suspicious URL pattern detected');
        }

        // Check inputs
        foreach ($inputs as $key => $value) {
            if (is_string($value) && $this->isSuspicious($value)) {
                $this->logSuspiciousRequest($request, "Suspicious input in field: {$key}");
            }
        }

        // Check for common bot patterns
        if ($this->isSuspiciousUserAgent($userAgent)) {
            $this->logSuspiciousRequest($request, 'Suspicious user agent detected');
        }
    }

    /**
     * Check if string contains suspicious patterns
     */
    protected function isSuspicious(string $input): bool
    {
        foreach ($this->suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check for suspicious user agents
     */
    protected function isSuspiciousUserAgent(?string $userAgent): bool
    {
        if (empty($userAgent)) {
            return true;
        }

        $suspiciousAgents = [
            'sqlmap',
            'nikto',
            'nmap',
            'masscan',
            'acunetix',
            'nessus',
            'openvas',
        ];

        foreach ($suspiciousAgents as $agent) {
            if (stripos($userAgent, $agent) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log suspicious request
     */
    protected function logSuspiciousRequest(Request $request, string $reason): void
    {
        Log::warning('Suspicious activity detected', [
            'reason' => $reason,
            'ip' => $request->ip(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
            'inputs' => $request->except(['password', 'password_confirmation']),
        ]);
    }
}

