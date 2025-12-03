<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailVerificationOtp extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'otp_code',
        'expires_at',
        'verified_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the OTP.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include active (non-expired, non-verified) OTPs.
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
                     ->whereNull('verified_at');
    }

    /**
     * Scope a query to only include expired OTPs.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Check if the OTP is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the OTP is verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * Check if the OTP is valid (not expired and not verified).
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isVerified();
    }
}
