<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use App\Notifications\EmailVerificationOtpNotification;

class OtpVerificationController extends Controller
{
    /**
     * The OTP verification service instance
     */
    protected OtpVerificationService $otpService;

    /**
     * Create a new controller instance
     */
    public function __construct(OtpVerificationService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Display the OTP verification page
     */
    public function show(Request $request): Response|RedirectResponse
    {
        // Redirect if email is already verified
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        // Check if OTP verification is enabled
        if (!$this->otpService->isOtpEnabled()) {
            return redirect()->route('verification.notice');
        }

        // Check if user has a valid OTP
        $hasValidOtp = $request->user()->hasValidOtp();

        return Inertia::render('auth/verify-otp', [
            'hasValidOtp' => $hasValidOtp,
        ]);
    }

    /**
     * Verify the submitted OTP code
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        // Rate limiting: 5 attempts per minute
        $key = 'otp-verify:' . $request->user()->id;
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'otp_code' => "Too many attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        RateLimiter::hit($key, 60);

        // Verify the OTP
        $verified = $this->otpService->verifyOtp(
            $request->user(),
            $request->input('otp_code')
        );

        if (!$verified) {
            return back()->withErrors([
                'otp_code' => 'Invalid or expired OTP code.',
            ]);
        }

        // Clear rate limiter on success
        RateLimiter::clear($key);

        $user = $request->user();

        // Send welcome email after verification (for teachers)
        if ($user->role->value === 'teacher') {
            // Send welcome email with onboarding instructions
            $user->notify(new \App\Notifications\WelcomeTeacherNotification());
            
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

    /**
     * Resend a new OTP code
     */
    public function resend(Request $request): RedirectResponse
    {
        // Rate limiting: 3 resend attempts per 5 minutes
        $key = 'otp-resend:' . $request->user()->id;
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);
            return back()->withErrors([
                'resend' => "Too many resend requests. Please try again in {$minutes} minute(s).",
            ]);
        }

        RateLimiter::hit($key, 300); // 5 minutes

        // Generate a new OTP
        $otpCode = $this->otpService->generateOtp($request->user());
        
        // Get expiry minutes from config
        $expiryMinutes = config('auth.verification.otp_expiry_minutes', 10);

        // Send the OTP via email
        $request->user()->notify(new EmailVerificationOtpNotification($otpCode, $expiryMinutes));

        return back()->with('status', 'verification-otp-sent');
    }
}
