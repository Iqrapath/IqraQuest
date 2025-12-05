<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and add security headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent clickjacking attacks
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Enable XSS protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy - Development friendly
        if (app()->environment('local', 'development')) {
            // Relaxed CSP for development
            $csp = implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: blob:",
                "style-src 'self' 'unsafe-inline' http: https:",
                "font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com data:",
                "img-src 'self' data: https: http: blob:",
                "connect-src 'self' ws: wss: http: https:",
                "frame-ancestors 'self'",
            ]);
        } else {
            // Strict CSP for production
            $csp = implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://fonts.bunny.net",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com",
                "font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com data:",
                "img-src 'self' data: https: blob:",
                "connect-src 'self' https:",
                "frame-ancestors 'self'",
            ]);
        }
        $response->headers->set('Content-Security-Policy', $csp);

        // Permissions Policy (formerly Feature Policy)
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // HSTS - Force HTTPS (only in production)
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
