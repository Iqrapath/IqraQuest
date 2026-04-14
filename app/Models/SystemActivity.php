<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SystemActivity extends Model
{
    use SoftDeletes;
    /**
     * Note: system_activities are append-only.
     */
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'category',
        'event_type',
        'description',
        'subject_type',
        'subject_id',
        'old_data',
        'new_data',
        'metadata',
        'severity',
        'created_at',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user who performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subject of the activity (e.g., Booking, Teacher).
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
