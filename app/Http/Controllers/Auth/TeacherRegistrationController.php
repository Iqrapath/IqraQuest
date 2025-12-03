<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherRegistrationRequest;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class TeacherRegistrationController extends Controller
{
    /**
     * Show the teacher registration form
     */
    public function create(): Response
    {
        return Inertia::render('auth/TeacherRegister', [
            'verificationMethod' => config('auth.verification.method', 'link'),
        ]);
    }

    /**
     * Handle teacher registration
     */
    public function store(TeacherRegistrationRequest $request): RedirectResponse
    {
        // Create user with teacher role
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'teacher',
        ]);

        // Create teacher profile
        Teacher::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'onboarding_step' => 1,
        ]);

        // Check verification method from config
        $verificationMethod = config('auth.verification.method', 'link');

        if ($verificationMethod === 'otp') {
            // Generate and send OTP
            $otpService = app(\App\Services\OtpVerificationService::class);
            $otpCode = $otpService->generateOtp($user);
            $expiryMinutes = config('auth.verification.otp_expiry_minutes', 10);
            
            // Send OTP via email
            $user->notify(new \App\Notifications\EmailVerificationOtpNotification($otpCode, $expiryMinutes));
        } else {
            // Use default link-based email verification
            $user->sendEmailVerificationNotification();
        }

        // DON'T log the user in - they need to verify email first
        // Stay on page to show modal
        return back()->with('success', 'Registration successful! Please check your email to verify your account.');
    }
}
