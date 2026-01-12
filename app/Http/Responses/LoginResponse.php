<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Log;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = auth()->user();
        
        // Update last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);
        
        Log::info('LoginResponse: Determining redirect', [
            'is_teacher' => $user->isTeacher(),
            'has_teacher_profile' => (bool) $user->teacher,
            'onboarding_step' => $user->teacher?->onboarding_step,
        ]);
        
        // Check if there's an intended URL (e.g., email verification link)
        if ($intended = session()->pull('url.intended')) {
            return redirect($intended);
        }
        
        // If teacher hasn't completed onboarding, redirect to the correct step
        if ($user->isTeacher() && $user->teacher && $user->teacher->onboarding_step < 5) {
            $step = $user->teacher->onboarding_step;
            
            // Map step number to route name
            $routeName = match ($step) {
                2 => 'teacher.onboarding.step2',
                3 => 'teacher.onboarding.step3',
                4 => 'teacher.onboarding.step4',
                default => 'teacher.onboarding.step1',
            };

            Log::info('LoginResponse: Redirecting to onboarding step', [
                'step' => $step,
                'route' => $routeName,
            ]);

            return redirect()->route($routeName)
                ->with('success', 'Welcome back! Please continue your onboarding.');
        }
        
        // Redirect to role-specific dashboard
        return redirect()->route($user->dashboardRoute());
    }
}
