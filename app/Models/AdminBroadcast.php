<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminBroadcast extends Model
{
    protected $fillable = [
        'title',
        'message',
        'type',
        'target_audience',
        'target_user_ids',
        'frequency',
        'scheduled_at',
        'sent_at',
        'status',
        'created_by',
        'total_recipients',
        'delivered_count',
        'read_count',
    ];

    protected $casts = [
        'target_user_ids' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the admin who created this broadcast
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get target users based on audience selection
     */
    public function getTargetUsers()
    {
        $query = User::query();

        switch ($this->target_audience) {
            case 'all':
                $query->whereIn('role', ['student', 'teacher', 'guardian']);
                break;
            case 'students':
                $query->where('role', 'student');
                break;
            case 'teachers':
                $query->where('role', 'teacher');
                break;
            case 'guardians':
                $query->where('role', 'guardian');
                break;
            case 'specific':
                if (!empty($this->target_user_ids)) {
                    $query->whereIn('id', $this->target_user_ids);
                } else {
                    return collect();
                }
                break;
        }

        return $query->get();
    }

    /**
     * Scope for sent broadcasts
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope for scheduled broadcasts
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope for pending broadcasts (due to be sent)
     */
    public function scopePending($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<=', now());
    }
}
