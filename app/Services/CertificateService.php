<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\TeacherCertificate;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CertificateService
{
    /**
     * Upload a new certificate for a teacher
     */
    public function upload(Teacher $teacher, UploadedFile $file, array $data): TeacherCertificate
    {
        // Store the file
        $path = $file->store('certificates', 'public');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();

        // Create certificate record
        $certificate = $teacher->certificates()->create([
            'certificate_type' => $data['certificate_type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'issue_date' => $data['issue_date'] ?? null,
            'expiry_date' => $data['expiry_date'] ?? null,
            'issuing_organization' => $data['issuing_organization'] ?? null,
            'verification_status' => 'pending',
        ]);

        return $certificate;
    }

    /**
     * Verify a certificate
     */
    public function verify(TeacherCertificate $certificate, User $admin): void
    {
        $certificate->update([
            'verification_status' => 'verified',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);
    }

    /**
     * Reject a certificate
     */
    public function reject(TeacherCertificate $certificate, User $admin, string $reason): void
    {
        $certificate->update([
            'verification_status' => 'rejected',
            'verified_by' => $admin->id,
            'verified_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Delete a certificate and its file
     */
    public function delete(TeacherCertificate $certificate): void
    {
        // Delete file from storage
        if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
            Storage::disk('public')->delete($certificate->file_path);
        }

        // Delete database record
        $certificate->delete();
    }
}
