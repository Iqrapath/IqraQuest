<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherPaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'payment_type',
        'is_primary',
        'bank_name',
        'account_number',
        'account_name',
        'bank_code',
        'routing_number',
        'email',
        'account_id',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the teacher that owns this payment method
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Check if this is a bank transfer method
     */
    public function isBankTransfer(): bool
    {
        return $this->payment_type === 'bank_transfer';
    }

    /**
     * Check if this is the primary payment method
     */
    public function isPrimary(): bool
    {
        return $this->is_primary;
    }
}
