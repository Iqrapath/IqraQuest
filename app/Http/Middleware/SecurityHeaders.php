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
            // Relaxed CSP for development (includes Paystack and classroom materials)
            $csp = implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: blob: https://js.paystack.co https://checkout.paystack.com",
                "style-src 'self' 'unsafe-inline' http: https: https://paystack.com https://checkout.paystack.com",
                "font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com https://fonts.googleapis.com data:",
                "img-src 'self' data: https: http: blob:",
                "connect-src 'self' ws: wss: http: https: https://api.paystack.co https://checkout.paystack.com https://api.quran.com",
                "frame-src 'self' blob: data: https://checkout.paystack.com https://js.paystack.co http: https:",
                "frame-ancestors 'self'",
                "object-src 'self' blob: data: http: https:",
                "media-src 'self' blob: data: https://verses.quran.com https://*.quran.com",
            ]);
        } else {
            // Strict CSP for production (includes Paystack and classroom materials)
            $csp = implode('; ', [
                "default-src 'self'",
               "script-src 'self' 'unsafe-inline' blob: https://js.paystack.co https://checkout.paystack.com",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com https://paystack.com",
                "font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com https://fonts.googleapis.com data:",
                "img-src 'self' data: https: blob:",
                "connect-src 'self' https: https://api.paystack.co https://api.quran.com",
                "frame-src 'self' blob: data: https://checkout.paystack.com https://js.paystack.co https:",
                "frame-ancestors 'self'",
                "object-src 'self' blob: data: https:",
                "media-src 'self' blob: data: https://verses.quran.com https://*.quran.com",
            ]);
        }
        $response->headers->set('Content-Security-Policy', $csp);

        // Permissions Policy (formerly Feature Policy)
        // Allow camera/microphone for the classroom
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(self), camera=(self)');

        // HSTS - Force HTTPS (only in production)
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
