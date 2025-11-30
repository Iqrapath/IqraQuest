<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class WaitingAreaController extends Controller
{
    /**
     * Show the waiting area for pending/rejected teachers
     */
    public function index(): Response
    {
        $teacher = auth()->user()->teacher;

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
