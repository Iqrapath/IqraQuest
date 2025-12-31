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
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        return self::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value, string $group = 'general', string $type = 'string')
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'value' => self::serializeValue($value, $type),
                'type' => $type
            ]
        );
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
