<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'event_type',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'metadata',
        'description',
        'ip_address',
        'user_agent',
    ];

    /**
     * Disable updated_at for audit logs as they are append-only.
     */
    const UPDATED_AT = null;

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the actor who performed the action.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the polymorphic auditable model.
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }
}
