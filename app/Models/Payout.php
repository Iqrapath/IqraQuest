<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Payout extends Model
{
    protected $fillable = [
        'teacher_id',
        'amount',
        'currency',
        'status',
        'payment_method_id',
        'gateway',
        'gateway_reference',
        'gateway_response',
        'requested_at',
        'approved_at',
        'approved_by',
        'processed_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the teacher that owns this payout
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the payment method used for this payout
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(TeacherPaymentMethod::class, 'payment_method_id');
    }

    /**
     * Get the admin who approved this payout
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the transaction associated with this payout
     */
    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class, 'transactionable_id')
            ->where('transactionable_type', self::class);
    }

    /**
     * Scope for pending payouts
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved payouts
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for processing payouts
     */
    public function scopeProcessing(Builder $query): Builder
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope for completed payouts
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for rejected payouts
     */
    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Approve the payout
     */
    public function approve(int $adminId): bool
    {
        return $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $adminId,
        ]);
    }

    /**
     * Reject the payout
     */
    public function reject(string $reason, int $adminId): bool
    {
        return $this->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'approved_by' => $adminId,
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Mark payout as processing
     */
    public function markAsProcessing(): bool
    {
        return $this->update(['status' => 'processing']);
    }

    /**
     * Mark payout as completed
     */
    public function markAsCompleted(): bool
    {
        return $this->update([
            'status' => 'completed',
            'processed_at' => now(),
        ]);
    }

    /**
     * Check if payout can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'approved']);
    }
}
