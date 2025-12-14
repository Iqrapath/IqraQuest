<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RescheduleRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'requested_by',
        'original_start_time',
        'new_start_time',
        'new_end_time',
        'reason',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'original_start_time' => 'datetime',
        'new_start_time' => 'datetime',
        'new_end_time' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
