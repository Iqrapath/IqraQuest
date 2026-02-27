<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

use Carbon\Carbon;

class UtcDateTime implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return $value ? Carbon::parse($value, 'UTC') : null;
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return $value ? (is_string($value) ? Carbon::parse($value, 'UTC')->format('Y-m-d H:i:s') : \Carbon\Carbon::parse($value)->setTimezone('UTC')->format('Y-m-d H:i:s')) : null;
    }
}
