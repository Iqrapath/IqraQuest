<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WaitingAreaController extends Controller
{
    /**
     * Show the waiting area for pending/rejected teachers
     */
    public function index(): Response
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        Log::info('Teacher Waiting Area: Rendering page', [
            'user_id' => $user->id,
            'teacher_id' => $teacher?->id,
            'teacher_status' => $teacher?->status,
            'onboarding_step' => $teacher?->onboarding_step,
            'is_pending' => $teacher?->isPending(),
            'is_rejected' => $teacher?->isRejected(),
            'referrer' => request()->headers->get('referer'),
        ]);

        return Inertia::render('Teacher/WaitingArea', [
            'teacher' => $teacher->load(['approver', 'rejecter']),
            'status' => $teacher->status,
            'isPending' => $teacher->isPending(),
            'isRejected' => $teacher->isRejected(),
            'rejectionReason' => $teacher->rejection_reason,
            'rejectedAt' => $teacher->rejected_at,
        ]);
    }
}
