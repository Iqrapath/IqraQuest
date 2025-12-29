<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\TeacherCertificate;
use App\Services\TeacherApprovalService;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VerificationRequestController extends Controller
{
    protected TeacherApprovalService $approvalService;
    protected CertificateService $certificateService;
    protected \App\Services\WalletService $walletService;

    public function __construct(
        TeacherApprovalService $approvalService, 
        CertificateService $certificateService,
        \App\Services\WalletService $walletService
    ) {
        $this->approvalService = $approvalService;
        $this->certificateService = $certificateService;
        $this->walletService = $walletService;
    }

    /**
     * Display a listing of verification requests
     */
    public function index(Request $request): Response
    {
        $query = Teacher::with(['user', 'subjects', 'certificates'])
            ->whereIn('status', ['pending', 'under_review', 'rejected'])
            ->latest('application_submitted_at');

        // Simple search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by verification status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('video_verification_status', $request->status);
        }

        return Inertia::render('Admin/Verifications/Index', [
            'requests' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show detailed verification profile
     */
    public function show(Teacher $teacher): Response
    {
        $teacher->load(['user', 'subjects', 'certificates', 'availability', 'paymentMethods']);

        $wallet = $this->walletService->getOrCreateWallet($teacher->user_id);
        
        $totalEarned = \App\Models\Transaction::where('user_id', $teacher->user_id)
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');
            
        $pendingPayouts = \App\Models\Transaction::where('user_id', $teacher->user_id)
            ->where('type', 'debit') // or specific transactionable_type if payouts have one
            ->where('status', 'pending')
            ->sum('amount');

        $sessionsCount = \App\Models\Booking::where('teacher_id', $teacher->id)
            ->where('status', 'completed')
            ->count();

        return Inertia::render('Admin/Verifications/Show', [
            'teacher' => $teacher,
            'stats' => [
                'has_required_docs' => $teacher->has_required_docs_verified,
                'verified_docs_count' => $teacher->certificates()->where('verification_status', 'verified')->count(),
                'total_docs_count' => $teacher->certificates()->count(),
                'sessions_count' => $sessionsCount,
                'reviews_count' => $teacher->reviews()->where('is_approved', true)->count(),
                'average_rating' => (float) $teacher->average_rating,
            ],
            'earnings' => [
                'wallet_balance' => (float) $wallet->balance,
                'total_earned' => (float) $totalEarned,
                'pending_payouts' => (float) $pendingPayouts,
            ]
        ]);
    }

    /**
     * Schedule a video verification call
     */
    public function scheduleCall(Request $request, Teacher $teacher)
    {
        // Allow rescheduling if explicitly requested, otherwise prevent duplicate scheduling
        $isReschedule = $request->boolean('reschedule', false);
        if ($teacher->video_verification_status === 'scheduled' && !$isReschedule) {
            return redirect()->back()->with('error', 'A verification call is already scheduled for this teacher. Use the reschedule option to change the time.');
        }

        $validated = $request->validate([
            'scheduled_at' => 'required|date|after:now',
            'notes' => 'nullable|string|max:500',
        ]);

        $teacher->update([
            'video_verification_status' => 'scheduled',
            'video_verification_scheduled_at' => $validated['scheduled_at'],
            'video_verification_room_id' => Str::uuid(),
            'video_verification_notes' => $validated['notes'] ?? null,
            'status' => 'under_review',
        ]);

        // Send notification to teacher
        $teacher->user->notify(new \App\Notifications\VerificationCallScheduledNotification(
            $teacher, 
            $validated['scheduled_at'], 
            $validated['notes'] ?? null
        ));
        
        return redirect()->back()->with('success', 'Verification call scheduled successfully.');
    }

    /**
     * Verify or reject a specific document
     */
    public function verifyDocument(Request $request, Teacher $teacher, TeacherCertificate $certificate)
    {
        $request->validate([
            'status' => 'required|in:verified,rejected',
            'reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        if ($request->status === 'verified') {
            $this->certificateService->verify($certificate, $request->user());
            $teacher->user->notify(new \App\Notifications\DocumentVerifiedNotification($certificate));
        } else {
            $this->certificateService->reject($certificate, $request->user(), $request->reason);
            $teacher->user->notify(new \App\Notifications\DocumentRejectedNotification($certificate, $request->reason));
        }

        return redirect()->back()->with('success', 'Document status updated.');
    }

    /**
     * Upload a document for a teacher (ID, CV, or Certificate)
     */
    public function uploadDocument(Request $request, Teacher $teacher, \App\Services\CertificateService $certificateService)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
            'type' => 'required|in:id_card_front,id_card_back,cv,certificate',
            'title' => 'nullable|required_if:type,certificate|string|max:255',
        ]);

        $file = $request->file('file');
        $type = $request->type;
        
        // Determine title based on type if not provided
        $title = $request->title;
        if (!$title) {
            $title = match($type) {
                'id_card_front' => 'ID Card (Front)',
                'id_card_back' => 'ID Card (Back)',
                'cv' => 'CV/Resume',
                default => 'Document'
            };
        }

        // Check if document of this type already exists (for ID and CV) and delete it
        if (in_array($type, ['id_card_front', 'id_card_back', 'cv'])) {
            $existing = $teacher->certificates()->where('certificate_type', $type)->first();
            if ($existing) {
                $certificateService->delete($existing);
            }
        }

        $certificateService->upload($teacher, $file, [
            'certificate_type' => $type,
            'title' => $title,
            'description' => $request->description,
            'issue_date' => $request->issue_date,
            'expiry_date' => $request->expiry_date,
            'issuing_organization' => $request->issuing_organization,
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    /**
     * Final approval of teacher
     */
    public function approve(Request $request, Teacher $teacher)
    {
        $this->approvalService->approve($teacher, $request->user());

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher approved successfully.');
    }

    /**
     * Final rejection of teacher application
     */
    public function reject(Request $request, Teacher $teacher)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->approvalService->reject($teacher, $request->user(), $request->reason);

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher application rejected.');
    }

    /**
     * Send a message to a teacher regarding their verification
     */
    public function sendMessage(Request $request, Teacher $teacher)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $admin = $request->user();
        $teacherUser = $teacher->user;

        // Create or find existing admin conversation
        $conversation = \App\Models\Conversation::findOrCreateBetween(
            $admin,
            $teacherUser,
            null, // No booking
            true  // is_admin_conversation
        );

        // Create the message
        $message = \App\Models\Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $admin->id,
            'content' => $request->message,
            'type' => 'text',
        ]);

        // Update conversation's last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Generate reply URL for teacher (points to waiting area with messages)
        $replyUrl = config('app.url') . '/teacher/waiting-area';

        // Send notification to teacher (email + database)
        $teacherUser->notify(new \App\Notifications\VerificationMessageNotification(
            $admin->name,
            $request->message,
            $replyUrl
        ));

        return redirect()->back()->with('success', 'Message sent to teacher successfully.');
    }

    /**
     * Delete the teacher application and user account
     */
    public function destroy(Teacher $teacher)
    {
        $user = $teacher->user;
        
        // Delete all related data (handled by database cascading usually, but good to be explicit for some)
        // For clean deletion we'll delete the user which should cascade to teacher profile
        
        // If soft deletes are used, this will soft delete
        $user->delete();

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher account deleted successfully.');
    }
}
