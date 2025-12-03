<?php

namespace App\Http\Responses;

use App\Notifications\WelcomeTeacherNotification;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        
        // Clean up any existing OTPs since email is now verified
        $otpService = app(\App\Services\OtpVerificationService::class);
        $otpService->clearUserOtps($user);
        
        // Send welcome email after verification (for teachers)
        if ($user->role->value === 'teacher') {
            // Send welcome email with onboarding instructions
            // This will be logged to storage/logs/laravel.log in development
            $user->notify(new WelcomeTeacherNotification());
            
            // Redirect to onboarding
            return redirect()->route('teacher.onboarding.step1')
                ->with('success', 'Email verified! Please complete your teacher onboarding.');
        }
        
        // Check if student/guardian needs to select role
        if ($user->role->value === 'student' && !$user->student) {
            return redirect()->route('select-role')
                ->with('success', 'Email verified! Please select your role to continue.');
        }
        
        if ($user->role->value === 'guardian' && !$user->guardian) {
            return redirect()->route('select-role')
                ->with('success', 'Email verified! Please select your role to continue.');
        }
        
        // Redirect based on user role
        return match ($user->role->value) {
            'student' => redirect()->route('student.dashboard')
                ->with('success', 'Email verified successfully!'),
            'guardian' => redirect()->route('guardian.dashboard')
                ->with('success', 'Email verified successfully!'),
            'admin' => redirect()->route('admin.dashboard')
                ->with('success', 'Email verified successfully!'),
            default => redirect()->route('dashboard')
                ->with('success', 'Email verified successfully!'),
        };
    }
}
