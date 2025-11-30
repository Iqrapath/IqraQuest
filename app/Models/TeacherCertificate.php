<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherCertificate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'certificate_type',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'verification_status',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'issue_date',
        'expiry_date',
        'issuing_organization',
        'uploaded_at',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'verified_at' => 'datetime',
        'uploaded_at' => 'datetime',
    ];

    /**
     * Get the teacher that owns this certificate
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the admin who verified this certificate
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Check if certificate is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    /**
     * Check if certificate is verified
     */
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    /**
     * Check if certificate is pending
     */
    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }
}
