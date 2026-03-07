<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
    ];

    /**
     * Static cache to store settings for the duration of the request.
     * @var array|null
     */
    protected static $cache = null;

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        if (self::$cache === null) {
            self::loadCache();
        }

        if (!array_key_exists($key, self::$cache)) {
            return $default;
        }

        $setting = self::$cache[$key];
        return self::castValue($setting['value'], $setting['type']);
    }

    /**
     * Load all settings into the static cache.
     */
    protected static function loadCache(): void
    {
        // Use application cache to survive across requests if possible, 
        // but fallback to a single DB query for the current request.
        $settings = \Illuminate\Support\Facades\Cache::remember('system_settings_all', now()->addDay(), function () {
            try {
                return self::all(['key', 'value', 'type'])->toArray();
            } catch (\Exception $e) {
                return [];
            }
        });

        self::$cache = [];
        foreach ($settings as $setting) {
            self::$cache[$setting['key']] = [
                'value' => $setting['value'],
                'type' => $setting['type']
            ];
        }
    }

    /**
     * Clear the settings cache.
     */
    public static function clearInternalCache(): void
    {
        self::$cache = null;
        \Illuminate\Support\Facades\Cache::forget('system_settings_all');
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value, string $group = 'general', string $type = 'string')
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'value' => self::serializeValue($value, $type),
                'type' => $type
            ]
        );

        self::clearInternalCache();

        return $setting;
    }

    protected static function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'decimal' => (float) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    protected static function serializeValue($value, string $type)
    {
        if ($type === 'json' || is_array($value)) {
            return json_encode($value);
        }
        return (string) $value;
    }
}
