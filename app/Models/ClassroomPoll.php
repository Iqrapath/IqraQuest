<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassroomPoll extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'created_by',
        'question',
        'options',
        'type',
        'correct_option',
        'is_active',
        'show_results',
        'ended_at',
    ];

    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
        'show_results' => 'boolean',
        'ended_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(ClassroomPollResponse::class, 'poll_id');
    }

    /**
     * Get results with vote counts
     */
    public function getResultsAttribute(): array
    {
        $responses = $this->responses()->get();
        $results = [];
        
        foreach ($this->options as $index => $option) {
            $count = $responses->where('selected_option', $index)->count();
            $results[] = [
                'option' => $option,
                'index' => $index,
                'count' => $count,
                'percentage' => $responses->count() > 0 
                    ? round(($count / $responses->count()) * 100) 
                    : 0,
                'is_correct' => $this->type === 'quiz' && $this->correct_option === $index,
            ];
        }
        
        return $results;
    }

    /**
     * End the poll
     */
    public function end(): void
    {
        $this->update([
            'is_active' => false,
            'show_results' => true,
            'ended_at' => now(),
        ]);
    }
}
