<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeacherApproved
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Allow access to verification room even if not approved
        // We use both name and path check for maximum reliability
        if (str_contains($request->path(), 'verification/room') || $request->routeIs('*.verification.room')) {
            return $next($request);
        }

        $user = $request->user();

        if (!$user || $user->role->value !== 'teacher') {
            abort(403, 'Unauthorized access.');
        }

        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('teacher.onboarding.step1');
        }

        // If teacher is pending, rejected, or under review, redirect to waiting area
        $isRestricted = $teacher->isPending() || $teacher->isRejected() || $teacher->status === 'under_review';

        if ($isRestricted && $teacher->onboarding_step >= 5) {
            // Only redirect if NOT already on the waiting area page
            if (!$request->routeIs('teacher.waiting-area')) {
                $message = match ($teacher->status) {
                    'pending' => 'Your application is under review. You\'ll be notified once approved.',
                    'under_review' => 'Your application is currently being processed.',
                    'rejected' => 'Your application was not approved. Please check the waiting area for details.',
                    default => 'Your account is currently restricted.'
                };

                return redirect()
                    ->route('teacher.waiting-area')
                    ->with('info', $message);
            }

            return $next($request);
        }

        // Check if teacher is approved
        if (!$teacher->isApproved() && $teacher->onboarding_step >= 5) {
            abort(403, 'Your teacher account is not approved.');
        }

        return $next($request);
    }
}
