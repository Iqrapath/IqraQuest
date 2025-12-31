<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'subject_id',
        'subject_name',
        'time_preference',
        'recommendations',
        'status',
        'error_message',
        'emailed_at',
    ];

    protected $casts = [
        'recommendations' => 'array',
        'emailed_at' => 'datetime',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsCompleted(array $recommendations): void
    {
        $this->update([
            'status' => 'completed',
            'recommendations' => $recommendations,
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }

    public function markAsEmailed(): void
    {
        $this->update(['emailed_at' => now()]);
    }
}
