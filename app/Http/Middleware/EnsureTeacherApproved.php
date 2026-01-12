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
        $user = $request->user();

        Log::info('EnsureTeacherApproved: Checking teacher access', [
            'user_id' => $user?->id,
            'user_role' => $user?->role?->value,
            'url' => $request->fullUrl(),
            'route_name' => $request->route()?->getName(),
        ]);

        if (!$user || $user->role->value !== 'teacher') {
            Log::warning('EnsureTeacherApproved: Unauthorized - not a teacher', [
                'user_id' => $user?->id,
                'user_role' => $user?->role?->value,
            ]);
            abort(403, 'Unauthorized access.');
        }

        $teacher = $user->teacher;

        if (!$teacher) {
            Log::info('EnsureTeacherApproved: No teacher profile, redirecting to onboarding', [
                'user_id' => $user->id,
            ]);
            return redirect()->route('teacher.onboarding.step1');
        }

        Log::info('EnsureTeacherApproved: Teacher status check', [
            'user_id' => $user->id,
            'teacher_id' => $teacher->id,
            'status' => $teacher->status,
            'onboarding_step' => $teacher->onboarding_step,
        ]);

        // If teacher is pending or rejected, redirect to waiting area with message
        // EXCEPT if they are still in onboarding (step < 5) - let them finish first
        if (($teacher->isPending() || $teacher->isRejected()) && $teacher->onboarding_step >= 5) {
            $message = $teacher->isPending() 
                ? 'Your application is under review. You\'ll be notified once approved.'
                : 'Your application was not approved. Please check the waiting area for details.';
            
            Log::info('EnsureTeacherApproved: Teacher not approved, redirecting to waiting area', [
                'user_id' => $user->id,
                'teacher_id' => $teacher->id,
                'status' => $teacher->status,
                'message' => $message,
            ]);

            return redirect()
                ->route('teacher.waiting-area')
                ->with('info', $message);
        }

        // If teacher is not approved, deny access
        // EXCEPT if they are still in onboarding (step < 5) - let them finish first
        if (!$teacher->isApproved() && $teacher->onboarding_step >= 5) {
            Log::warning('EnsureTeacherApproved: Teacher not approved, access denied', [
                'user_id' => $user->id,
                'teacher_id' => $teacher->id,
                'status' => $teacher->status,
            ]);
            abort(403, 'Your teacher account is not approved.');
        }

        Log::info('EnsureTeacherApproved: Access granted', [
            'user_id' => $user->id,
            'teacher_id' => $teacher->id,
        ]);

        return $next($request);
    }
}
