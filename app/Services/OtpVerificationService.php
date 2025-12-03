<?php

namespace App\Services;

use App\Models\EmailVerificationOtp;
use App\Models\User;
use Carbon\Carbon;

class OtpVerificationService
{
    /**
     * Generate a 6-digit OTP for the user
     *
     * @param User $user
     * @return string The generated OTP code
     */
    public function generateOtp(User $user): string
    {
        // Invalidate any previous OTPs for this user
        $this->clearUserOtps($user);

        // Generate a random 6-digit code
        $otpCode = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Get expiry minutes from config and cast to integer
        $expiryMinutes = (int) config('auth.verification.otp_expiry_minutes', 10);

        // Create the OTP record
        EmailVerificationOtp::create([
            'user_id' => $user->id,
            'otp_code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes($expiryMinutes),
        ]);

        return $otpCode;
    }

    /**
     * Verify an OTP code for a user
     *
     * @param User $user
     * @param string $code
     * @return bool
     */
    public function verifyOtp(User $user, string $code): bool
    {
        // Find an active OTP matching the code
        $otp = $user->emailVerificationOtps()
            ->active()
            ->where('otp_code', $code)
            ->first();

        if (!$otp) {
            return false;
        }

        // Mark the OTP as verified
        $otp->update(['verified_at' => now()]);

        // Mark the user's email as verified
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return true;
    }

    /**
     * Clear all OTPs for a user
     *
     * @param User $user
     * @return void
     */
    public function clearUserOtps(User $user): void
    {
        $user->emailVerificationOtps()->delete();
    }

    /**
     * Clean up expired OTPs from the database
     *
     * @return int Number of deleted records
     */
    public function cleanExpiredOtps(): int
    {
        return EmailVerificationOtp::expired()->delete();
    }

    /**
     * Check if the user has a valid OTP
     *
     * @param User $user
     * @return bool
     */
    public function hasValidOtp(User $user): bool
    {
        return $user->hasValidOtp();
    }

    /**
     * Get the current verification method from config
     *
     * @return string 'link' or 'otp'
     */
    public function getVerificationMethod(): string
    {
        return config('auth.verification.method', 'link');
    }

    /**
     * Check if OTP verification is enabled
     *
     * @return bool
     */
    public function isOtpEnabled(): bool
    {
        return $this->getVerificationMethod() === 'otp';
    }

    /**
     * Check if link verification is enabled
     *
     * @return bool
     */
    public function isLinkEnabled(): bool
    {
        return $this->getVerificationMethod() === 'link';
    }
}
