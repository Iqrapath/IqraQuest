<?php

namespace App\Observers;

use App\Models\Teacher;
use App\Notifications\NewTeacherApplicationNotification;
use App\Models\User;

class TeacherObserver
{
    /**
     * Handle the Teacher "created" event.
     */
    public function created(Teacher $teacher): void
    {
        // Don't send notifications on creation - only when application is submitted
        // Notifications will be sent when submitApplication() is called
    }

    /**
     * Handle the Teacher "updated" event.
     */
    public function updated(Teacher $teacher): void
    {
        // Log status changes if needed
        if ($teacher->isDirty('status')) {
            \Log::info('Teacher status changed', [
                'teacher_id' => $teacher->id,
                'old_status' => $teacher->getOriginal('status'),
                'new_status' => $teacher->status,
            ]);
        }
    }

    /**
     * Handle the Teacher "deleted" event.
     */
    public function deleted(Teacher $teacher): void
    {
        // Clean up related data
        $teacher->certificates()->delete();
        $teacher->availability()->delete();
        $teacher->paymentMethod()->delete();
    }
}
