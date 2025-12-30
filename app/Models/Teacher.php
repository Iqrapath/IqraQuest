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
        'approval_override_reason',
        'application_submitted_at',
        'video_verification_status',
        'video_verification_room_id',
        'video_verification_scheduled_at',
        'video_verification_platform',
        'video_verification_notes',
        // Personal information
        'country',
        'city',
        'preferred_language',
        // Teaching details
        'bio',
        'intro_video_url',
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
        'automatic_payouts',
        'last_payout_requested_at',
        'last_auto_payout_at',
        'hourly_rate',
        // Teacher type & subscription teaching
        'teacher_type',
        'per_student_rate',
        'per_session_rate',
    ];

    protected $casts = [
        'specializations' => 'array',
        'holiday_mode' => 'boolean',
        'automatic_payouts' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'per_student_rate' => 'decimal:2',
        'per_session_rate' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'application_submitted_at' => 'datetime',
        'video_verification_scheduled_at' => 'datetime',
        'last_payout_requested_at' => 'datetime',
        'last_auto_payout_at' => 'datetime',
    ];

    protected $appends = [
        'has_required_docs_verified',
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
     * Get the reviews for the teacher
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the teacher's average rating
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->where('is_approved', true)->avg('rating') ?? 0;
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
     * Check if teacher is suspended
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if teacher has required documents verified (ID and CV)
     */
    public function getHasRequiredDocsVerifiedAttribute(): bool
    {
        $requiredTypes = ['id_card_front', 'id_card_back', 'cv'];
        $verifiedCount = $this->certificates()
            ->whereIn('certificate_type', $requiredTypes)
            ->where('verification_status', 'verified')
            ->count();

        return $verifiedCount >= 3; // Assuming front, back and cv are required
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

    /**
     * Get the payouts for this teacher
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    // ===== TEACHER TYPE METHODS =====

    /**
     * Check if teacher is freelance type
     */
    public function isFreelance(): bool
    {
        return $this->teacher_type === 'freelance';
    }

    /**
     * Check if teacher is hybrid type
     */
    public function isHybrid(): bool
    {
        return $this->teacher_type === 'hybrid';
    }

    /**
     * Check if teacher can do freelance bookings
     */
    public function canDoFreelance(): bool
    {
        return in_array($this->teacher_type, ['freelance', 'hybrid']);
    }

    /**
     * Scope to get freelance/hybrid teachers (can do bookings)
     */
    public function scopeCanDoFreelance($query)
    {
        return $query->whereIn('teacher_type', ['freelance', 'hybrid']);
    }
}
