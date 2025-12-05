<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'balance',
        'currency',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    /**
     * Get the user that owns the wallet
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all transactions for this wallet
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Credit the wallet
     */
    public function credit(float $amount, string $description, array $metadata = []): Transaction
    {
        $this->increment('balance', $amount);

        return $this->transactions()->create([
            'user_id' => $this->user_id,
            'type' => 'credit',
            'amount' => $amount,
            'currency' => $this->currency,
            'status' => 'completed',
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Debit the wallet
     */
    public function debit(float $amount, string $description, array $metadata = []): Transaction
    {
        if (!$this->canDebit($amount)) {
            throw new \Exception('Insufficient balance');
        }

        $this->decrement('balance', $amount);

        return $this->transactions()->create([
            'user_id' => $this->user_id,
            'type' => 'debit',
            'amount' => $amount,
            'currency' => $this->currency,
            'status' => 'completed',
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Check if wallet has sufficient balance
     */
    public function canDebit(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Get current balance
     */
    public function getBalance(): float
    {
        return (float) $this->balance;
    }
}
