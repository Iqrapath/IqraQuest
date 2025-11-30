<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        // Approval workflow
        'status',
        'approved_by',
        'rejected_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'application_submitted_at',
        // Personal information
        'country',
        'city',
        'preferred_language',
        // Teaching details
        'bio',
        'qualifications',
        'qualification_level',
        'specializations',
        'experience_years',
        // Availability
        'timezone',
        'teaching_mode',
        'teaching_type',
        'holiday_mode',
        // Payment
        'preferred_currency',
        'hourly_rate',
    ];

    protected $casts = [
        'specializations' => 'array',
        'holiday_mode' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'application_submitted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the teacher profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subjects that this teacher teaches
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects')
            ->withPivot('proficiency_level', 'years_teaching')
            ->withTimestamps();
    }

    /**
     * Get the admin who approved this teacher
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the admin who rejected this teacher
     */
    public function rejecter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Check if teacher is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if teacher is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if teacher is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if teacher is under review
     */
    public function isUnderReview(): bool
    {
        return $this->status === 'under_review';
    }

    /**
     * Get the certificates for this teacher
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(TeacherCertificate::class);
    }

    /**
     * Get only verified certificates
     */
    public function verifiedCertificates(): HasMany
    {
        return $this->certificates()->where('verification_status', 'verified');
    }

    /**
     * Get the availability schedule for this teacher
     */
    public function availability(): HasMany
    {
        return $this->hasMany(TeacherAvailability::class);
    }

    /**
     * Get only available days
     */
    public function availableDays(): HasMany
    {
        return $this->availability()->where('is_available', true);
    }

    /**
     * Check if teacher is on holiday
     */
    public function isOnHoliday(): bool
    {
        return $this->holiday_mode;
    }

    /**
     * Get the payment methods for this teacher
     */
    public function paymentMethods(): HasMany
    {
        return $this->hasMany(TeacherPaymentMethod::class);
    }

    /**
     * Get the payment method for this teacher (singular - for convenience)
     */
    public function paymentMethod(): HasMany
    {
        return $this->hasMany(TeacherPaymentMethod::class);
    }

    /**
     * Get the primary payment method
     */
    public function primaryPaymentMethod(): HasMany
    {
        return $this->paymentMethods()->where('is_primary', true);
    }
}
