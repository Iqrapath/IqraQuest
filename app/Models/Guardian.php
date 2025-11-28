<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Guardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'address',
        'city',
        'country',
    ];

    /**
     * Get the user that owns the guardian profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the students (children) for this guardian
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'guardian_student')
            ->withPivot('relationship', 'is_primary')
            ->withTimestamps();
    }
}
