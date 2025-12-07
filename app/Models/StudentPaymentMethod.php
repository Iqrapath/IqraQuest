<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPaymentMethod extends Model
{
    protected $fillable = [
        'student_id',
        'type',
        'gateway',
        'is_primary',
        'card_authorization_code',
        'card_last4',
        'card_brand',
        'card_exp_month',
        'card_exp_year',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'bank_code',
        'paypal_email',
        'wallet_provider',
        'wallet_phone_number',
        'wallet_account_name',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the student that owns this payment method
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Check if this is a card payment method
     */
    public function isCard(): bool
    {
        return $this->type === 'card';
    }

    /**
     * Check if this is a bank account payment method
     */
    public function isBankAccount(): bool
    {
        return $this->type === 'bank_account';
    }

    /**
     * Check if this is a PayPal payment method
     */
    public function isPayPal(): bool
    {
        return $this->type === 'paypal';
    }

    /**
     * Check if this is the primary payment method
     */
    public function isPrimary(): bool
    {
        return $this->is_primary;
    }

    /**
     * Mark this payment method as verified
     */
    public function verify(): bool
    {
        return $this->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Get masked account number for display
     */
    public function getMaskedNumberAttribute(): ?string
    {
        if ($this->isCard()) {
            return '****' . $this->card_last4;
        }

        if ($this->isBankAccount() && $this->bank_account_number) {
            return '****' . substr($this->bank_account_number, -4);
        }

        return null;
    }
}
