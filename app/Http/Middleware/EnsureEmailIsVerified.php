<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasVerifiedEmail()) {
            $verificationMethod = config('auth.verification.method', 'link');
            
            if ($verificationMethod === 'otp') {
                return redirect()->route('verification.otp');
            }

            return redirect()->route('verification.notice');
        }

        return $next($request);
    }
}
