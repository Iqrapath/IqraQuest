<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Notifications\EmailVerificationSentNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index()
    {
        $user = Auth::user();
        $settings = $user->getOrCreateSettings();
        $student = $user->student;

        return Inertia::render('Student/Settings/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
            ],
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
            'student' => [
                'gender' => $student?->gender,
            ],
            'settings' => [
                'is_online' => $settings->is_online,
                'username' => $settings->username ?? $user->name,
                'base_currency' => $settings->base_currency,
                'email_notifications' => $settings->email_notifications,
                'sms_notifications' => $settings->sms_notifications,
                'mobile_alerts' => $settings->mobile_alerts,
                'alert_new_messages' => $settings->alert_new_messages,
                'alert_session_requests' => $settings->alert_session_requests,
                'alert_payment_updates' => $settings->alert_payment_updates,
                'account_deactivated' => $settings->account_deactivated,
            ],
            'currencies' => $this->getCurrencies(),
        ]);
    }

    /**
     * Update account info settings.
     */
    public function updateAccountInfo(Request $request)
    {
        $request->validate([
            'is_online' => 'boolean',
            'username' => 'required|string|max:255',
            'gender' => 'nullable|in:male,female,other',
            'base_currency' => 'required|string|in:NGN,USD',
        ]);

        $user = Auth::user();
        $settings = $user->getOrCreateSettings();

        $settings->update([
            'is_online' => $request->is_online,
            'username' => $request->username,
            'base_currency' => $request->base_currency,
        ]);

        // Update student gender if provided (students table)
        if ($user->student && $request->has('gender')) {
            $user->student->update(['gender' => $request->gender]);
        }

        // Sync currency to wallet if user has a wallet (wallets table)
        if ($user->wallet) {
            $user->wallet->update(['currency' => $request->base_currency]);
        }

        return back()->with('success', 'Account settings updated successfully.');
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Toggle two-factor authentication.
     */
    public function toggleTwoFactor(Request $request)
    {
        $user = Auth::user();
        
        if ($user->two_factor_confirmed_at) {
            // Disable 2FA
            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();

            return back()->with('success', 'Two-factor authentication disabled.');
        }

        // For enabling 2FA, redirect to the 2FA setup page
        return redirect()->route('two-factor.enable');
    }

    /**
     * Toggle account deactivation.
     */
    public function toggleDeactivation(Request $request)
    {
        $user = Auth::user();
        $settings = $user->getOrCreateSettings();

        $newStatus = !$settings->account_deactivated;
        
        $settings->update([
            'account_deactivated' => $newStatus,
            'deactivated_at' => $newStatus ? now() : null,
        ]);

        $message = $newStatus 
            ? 'Account deactivated. You can reactivate it anytime.'
            : 'Account reactivated successfully.';

        return back()->with('success', $message);
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'mobile_alerts' => 'boolean',
        ]);

        $user = Auth::user();
        $settings = $user->getOrCreateSettings();

        $settings->update([
            'email_notifications' => $request->email_notifications ?? false,
            'sms_notifications' => $request->sms_notifications ?? false,
            'mobile_alerts' => $request->mobile_alerts ?? false,
        ]);

        return back()->with('success', 'Notification settings updated successfully.');
    }

    /**
     * Resend email verification notification.
     */
    public function resendEmailVerification(Request $request)
    {
        $user = Auth::user();

        if ($user->hasVerifiedEmail()) {
            return back()->with('info', 'Your email is already verified.');
        }

        // Rate limiting: 3 attempts per 5 minutes
        $key = 'email-verification-resend:' . $user->id;
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);
            return back()->withErrors([
                'verification' => "Too many requests. Please try again in {$minutes} minute(s).",
            ]);
        }

        RateLimiter::hit($key, 300); // 5 minutes

        // Send verification email
        $user->sendEmailVerificationNotification();

        // Send push notification to user
        $user->notify(new EmailVerificationSentNotification());

        return back()->with('success', 'Verification email has been sent!');
    }

    /**
     * Delete the user's account permanently.
     */
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();

        // Log the user out first
        Auth::logout();

        // Delete the user (this will cascade to related models if set up)
        $user->delete();

        // Invalidate and regenerate session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Your account has been permanently deleted.');
    }

    /**
     * Get available currencies.
     */
    private function getCurrencies(): array
    {
        return [
            ['code' => 'NGN', 'name' => 'Nigerian Naira', 'symbol' => '₦'],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$'],
        ];
    }
}

