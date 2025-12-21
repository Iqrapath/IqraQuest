<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'level',
        'bio',
        'city',
        'country',
        'timezone',
        'preferred_days',
        'preferred_hours',
        'availability_type',
        'learning_goal_description',
        'learning_goals',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'learning_goals' => 'array',
        'preferred_days' => 'array',
    ];

    /**
     * Get the user that owns the student profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the guardians for this student
     */
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(Guardian::class, 'guardian_student')
            ->withPivot('relationship', 'is_primary')
            ->withTimestamps();
    }

    /**
     * Get the subjects linked to this student (Learning Preferences)
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'student_subjects')
            ->withTimestamps();
    }
}
