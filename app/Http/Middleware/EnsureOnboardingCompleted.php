<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingCompleted
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if onboarding is completed or skipped
        if (!$user->onboarding_completed_at && !$user->onboarding_skipped) {
            // Redirect to appropriate onboarding step based on role
            return match ($user->role->value) {
                'teacher' => redirect()->route('teacher.onboarding.step1'),
                'student', 'guardian' => redirect()->route('profile.complete'),
                default => redirect()->route('dashboard'),
            };
        }

        return $next($request);
    }
}
