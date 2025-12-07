<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'type',
        'amount',
        'currency',
        'status',
        'payment_gateway',
        'gateway_reference',
        'description',
        'metadata',
        'transactionable_type',
        'transactionable_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the wallet associated with the transaction
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Get the owning transactionable model (Booking, Payout, etc.)
     */
    public function transactionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope for credit transactions
     */
    public function scopeCredits(Builder $query): Builder
    {
        return $query->where('type', 'credit');
    }

    /**
     * Scope for debit transactions
     */
    public function scopeDebits(Builder $query): Builder
    {
        return $query->where('type', 'debit');
    }

    /**
     * Scope for completed transactions
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for pending transactions
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope transactions by gateway
     */
    public function scopeByGateway(Builder $query, string $gateway): Builder
    {
        return $query->where('payment_gateway', $gateway);
    }

    /**
     * Check if transaction is a credit
     */
    public function isCredit(): bool
    {
        return $this->type === 'credit';
    }

    /**
     * Check if transaction is a debit
     */
    public function isDebit(): bool
    {
        return $this->type === 'debit';
    }

    /**
     * Mark transaction as completed
     */
    public function markAsCompleted(): bool
    {
        // Only proceed if currently pending
        if ($this->status !== 'pending') {
            return false;
        }

        \DB::transaction(function () {
            // Update transaction status
            $this->update(['status' => 'completed']);

            // If this is a credit transaction, update wallet balance
            if ($this->type === 'credit' && $this->wallet_id) {
                $this->wallet()->increment('balance', $this->amount);
            } elseif ($this->type === 'debit' && $this->wallet_id) {
                $this->wallet()->decrement('balance', $this->amount);
            }
        });

        return true;
    }

    /**
     * Mark transaction as failed
     */
    public function markAsFailed(): bool
    {
        return $this->update(['status' => 'failed']);
    }
}
