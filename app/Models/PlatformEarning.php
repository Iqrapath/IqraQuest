<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformEarning extends Model
{
    protected $fillable = [
        'transaction_id',
        'booking_id',
        'amount',
        'percentage',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
    ];

    /**
     * Get the transaction that generated this earning
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the booking associated with this earning (when booking system is built)
     */
    public function booking(): BelongsTo
    {
        // This will work once bookings table is created
        return $this->belongsTo(\App\Models\Booking::class);
    }
}
