<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'user_id',
        'subject_id',
        'start_time',
        'end_time',
        'status',
        'total_price',
        'currency',
        'commission_rate',
        'meeting_link',
        'cancellation_reason',
        'parent_booking_id',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'total_price' => 'decimal:2',
        'commission_rate' => 'decimal:2',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function parentBooking()
    {
        return $this->belongsTo(Booking::class, 'parent_booking_id');
    }

    public function childBookings()
    {
        return $this->hasMany(Booking::class, 'parent_booking_id');
    }
    
    public function rescheduleRequests()
    {
        return $this->hasMany(RescheduleRequest::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'awaiting_approval', 'confirmed', 'rescheduling']);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now())->where('status', 'confirmed');
    }
}
