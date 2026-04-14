<?php

namespace App\Services;

use App\Models\SystemActivity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class SystemLogService
{
    /**
     * Log a general informational event.
     */
    public static function info(string $eventType, string $description, ?array $metadata = [], $subject = null): SystemActivity
    {
        return self::log('APP', $eventType, $description, $metadata, 'info', $subject);
    }

    /**
     * Log a warning event.
     */
    public static function warning(string $eventType, string $description, ?array $metadata = [], $subject = null): SystemActivity
    {
        return self::log('APP', $eventType, $description, $metadata, 'warning', $subject);
    }

    /**
     * Log an error event.
     */
    public static function error(string $eventType, string $description, ?array $metadata = [], $subject = null): SystemActivity
    {
        return self::log('ERROR', $eventType, $description, $metadata, 'error', $subject);
    }

    /**
     * Log a critical system event.
     */
    public static function critical(string $eventType, string $description, ?array $metadata = [], $subject = null): SystemActivity
    {
        return self::log('SEVERE', $eventType, $description, $metadata, 'critical', $subject);
    }

    /**
     * Internal logger.
     */
    public static function log(string $category, string $eventType, string $description, ?array $metadata = [], string $severity = 'info', $subject = null): SystemActivity
    {
        $data = [
            'user_id' => Auth::id(),
            'category' => $category,
            'event_type' => $eventType,
            'description' => $description,
            'metadata' => array_merge($metadata ?? [], [
                'url' => Request::fullUrl(),
                'ip' => Request::ip(),
            ]),
            'severity' => $severity,
        ];

        if ($subject) {
            $data['subject_type'] = get_class($subject);
            $data['subject_id'] = $subject->getKey();
        }

        return SystemActivity::create($data);
    }
}
