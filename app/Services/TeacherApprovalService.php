<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use App\Notifications\NewTeacherApplicationNotification;
use App\Notifications\TeacherApprovedNotification;
use App\Notifications\TeacherRejectedNotification;
use App\Notifications\TeacherSuspendedNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeacherApprovalService
{
    /**
     * Get verification checklist status for a teacher
     */
    public function getVerificationChecklist(Teacher $teacher): array
    {
        $certificates = $teacher->certificates;
        
        $idFront = $certificates->firstWhere('certificate_type', 'id_card_front');
        $idBack = $certificates->firstWhere('certificate_type', 'id_card_back');
        $cv = $certificates->firstWhere('certificate_type', 'cv');
        $otherCerts = $certificates->filter(fn($c) => !in_array($c->certificate_type, ['id_card_front', 'id_card_back', 'cv']));

        return [
            'id_front' => [
                'label' => 'ID Card (Front)',
                'uploaded' => $idFront !== null,
                'verified' => $idFront?->verification_status === 'verified',
                'status' => $idFront?->verification_status ?? 'not_uploaded',
            ],
            'id_back' => [
                'label' => 'ID Card (Back)',
                'uploaded' => $idBack !== null,
                'verified' => $idBack?->verification_status === 'verified',
                'status' => $idBack?->verification_status ?? 'not_uploaded',
            ],
            'cv' => [
                'label' => 'CV/Resume',
                'uploaded' => $cv !== null,
                'verified' => $cv?->verification_status === 'verified',
                'status' => $cv?->verification_status ?? 'not_uploaded',
            ],
            'video_verification' => [
                'label' => 'Video Verification',
                'completed' => $teacher->video_verification_status === 'completed',
                'status' => $teacher->video_verification_status ?? 'not_scheduled',
            ],
            'certificates' => [
                'label' => 'Certificates',
                'total' => $otherCerts->count(),
                'verified' => $otherCerts->where('verification_status', 'verified')->count(),
            ],
        ];
    }

    /**
     * Check if all required verifications are complete
     */
    public function hasIncompleteVerifications(Teacher $teacher): bool
    {
        $checklist = $this->getVerificationChecklist($teacher);
        
        return !$checklist['id_front']['verified'] 
            || !$checklist['id_back']['verified'] 
            || !$checklist['cv']['verified']
            || !$checklist['video_verification']['completed'];
    }

    /**
     * Get list of incomplete verification items
     */
    public function getIncompleteItems(Teacher $teacher): array
    {
        $checklist = $this->getVerificationChecklist($teacher);
        $incomplete = [];

        if (!$checklist['id_front']['verified']) {
            $incomplete[] = $checklist['id_front']['uploaded'] 
                ? 'ID Card (Front) not verified' 
                : 'ID Card (Front) not uploaded';
        }
        if (!$checklist['id_back']['verified']) {
            $incomplete[] = $checklist['id_back']['uploaded'] 
                ? 'ID Card (Back) not verified' 
                : 'ID Card (Back) not uploaded';
        }
        if (!$checklist['cv']['verified']) {
            $incomplete[] = $checklist['cv']['uploaded'] 
                ? 'CV/Resume not verified' 
                : 'CV/Resume not uploaded';
        }
        if (!$checklist['video_verification']['completed']) {
            $incomplete[] = 'Video verification not completed (Status: ' . $checklist['video_verification']['status'] . ')';
        }

        return $incomplete;
    }

    /**
     * Approve a teacher application
     */
    public function approve(Teacher $teacher, User $admin, ?string $overrideReason = null): void
    {
        $hasIncomplete = $this->hasIncompleteVerifications($teacher);
        
        // Log the approval with details
        if ($hasIncomplete && $overrideReason) {
            $incompleteItems = $this->getIncompleteItems($teacher);
            Log::channel('daily')->info('Teacher approved with incomplete verifications (Admin Override)', [
                'teacher_id' => $teacher->id,
                'teacher_name' => $teacher->user->name,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'override_reason' => $overrideReason,
                'incomplete_items' => $incompleteItems,
                'timestamp' => now()->toIso8601String(),
            ]);
        } else {
            Log::channel('daily')->info('Teacher approved with all verifications complete', [
                'teacher_id' => $teacher->id,
                'teacher_name' => $teacher->user->name,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'timestamp' => now()->toIso8601String(),
            ]);
        }

        DB::transaction(function () use ($teacher, $admin, $overrideReason, $hasIncomplete) {
            $teacher->update([
                'status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'rejected_by' => null,
                'rejected_at' => null,
                'rejection_reason' => null,
                'approval_override_reason' => $hasIncomplete ? $overrideReason : null,
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
     * Suspend a teacher account
     */
    public function suspend(Teacher $teacher, User $admin, string $reason): void
    {
        DB::transaction(function () use ($teacher, $admin, $reason) {
            $teacher->update([
                'status' => 'suspended',
                'suspension_reason' => $reason,
                'suspended_at' => now(),
            ]);

            // Notify the teacher
            $teacher->user->notify(new TeacherSuspendedNotification($teacher, $reason));

            Log::channel('daily')->info('Teacher suspended', [
                'teacher_id' => $teacher->id,
                'admin_id' => $admin->id,
                'reason' => $reason,
            ]);
        });
    }

    /**
     * Unsuspend (activate) a teacher account
     */
    public function unsuspend(Teacher $teacher, User $admin): void
    {
        $this->approve($teacher, $admin);

        Log::channel('daily')->info('Teacher unsuspended (activated)', [
            'teacher_id' => $teacher->id,
            'admin_id' => $admin->id,
        ]);
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

