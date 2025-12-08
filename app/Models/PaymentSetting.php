<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = [
        'commission_rate',
        'commission_type',
        'auto_payout_threshold',
        'min_withdrawal_amount',
        'bank_verification_enabled',
        'withdrawal_note',
        'apply_time',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'auto_payout_threshold' => 'decimal:2',
        'min_withdrawal_amount' => 'decimal:2',
        'bank_verification_enabled' => 'boolean',
    ];
}
