<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityLog extends Model
{
    protected $fillable = [
        'event_type',
        'ip_address',
        'user_id',
        'description',
        'metadata',
        'severity',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user associated with the security log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log a security event
     */
    public static function logEvent(
        string $eventType,
        string $ipAddress,
        ?int $userId = null,
        ?string $description = null,
        ?array $metadata = null,
        string $severity = 'info'
    ): self {
        return self::create([
            'event_type' => $eventType,
            'ip_address' => $ipAddress,
            'user_id' => $userId,
            'description' => $description,
            'metadata' => $metadata,
            'severity' => $severity,
        ]);
    }
}
