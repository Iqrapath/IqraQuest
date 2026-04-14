<?php

namespace App\Traits;

use App\Models\SystemActivity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    /**
     * Boot the trait to attach model events.
     */
    protected static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            self::logActivity($model, 'MODEL_CREATED', "New " . class_basename($model) . " created.");
        });

        static::updated(function ($model) {
            // Only log if data actually changed
            if ($model->wasChanged()) {
                $changes = $model->getChanges();
                // Remove timestamps from changes to reduce noise
                unset($changes['updated_at']);
                
                if (!empty($changes)) {
                    $old = array_intersect_key($model->getOriginal(), $changes);
                    self::logActivity($model, 'MODEL_UPDATED', class_basename($model) . " updated.", $old, $changes);
                }
            }
        });

        static::deleted(function ($model) {
            self::logActivity($model, 'MODEL_DELETED', class_basename($model) . " deleted.", $model->getOriginal());
        });
    }

    /**
     * Helper to perform the actual logging.
     */
    protected static function logActivity($model, string $eventType, string $description, array $old = [], array $new = []): void
    {
        SystemActivity::create([
            'user_id' => Auth::id(),
            'category' => 'DB',
            'event_type' => $eventType,
            'description' => $description,
            'subject_type' => get_class($model),
            'subject_id' => $model->getKey(),
            'old_data' => $old,
            'new_data' => $new,
            'metadata' => [
                'url' => Request::fullUrl(),
                'method' => Request::method(),
                'ip' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ],
            'severity' => 'info',
        ]);
    }
}
