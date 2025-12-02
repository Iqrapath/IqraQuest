<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectTeacherRequest;
use App\Models\Teacher;
use App\Services\TeacherApprovalService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeacherApprovalController extends Controller
{
    public function __construct(
        private TeacherApprovalService $approvalService
    ) {}

    /**
     * Show list of pending teacher applications
     */
    public function index(): Response
    {
        $pendingTeachers = Teacher::with(['user', 'subjects', 'certificates'])
            ->pending()
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Teachers/Pending', [
            'teachers' => $pendingTeachers,
        ]);
    }

    /**
     * Show detailed view of a teacher application
     */
    public function show(Teacher $teacher): Response
    {
        $teacher->load([
            'user',
            'subjects',
            'certificates',
            'availability',
            'paymentMethod',
        ]);

        return Inertia::render('Admin/Teachers/Show', [
            'teacher' => $teacher,
        ]);
    }

    /**
     * Approve a teacher application
     */
    public function approve(Teacher $teacher): RedirectResponse
    {
        $this->approvalService->approve($teacher, auth()->user());

        return redirect()
            ->back()
            ->with('success', "Teacher {$teacher->user->name} has been approved!");
    }

    /**
     * Reject a teacher application
     */
    public function reject(RejectTeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $this->approvalService->reject(
            $teacher,
            auth()->user(),
            $request->validated('rejection_reason')
        );

        return redirect()
            ->back()
            ->with('success', "Teacher {$teacher->user->name} has been rejected.");
    }

    /**
     * Show history of all teacher applications
     */
    public function history(): Response
    {
        $teachers = Teacher::with(['user', 'approvedBy', 'rejectedBy'])
            ->whereNotNull('approved_at')
            ->orWhereNotNull('rejected_at')
            ->latest('updated_at')
            ->paginate(20);

        return Inertia::render('Admin/Teachers/History', [
            'teachers' => $teachers,
        ]);
    }
}
