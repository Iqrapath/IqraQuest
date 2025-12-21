<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'is_online',
        'username',
        'base_currency',
        'email_notifications',
        'sms_notifications',
        'mobile_alerts',
        'alert_new_messages',
        'alert_session_requests',
        'alert_payment_updates',
        'account_deactivated',
        'deactivated_at',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'mobile_alerts' => 'boolean',
        'alert_new_messages' => 'boolean',
        'alert_session_requests' => 'boolean',
        'alert_payment_updates' => 'boolean',
        'account_deactivated' => 'boolean',
        'deactivated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
