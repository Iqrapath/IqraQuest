<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $settings = $user->getOrCreateSettings();
        
        // Ensure currency is set to NGN or USD
        if (!in_array($settings->base_currency, ['NGN', 'USD'])) {
            $settings->update(['base_currency' => 'NGN']);
        }

        return Inertia::render('Guardian/Settings/Index', [
            'user' => $user, // Passing user directly as expected by props
            'auth' => [
                'user' => $user,
            ],
            'settings' => $settings,
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && !$user->hasVerifiedEmail(),
            'status' => session('status'),
            'requiresConfirmation' => in_array(
                Features::twoFactorAuthentication(), 
                Features::enabled(Features::twoFactorAuthentication()) ? ['confirm' => true] : []
            ),
            'email_verified_at' => $user->email_verified_at,
            'preferences' => [
                'email_notifications' => $settings->email_notifications,
                'sms_notifications' => $settings->sms_notifications,
                'mobile_alerts' => $settings->mobile_alerts,
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
            'base_currency' => 'required|string|in:NGN,USD',
        ]);

        $user = Auth::user();
        $settings = $user->getOrCreateSettings();

        $settings->update([
            'is_online' => $request->is_online,
            'username' => $request->username,
            'base_currency' => $request->base_currency,
        ]);

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
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Resend the email verification notification.
     */
    public function resendEmailVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return back()->with('status', 'already-verified');
        }

        $user->sendEmailVerificationNotification();
        
        // Send push notification about email being sent
        $user->notify(new \App\Notifications\EmailVerificationSentNotification());

        return back()->with('success', 'verification-link-sent');
    }

    /**
     * Toggle Two Factor Authentication.
     */
    public function toggleTwoFactor(Request $request)
    {
        // This is largely handled by Fortify routes directly from frontend
        return back();
    }

    /**
     * Toggle Account Deactivation.
     */
    public function toggleDeactivation(Request $request)
    {
        $user = Auth::user();
        $settings = $user->getOrCreateSettings();

        $settings->update([
            'account_deactivated' => !$settings->account_deactivated
        ]);

        $status = $settings->account_deactivated ? 'deactivated' : 'reactivated';
        return back()->with('success', "Account has been {$status}.");
    }

    /**
     * Delete account permanently.
     */
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password']
        ]);

        $user = $request->user();

        Auth::logout();

        if ($user->delete()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return Inertia::location('/');
        }
        
        return back()->withErrors(['password' => 'Unable to delete account.']);
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
