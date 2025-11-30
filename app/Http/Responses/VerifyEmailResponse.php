<?php

namespace App\Http\Responses;

use App\Notifications\WelcomeTeacherNotification;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        
        // Send welcome email after verification (for teachers)
        if ($user->role->value === 'teacher') {
            // Send welcome email with onboarding instructions
            // This will be logged to storage/logs/laravel.log in development
            $user->notify(new WelcomeTeacherNotification());
            
            // Redirect to onboarding
            return redirect()->route('teacher.onboarding.step1')
                ->with('success', 'Email verified! Please complete your teacher onboarding.');
        }
        
        // Redirect based on user role
        return match ($user->role->value) {
            'student', 'guardian' => redirect()->route('profile.complete')
                ->with('success', 'Email verified! Please complete your profile.'),
            'admin' => redirect()->route('admin.dashboard')
                ->with('success', 'Email verified successfully!'),
            default => redirect()->route('dashboard')
                ->with('success', 'Email verified successfully!'),
        };
    }
}
