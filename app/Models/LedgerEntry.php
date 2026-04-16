<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    /**
     * Table only defines created_at (see migration). Do not let Eloquent write updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'amount',
        'type',
        'category',
        'source_type',
        'source_id',
        'balance_before',
        'balance_after',
        'metadata',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function source()
    {
        return $this->morphTo();
    }
}
