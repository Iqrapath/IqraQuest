<?php

namespace App\Observers;

use App\Models\TeacherCertificate;
use Illuminate\Support\Facades\Storage;

class TeacherCertificateObserver
{
    /**
     * Handle the TeacherCertificate "created" event.
     */
    public function created(TeacherCertificate $certificate): void
    {
        \Log::info('Certificate uploaded', [
            'teacher_id' => $certificate->teacher_id,
            'certificate_id' => $certificate->id,
            'type' => $certificate->certificate_type,
        ]);
    }

    /**
     * Handle the TeacherCertificate "deleted" event.
     */
    public function deleted(TeacherCertificate $certificate): void
    {
        // Delete the file from storage
        if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
            Storage::disk('public')->delete($certificate->file_path);
        }
        
        \Log::info('Certificate deleted', [
            'teacher_id' => $certificate->teacher_id,
            'certificate_id' => $certificate->id,
        ]);
    }
}
