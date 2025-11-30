<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\CertificateUploadRequest;
use App\Models\TeacherCertificate;
use App\Services\CertificateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateService $certificateService
    ) {}

    /**
     * Upload a new certificate
     */
    public function store(CertificateUploadRequest $request): JsonResponse
    {
        $teacher = auth()->user()->teacher;
        
        $certificate = $this->certificateService->upload(
            $teacher,
            $request->file('file'),
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'certificate' => $certificate,
            'message' => 'Certificate uploaded successfully!',
        ]);
    }

    /**
     * Delete a certificate
     */
    public function destroy(TeacherCertificate $certificate): RedirectResponse
    {
        // Ensure the certificate belongs to the authenticated teacher
        if ($certificate->teacher_id !== auth()->user()->teacher->id) {
            abort(403, 'Unauthorized action.');
        }

        $this->certificateService->delete($certificate);

        return redirect()
            ->back()
            ->with('success', 'Certificate deleted successfully!');
    }
}
