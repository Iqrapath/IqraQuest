<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'qualifications',
        'specializations',
        'experience_years',
        'hourly_rate',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'specializations' => 'array',
        'hourly_rate' => 'decimal:2',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the user that owns the teacher profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
