<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use App\Notifications\NewTeacherApplicationNotification;
use App\Notifications\TeacherApprovedNotification;
use App\Notifications\TeacherRejectedNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TeacherApprovalService
{
    /**
     * Approve a teacher application
     */
    public function approve(Teacher $teacher, User $admin): void
    {
        DB::transaction(function () use ($teacher, $admin) {
            $teacher->update([
                'status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'rejected_by' => null,
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            // Send approval notification to teacher
            $teacher->user->notify(new TeacherApprovedNotification($teacher));
        });
    }

    /**
     * Reject a teacher application
     */
    public function reject(Teacher $teacher, User $admin, string $reason): void
    {
        DB::transaction(function () use ($teacher, $admin, $reason) {
            $teacher->update([
                'status' => 'rejected',
                'rejected_by' => $admin->id,
                'rejected_at' => now(),
                'rejection_reason' => $reason,
                'approved_by' => null,
                'approved_at' => null,
            ]);

            // Send rejection notification to teacher
            $teacher->user->notify(new TeacherRejectedNotification($teacher, $reason));
        });
    }

    /**
     * Get all pending teacher applications
     */
    public function getPendingTeachers(): Collection
    {
        return Teacher::with(['user', 'subjects', 'certificates', 'availability', 'paymentMethod'])
            ->where('status', 'pending')
            ->whereNotNull('submitted_at')
            ->orderBy('submitted_at', 'asc')
            ->get();
    }

    /**
     * Get detailed application information for a teacher
     */
    public function getTeacherApplicationDetails(Teacher $teacher): array
    {
        return [
            'teacher' => $teacher->load([
                'user',
                'subjects',
                'certificates',
                'availability',
                'paymentMethod',
                'approvedBy',
                'rejectedBy',
            ]),
            'stats' => [
                'total_subjects' => $teacher->subjects()->count(),
                'total_certificates' => $teacher->certificates()->count(),
                'availability_days' => $teacher->availability()->count(),
                'application_age_days' => $teacher->submitted_at?->diffInDays(now()),
            ],
        ];
    }

    /**
     * Notify admins about new teacher application
     */
    public function notifyAdminsOfNewApplication(Teacher $teacher): void
    {
        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new NewTeacherApplicationNotification($teacher, $teacher->user));
        }
    }
}

