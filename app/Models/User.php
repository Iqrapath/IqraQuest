<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, \App\Traits\HasPermissions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
        'phone',
        'avatar',
        'status',
        'onboarding_completed_at',
        'onboarding_skipped',
        'google_id',
        'facebook_id',
        'email_verified_at',
        'last_login_ip',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'onboarding_skipped' => 'boolean',
            'role' => UserRole::class,
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    /**
     * Check if user is teacher
     */
    public function isTeacher(): bool
    {
        return $this->role === UserRole::TEACHER;
    }

    /**
     * Check if user is guardian
     */
    public function isGuardian(): bool
    {
        return $this->role === UserRole::GUARDIAN;
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role === UserRole::STUDENT;
    }

    /**
     * Get the teacher profile
     */
    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    /**
     * Get the guardian profile
     */
    public function guardian(): HasOne
    {
        return $this->hasOne(Guardian::class);
    }

    /**
     * Get the student profile
     */
    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Get the user's wallet
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Get the user's settings
     */
    public function settings(): HasOne
    {
        return $this->hasOne(UserSettings::class);
    }

    /**
     * Get or create user settings
     */
    public function getOrCreateSettings(): UserSettings
    {
        return $this->settings ?? $this->settings()->create([
            'username' => $this->name,
        ]);
    }

    /**
     * Get all transactions for the user
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the email verification OTPs for the user
     */
    public function emailVerificationOtps()
    {
        return $this->hasMany(EmailVerificationOtp::class);
    }

    /**
     * Get the latest valid OTP for the user
     */
    public function latestOtp()
    {
        return $this->emailVerificationOtps()
            ->active()
            ->latest()
            ->first();
    }

    /**
     * Check if the user has a valid OTP
     */
    public function hasValidOtp(): bool
    {
        return $this->latestOtp() !== null;
    }

    /**
     * Get dashboard route based on role
     */
    public function dashboardRoute(): string
    {
        return $this->role->dashboardRoute();
    }

    /**
     * Check if user has completed onboarding
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null || $this->onboarding_skipped;
    }

    /**
     * Check if user's email is verified
     */
    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Get the notification routing information for broadcast channel
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'App.Models.User.' . $this->id;
    }

    /**
     * Get the bookings for the user (as a student).
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Set the user's avatar.
     * Automatically handles file upload if an UploadedFile instance is passed.
     */
    public function setAvatarAttribute($value)
    {
        if ($value instanceof \Illuminate\Http\UploadedFile) {
            $uploadService = app(\App\Services\FileUploadService::class);
            $this->attributes['avatar'] = $uploadService->upload($value, 'avatars', $this->name, 'avatar');
        } else {
            $this->attributes['avatar'] = $value;
        }
    }

    /**
     * Send the email verification notification.
     * Overridden to support OTP verification method.
     */
    public function sendEmailVerificationNotification()
    {
        $verificationMethod = config('auth.verification.method', 'link');

        if ($verificationMethod === 'otp') {
            $otpService = app(\App\Services\OtpVerificationService::class);
            $otpCode = $otpService->generateOtp($this);
            $expiryMinutes = config('auth.verification.otp_expiry_minutes', 10);
            
            $this->notify(new \App\Notifications\EmailVerificationOtpNotification($otpCode, $expiryMinutes));
        } else {
            $this->notify(new \Illuminate\Auth\Notifications\VerifyEmail);
        }
    }

    /**
     * Get the avatar URL.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar && $this->avatar !== 'default.png') {
            if (str_starts_with($this->avatar, 'http')) {
                return $this->avatar;
            }
            return \Illuminate\Support\Facades\Storage::url($this->avatar);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar_url',
    ];
}
