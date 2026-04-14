<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use App\Models\ClassroomAttendance;
use App\Traits\LogsActivity;

class Booking extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'teacher_id',
        'user_id',
        'student_id',
        'subject_id',
        'start_time',
        'end_time',
        'status',
        'payment_status',
        'total_price',
        'currency',
        'commission_rate',
        'funds_held_at',
        'funds_released_at',
        'funds_refunded_at',
        'amount_released',
        'amount_refunded',
        'dispute_raised_at',
        'dispute_reason',
        'dispute_resolved_at',
        'dispute_resolution',
        'dispute_resolved_by',
        'teacher_attended',
        'student_attended',
        'actual_duration_minutes',
        'session_started_at',
        'session_ended_at',
        'judgment_at',
        'judgment_reason',
        'no_show_warning_sent_at',
        'meeting_link',
        'cancellation_reason',
        'parent_booking_id',
        'notes',
    ];

    protected $casts = [
        'start_time' => \App\Casts\UtcDateTime::class,
        'end_time' => \App\Casts\UtcDateTime::class,
        'total_price' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'amount_released' => 'decimal:2',
        'amount_refunded' => 'decimal:2',
        'funds_held_at' => 'datetime',
        'funds_released_at' => 'datetime',
        'funds_refunded_at' => 'datetime',
        'dispute_raised_at' => 'datetime',
        'dispute_resolved_at' => 'datetime',
        'session_started_at' => 'datetime',
        'session_ended_at' => 'datetime',
        'judgment_at' => 'datetime',
        'no_show_warning_sent_at' => 'datetime',
        'teacher_attended' => 'boolean',
        'student_attended' => 'boolean',
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

    public function child()
    {
        return $this->belongsTo(Student::class, 'student_id');
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

    public function materials()
    {
        return $this->hasMany(ClassroomMaterial::class);
    }

    public function remindersSent()
    {
        return $this->hasMany(BookingReminder::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the student's display name for notifications and emails.
     * Shows the child's name + Guardian if booked by a Guardian.
     */
    public function getStudentDisplayName(): string
    {
        // $this->student is actually the User who paid/booked
        if ($this->student_id && $this->child && $this->child->user) {
            return $this->child->user->name . ' (Booked by Guardian: ' . $this->student->name . ')';
        }

        return $this->student->name;
    }

    /**
     * Check if booking can be rated by the student
     */
    public function canBeRated(): bool
    {
        // Must be completed
        if ($this->status !== 'completed') {
            return false;
        }

        // Must not already have a review from this party (student)
        // Note: For finer control, reviewer_type should be checked against Auth user role
        if ($this->reviews()->where('reviewer_type', 'student')->exists()) {
            return false;
        }

        return true;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'awaiting_payment', 'awaiting_approval', 'confirmed', 'rescheduling']);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now())->where('status', 'confirmed');
    }

    public function scopeFundsHeld(Builder $query): Builder
    {
        return $query->where('payment_status', 'held');
    }

    public function scopeEligibleForRelease(Builder $query): Builder
    {
        return $query->where('payment_status', 'held')
            ->where('status', 'completed')
            ->whereNull('dispute_raised_at')
            ->where('end_time', '<=', now()->setTimezone('UTC')->subHours(2)); // 2h dispute window passed
    }

    public function scopeDisputed(Builder $query): Builder
    {
        return $query->where('payment_status', 'disputed');
    }

    // ===== ESCROW HELPER METHODS =====

    /**
     * Check if funds are currently held in escrow
     */
    public function fundsAreHeld(): bool
    {
        return $this->payment_status === 'held';
    }

    /**
     * Check if funds have been released to teacher
     */
    public function fundsAreReleased(): bool
    {
        return $this->payment_status === 'released';
    }

    /**
     * Check if booking is eligible for fund release
     */
    public function isEligibleForRelease(): bool
    {
        // Must have funds held
        if ($this->payment_status !== 'held') {
            return false;
        }

        // Must be completed
        if ($this->status !== 'completed') {
            return false;
        }

        // Must not have active dispute
        if ($this->dispute_raised_at && !$this->dispute_resolved_at) {
            return false;
        }

        if ($this->end_time->gt(now()->setTimezone('UTC')->subHours(2))) {
            return false;
        }

        return true;
    }

    /**
     * Check if booking can be disputed by student
     */
    public function canBeDisputed(): bool
    {
        // Can only dispute if funds are held or partially released
        if (!in_array($this->payment_status, ['held', 'partial'])) {
            return false;
        }

        // Can only dispute completed, confirmed (for no-shows), or awaiting_judgment sessions
        if (!in_array($this->status, ['completed', 'confirmed', 'awaiting_judgment'])) {
            return false;
        }

        if ($this->end_time->lt(now()->setTimezone('UTC')->subHours(2))) {
            return false;
        }

        // Can't dispute if already disputed
        if ($this->dispute_raised_at) {
            return false;
        }

        return true;
    }

    /**
     * Get the expected duration in minutes
     */
    public function getExpectedDurationMinutes(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Get completion percentage based on actual vs expected duration
     */
    public function getCompletionPercentage(): float
    {
        // Sum closed attendance records (those with duration_seconds)
        $closedSeconds = ClassroomAttendance::where('booking_id', $this->id)
            ->where('role', 'teacher')
            ->whereNotNull('left_at')
            ->sum('duration_seconds');

        // Add live time for any STILL-ACTIVE attendance records
        $activeRecords = ClassroomAttendance::where('booking_id', $this->id)
            ->where('role', 'teacher')
            ->whereNull('left_at')
            ->get();

        $activeSeconds = 0;
        foreach ($activeRecords as $record) {
            $activeSeconds += $record->joined_at->diffInSeconds(now());
        }

        $totalSeconds = $closedSeconds + $activeSeconds;
        $teacherMinutes = floor($totalSeconds / 60);

        // Fallback to basic actual_duration_minutes if no specific classroom records exist
        $durationToUse = $teacherMinutes > 0 ? $teacherMinutes : ($this->actual_duration_minutes ?? 0);

        if (!$durationToUse) {
            return 0;
        }

        $expected = $this->getExpectedDurationMinutes();
        if ($expected <= 0) {
            return 0;
        }

        return min(100, ($durationToUse / $expected) * 100);
    }

    /**
     * Calculate teacher earnings (after platform commission)
     */
    public function calculateTeacherEarnings(): float
    {
        $commissionRate = $this->commission_rate ?? 15;
        $commission = ($this->total_price * $commissionRate) / 100;
        return $this->total_price - $commission;
    }

    /**
     * Calculate platform commission
     */
    public function calculatePlatformCommission(): float
    {
        $commissionRate = $this->commission_rate ?? 15;
        return ($this->total_price * $commissionRate) / 100;
    }

    /**
     * Mark session as started
     */
    public function markSessionStarted(): void
    {
        if (!$this->session_started_at) {
            $this->update(['session_started_at' => now()]);
        }
    }

    /**
     * Mark session as ended and calculate duration
     */
    public function markSessionEnded(): void
    {
        $updates = ['session_ended_at' => now()];

        if ($this->session_started_at) {
            $updates['actual_duration_minutes'] = $this->session_started_at->diffInMinutes(now());
        }

        // Double check open attendance records and close them if they haven't been closed properly
        $openAttendances = ClassroomAttendance::where('booking_id', $this->id)
            ->whereNull('left_at')
            ->get();

        foreach ($openAttendances as $attendance) {
            $attendance->recordLeave();
        }

        $this->update($updates);
    }

    /**
     * Record teacher attendance
     */
    public function recordTeacherAttendance(): void
    {
        $this->update(['teacher_attended' => true]);
    }

    /**
     * Record student attendance
     */
    public function recordStudentAttendance(): void
    {
        $this->update(['student_attended' => true]);
    }

    /**
     * Raise a dispute
     */
    public function raiseDispute(string $reason): bool
    {
        if (!$this->canBeDisputed()) {
            return false;
        }

        $this->update([
            'payment_status' => 'disputed',
            'dispute_raised_at' => now(),
            'dispute_reason' => $reason,
        ]);

        return true;
    }

    /**
     * Resolve a dispute
     */
    public function resolveDispute(string $resolution, int $resolvedBy, string $paymentStatus = 'released'): void
    {
        $this->update([
            'payment_status' => $paymentStatus,
            'dispute_resolved_at' => now(),
            'dispute_resolution' => $resolution,
            'dispute_resolved_by' => $resolvedBy,
        ]);
    }

    // ===== CANCELLATION HELPER METHODS =====

    /**
     * Check if booking can be cancelled by the student/guardian
     */
    public function canBeCancelledByStudent(): bool
    {
        // Already cancelled or completed
        if (in_array($this->status, ['cancelled', 'completed'])) {
            return false;
        }

        // Disputed bookings can't be cancelled
        if ($this->status === 'disputed' || $this->payment_status === 'disputed') {
            return false;
        }

        // Session already started
        if ($this->session_started_at) {
            return false;
        }

        // Session time has passed
        if ($this->start_time->isPast()) {
            return false;
        }

        // Funds already released
        if ($this->payment_status === 'released') {
            return false;
        }

        return true;
    }

    /**
     * Check if a user is a participant of this booking.
     * Roles: Teacher, Booker (Guardian/Student), or Child Student.
     */
    public function isParticipant(User $user): bool
    {
        // 1. Teacher check
        if ($user->teacher && $user->teacher->id === $this->teacher_id) {
            return true;
        }

        // 2. Booker check (Guardian or Direct Student)
        if ($user->id === $this->user_id) {
            return true;
        }

        // 3. Child Student check
        if ($this->student_id && $user->student && $user->student->id === $this->student_id) {
            return true;
        }

        return $user->isAdmin();
    }

    /**
     * Get the role of a user for this specific booking.
     */
    public function getAttendeeRole(User $user): string
    {
        if ($user->teacher && $user->teacher->id === $this->teacher_id) {
            return 'teacher';
        }
        return 'student';
    }

    /**
     * Get hours until session starts
     */
    public function getHoursUntilSession(): float
    {
        return now()->diffInHours($this->start_time, false);
    }

    /**
     * Check if this is part of a recurring series
     */
    public function isRecurring(): bool
    {
        return $this->parent_booking_id !== null || $this->childBookings()->exists();
    }

    /**
     * Check if booking can be rescheduled by the student/guardian
     */
    public function canBeRescheduled(): bool
    {
        // Can't reschedule cancelled or completed bookings
        if (in_array($this->status, ['cancelled', 'completed'])) {
            return false;
        }

        // Can't reschedule disputed bookings
        if ($this->status === 'disputed' || $this->payment_status === 'disputed') {
            return false;
        }

        // Can't reschedule if session already started
        if ($this->session_started_at) {
            return false;
        }

        // Can't reschedule if session time has passed
        if ($this->start_time->isPast()) {
            return false;
        }

        // Can't reschedule if already in rescheduling status
        if ($this->status === 'rescheduling') {
            return false;
        }

        // Must reschedule at least 6 hours before session
        $hoursUntilSession = now()->diffInHours($this->start_time, false);
        if ($hoursUntilSession < 6) {
            return false;
        }

        return true;
    }

    /**
     * Get the pending reschedule request if any
     */
    public function getPendingRescheduleRequest()
    {
        return $this->rescheduleRequests()->where('status', 'pending')->first();
    }
}
