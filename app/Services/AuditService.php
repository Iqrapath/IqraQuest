<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Log a critical event for audit purposes.
     *
     * @param string $eventType The type of event (e.g., PAYOUT_APPROVED)
     * @param Model|null $auditable The model being acted upon
     * @param array $oldValues Values before the change
     * @param array $newValues Values after the change
     * @param string|null $description Human-readable description
     * @param array $metadata Additional context
     * @return AuditLog
     */
    public function log(
        string $eventType,
        ?Model $auditable = null,
        array $oldValues = [],
        array $newValues = [],
        ?string $description = null,
        array $metadata = []
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'event_type' => $eventType,
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable ? $auditable->getKey() : null,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'description' => $description,
            'metadata' => array_merge([
                'request_url' => Request::fullUrl(),
                'method' => Request::method(),
            ], $metadata),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Log a status transition for a model.
     */
    public function logStatusChange(Model $model, string $oldStatus, string $newStatus, ?string $reason = null): AuditLog
    {
        return $this->log(
            'STATUS_CHANGE',
            $model,
            ['status' => $oldStatus],
            ['status' => $newStatus],
            $reason ?? "Changed status from {$oldStatus} to {$newStatus}"
        );
    }

    /**
     * Log a financial event specifically.
     */
    public function logFinancial(string $type, Model $source, float $amount, string $description): AuditLog
    {
        return $this->log(
            $type,
            $source,
            [],
            ['amount' => $amount],
            $description,
            ['is_financial' => true]
        );
    }

    /**
     * Static helper for quick logging
     */
    public static function logEvent(...$args): AuditLog
    {
        return app(self::class)->log(...$args);
    }
}
