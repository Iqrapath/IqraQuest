<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeacherApproved
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role->value !== 'teacher') {
            abort(403, 'Unauthorized access.');
        }

        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('teacher.onboarding.step1');
        }

        // If teacher is pending or rejected, redirect to waiting area
        if ($teacher->isPending() || $teacher->isRejected()) {
            return redirect()->route('teacher.waiting-area');
        }

        // If teacher is not approved, deny access
        if (!$teacher->isApproved()) {
            abort(403, 'Your teacher account is not approved.');
        }

        return $next($request);
    }
}
