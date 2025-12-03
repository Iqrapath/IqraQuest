<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    /**
     * Display a listing of all teachers
     */
    public function index(Request $request): Response
    {
        $query = Teacher::with(['user', 'subjects']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by rating
        if ($request->has('rating') && $request->rating !== 'all') {
            $minRating = (int) $request->rating;
            $query->withAvg(['reviews' => function($q) {
                $q->where('is_approved', true);
            }], 'rating')
            ->having('reviews_avg_rating', '>=', $minRating);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by country
        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        // Filter by subject
        if ($request->has('subject') && $request->subject !== 'all') {
            $query->whereHas('subjects', function ($q) use ($request) {
                $q->where('subjects.id', $request->subject);
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        if ($sortBy === 'name') {
            $query->join('users', 'teachers.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortDirection)
                  ->select('teachers.*');
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $teachers = $query->paginate(10)->withQueryString();

        // Add placeholder data for Figma design matching (Classes Held)
        // Rating is now calculated dynamically from the Review model
        $teachers->getCollection()->transform(function ($teacher) {
            $teacher->rating = $teacher->average_rating; // Use the accessor
            $teacher->classes_held = rand(10, 200); // Random classes held (placeholder until Booking model exists)
            return $teacher;
        });

        // Get stats for tabs
        $stats = [
            'all' => Teacher::count(),
            'active' => Teacher::where('status', 'approved')->count(),
            'pending' => Teacher::where('status', 'pending')->count(),
            'suspended' => Teacher::where('status', 'suspended')->count(),
            'rejected' => Teacher::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Teachers/Index', [
            'teachers' => $teachers,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'country', 'subject', 'rating', 'sort_by', 'sort_direction']),
            'filter_options' => [
                'subjects' => Subject::active()->ordered()->get(['id', 'name']),
                'statuses' => [
                    ['value' => 'pending', 'label' => 'Pending'],
                    ['value' => 'approved', 'label' => 'Approved'],
                    ['value' => 'active', 'label' => 'Active'],
                    ['value' => 'suspended', 'label' => 'Suspended'],
                    ['value' => 'rejected', 'label' => 'Rejected'],
                ],
                'ratings' => [
                    ['value' => '5', 'label' => '5 Stars'],
                    ['value' => '4', 'label' => '4+ Stars'],
                    ['value' => '3', 'label' => '3+ Stars'],
                ]
            ],
            'pageTitle' => 'Teacher Management',
        ]);
    }
    public function show(Teacher $teacher): Response
    {
        $teacher->load([
            'user',
            'subjects',
            'certificates',
            'availability',
            'paymentMethods',
            'approver',
            'rejecter',
        ]);

        // Get teacher stats
        $stats = [
            'total_subjects' => $teacher->subjects()->count(),
            'total_certificates' => $teacher->certificates()->count(),
            'verified_certificates' => $teacher->verifiedCertificates()->count(),
            'availability_days' => $teacher->availableDays()->count(),
            'total_sessions_taught' => 350, // Placeholder (Booking model not implemented)
            'average_rating' => round($teacher->average_rating, 1), // Real data from Review model
            'upcoming_sessions' => [ // Placeholder data (Booking model not implemented)
                ['id' => 1, 'date' => 'Apr 15', 'time' => '10:00AM', 'student_name' => 'Amina Musa', 'subject' => "Juz' Amma"],
                ['id' => 2, 'date' => 'Apr 15', 'time' => '11:30AM', 'student_name' => 'Sulaiman Bello', 'subject' => 'Hifz'],
            ],
        ];

        return Inertia::render('Admin/Teachers/Show', [
            'teacher' => $teacher,
            'stats' => $stats,
            'availableSubjects' => Subject::active()->ordered()->get(['id', 'name']),
            'pageTitle' => 'Teacher Management',
        ]);
    }

    /**
     * Update teacher contact information
     */
    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $teacher->user_id,
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'bio' => 'nullable|string|min:20|max:1000',
        ]);

        // Update user information (only if provided)
        $userUpdates = [];
        if (isset($validated['name'])) $userUpdates['name'] = $validated['name'];
        if (isset($validated['email'])) $userUpdates['email'] = $validated['email'];
        if (isset($validated['phone'])) $userUpdates['phone'] = $validated['phone'];
        
        if (!empty($userUpdates)) {
            $teacher->user->update($userUpdates);
        }

        // Update teacher information (only if provided)
        $teacherUpdates = [];
        if (isset($validated['city'])) $teacherUpdates['city'] = $validated['city'];
        if (isset($validated['bio'])) $teacherUpdates['bio'] = $validated['bio'];
        
        if (!empty($teacherUpdates)) {
            $teacher->update($teacherUpdates);
        }

        return redirect()->back()->with('success', 'Teacher information updated successfully.');
    }

    /**
     * Update teacher subjects
     */
    public function updateSubjects(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        // Sync subjects (adds new ones, removes unselected ones)
        $teacher->subjects()->sync($validated['subject_ids']);

        return redirect()->back()->with('success', 'Subject specializations updated successfully.');
    }

    /**
     * Update teacher subjects and related details (comprehensive)
     */
    public function updateSubjectsDetails(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
            'teaching_mode' => 'required|string|in:full-time,part-time',
            'teaching_type' => 'required|string|in:online,in-person,both',
            'years_of_experience' => 'required|integer|min:0|max:50',
            'qualification' => 'nullable|string|max:100',
            'availability' => 'nullable|array',
            'availability.*.day' => 'required|string',
            'availability.*.start' => 'required|string',
            'availability.*.end' => 'required|string',
        ]);

        // Sync subjects
        $teacher->subjects()->sync($validated['subject_ids']);

        // Update teacher details
        $teacher->update([
            'teaching_mode' => $validated['teaching_mode'],
            'teaching_type' => $validated['teaching_type'],
            'experience_years' => $validated['years_of_experience'],
            'qualification_level' => $validated['qualification'] ?? $teacher->qualification_level,
        ]);

        // Update availability if provided
        if (isset($validated['availability'])) {
            // Delete existing availability
            $teacher->availability()->delete();
            
            // Create new availability slots
            foreach ($validated['availability'] as $slot) {
                $teacher->availability()->create([
                    'day_of_week' => $slot['day'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'is_available' => true,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Subjects & experience updated successfully.');
    }

    /**
     * Update teacher status (suspend/activate)
     */
    public function updateStatus(Request $request, Teacher $teacher)
    {
        $request->validate([
            'status' => 'required|in:approved,suspended,rejected',
            'reason' => 'required_if:status,suspended,rejected|string|max:500',
        ]);

        $teacher->update([
            'status' => $request->status,
            'suspension_reason' => in_array($request->status, ['suspended', 'rejected']) ? $request->reason : null,
            'suspended_at' => $request->status === 'suspended' ? now() : null,
            'rejected_at' => $request->status === 'rejected' ? now() : null,
            'approved_at' => $request->status === 'approved' ? now() : null,
        ]);

        $message = match($request->status) {
            'suspended' => "Teacher {$teacher->user->name} has been suspended.",
            'rejected' => "Teacher {$teacher->user->name} has been rejected.",
            'approved' => "Teacher {$teacher->user->name} has been approved.",
            default => "Teacher status updated."
        };

        return redirect()->back()->with('success', $message);
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
     * Verify a specific document
     */
    public function verifyDocument(Request $request, Teacher $teacher, $certificateId, \App\Services\CertificateService $certificateService)
    {
        $certificate = $teacher->certificates()->findOrFail($certificateId);
        
        $certificateService->verify($certificate, $request->user());

        return redirect()->back()->with('success', 'Document verified successfully.');
    }
}
