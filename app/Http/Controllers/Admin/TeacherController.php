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

    /**
     * Show the form for creating a new teacher
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Teachers/Create', [
            'subjects' => Subject::active()->ordered()->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created teacher in storage
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
            'experience_years' => 'nullable|integer|min:0',
            'qualification_level' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'teaching_mode' => 'required|in:full-time,part-time',
            'teaching_type' => 'nullable|string|in:online,in-person,both',
            'availability' => 'nullable|array',
            'preferred_currency' => 'nullable|string|in:NGN,USD',
            'hourly_rate' => 'nullable|numeric|min:0',
            'payment_type' => 'nullable|string|in:bank_transfer,paystack,paypal,stripe',
            'bank_name' => 'nullable|string|max:255',
            'bank_code' => 'nullable|string|max:50',
            'account_number' => 'nullable|string|max:50',
            'account_name' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:50',
            'paypal_email' => 'nullable|email|max:255',
            'stripe_account_id' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        \DB::transaction(function () use ($validated, &$teacher) {
            // Create user account
            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => \Hash::make($validated['password']),
                'role' => 'teacher',
            ]);

            // Create teacher profile
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'country' => $validated['country'] ?? null,
                'city' => $validated['city'] ?? null,
                'experience_years' => $validated['experience_years'] ?? 0,
                'qualification_level' => $validated['qualification_level'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'status' => 'pending',
                'teaching_mode' => $validated['teaching_mode'],
                'teaching_type' => $validated['teaching_type'] ?? null,
                'preferred_currency' => $validated['preferred_currency'] ?? 'USD',
                'hourly_rate' => $validated['hourly_rate'] ?? null,
            ]);

            // Attach subjects
            $teacher->subjects()->attach($validated['subject_ids']);

            // Save availability if provided
            if (!empty($validated['availability'])) {
                foreach ($validated['availability'] as $slot) {
                    $teacher->availability()->create([
                        'day_of_week' => $slot['day'],
                        'start_time' => $slot['start'],
                        'end_time' => $slot['end'],
                        'is_available' => true,
                    ]);
                }
            }

            // Save payment method if provided
            if (!empty($validated['payment_type'])) {
                $paymentData = [
                    'payment_type' => $validated['payment_type'],
                    'is_primary' => true,
                    'bank_name' => $validated['bank_name'] ?? null,
                    'bank_code' => $validated['bank_code'] ?? null,
                    'account_number' => $validated['account_number'] ?? null,
                    'account_name' => $validated['account_name'] ?? null,
                    'routing_number' => $validated['routing_number'] ?? null,
                    'email' => $validated['paypal_email'] ?? null,
                    'account_id' => $validated['stripe_account_id'] ?? null,
                ];

                $teacher->paymentMethods()->create($paymentData);
            }
        });

        return redirect()->route('admin.teachers.show', $teacher->id)
            ->with('success', 'Teacher created successfully');
    }

    /**
     * Show teacher analytics/performance page
     */
    public function analytics(Teacher $teacher): Response
    {
        $teacher->load(['user', 'subjects']);

        // Mock overview statistics (replace with real data when Booking/Session models are ready)
        $overview = [
            'total_sessions' => 342,
            'total_students' => 87,
            'average_rating' => round($teacher->average_rating, 1),
            'total_revenue' => 856000,
            'active_students' => 24,
            'completion_rate' => 94,
        ];

        // Mock chart data
        $charts = [
            'sessions_timeline' => [
                ['month' => 'Jan', 'sessions' => 28],
                ['month' => 'Feb', 'sessions' => 35],
                ['month' => 'Mar', 'sessions' => 42],
                ['month' => 'Apr', 'sessions' => 38],
                ['month' => 'May', 'sessions' => 45],
                ['month' => 'Jun', 'sessions' => 52],
            ],
            'subject_distribution' => [
                ['name' => "Juz' Amma", 'value' => 120],
                ['name' => 'Hifz', 'value' => 95],
                ['name' => 'Tajweed', 'value' => 67],
                ['name' => 'Arabic', 'value' => 42],
                ['name' => 'Tafsir', 'value' => 18],
            ],
            'peak_hours' => [
                ['hour' => '8AM', 'sessions' => 15],
                ['hour' => '10AM', 'sessions' => 32],
                ['hour' => '12PM', 'sessions' => 28],
                ['hour' => '2PM', 'sessions' => 45],
                ['hour' => '4PM', 'sessions' => 52],
                ['hour' => '6PM', 'sessions' => 38],
                ['hour' => '8PM', 'sessions' => 22],
            ],
            'rating_timeline' => [
                ['month' => 'Jan', 'rating' => 4.2],
                ['month' => 'Feb', 'rating' => 4.4],
                ['month' => 'Mar', 'rating' => 4.3],
                ['month' => 'Apr', 'rating' => 4.6],
                ['month' => 'May', 'rating' => 4.7],
                ['month' => 'Jun', 'rating' => 4.8],
            ],
        ];

        // Mock recent sessions
        $recent_sessions = [
            ['id' => 1, 'date' => 'Dec 1, 2024', 'time' => '2:00 PM', 'student_name' => 'Amina Musa', 'subject' => "Juz' Amma", 'duration' => '60 min', 'rating' => 5, 'status' => 'completed'],
            ['id' => 2, 'date' => 'Nov 30, 2024', 'time' => '4:00 PM', 'student_name' => 'Sulaiman Bello', 'subject' => 'Hifz', 'duration' => '45 min', 'rating' => 5, 'status' => 'completed'],
            ['id' => 3, 'date' => 'Nov 29, 2024', 'time' => '10:00 AM', 'student_name' => 'Fatima Ahmed', 'subject' => 'Tajweed', 'duration' => '60 min', 'rating' => 4, 'status' => 'completed'],
            ['id' => 4, 'date' => 'Nov 28, 2024', 'time' => '3:30 PM', 'student_name' => 'Ibrahim Yusuf', 'subject' => 'Arabic', 'duration' => '50 min', 'rating' => 5, 'status' => 'completed'],
            ['id' => 5, 'date' => 'Nov 27, 2024', 'time' => '11:00 AM', 'student_name' => 'Zainab Hassan', 'subject' => "Juz' Amma", 'duration' => '60 min', 'rating' => 4, 'status' => 'completed'],
            ['id' => 6, 'date' => 'Dec 5, 2024', 'time' => '2:00 PM', 'student_name' => 'Omar Abdullahi', 'subject' => 'Hifz', 'duration' => '60 min', 'rating' => 0, 'status' => 'upcoming'],
            ['id' => 7, 'date' => 'Dec 6, 2024', 'time' => '10:00 AM', 'student_name' => 'Aisha Mohammed', 'subject' => 'Tajweed', 'duration' => '45 min', 'rating' => 0, 'status' => 'upcoming'],
        ];

        // Mock top students
        $top_students = [
            ['id' => 1, 'name' => 'Amina Musa', 'sessions_count' => 45, 'total_hours' => 52],
            ['id' => 2, 'name' => 'Sulaiman Bello', 'sessions_count' => 38, 'total_hours' => 43],
            ['id' => 3, 'name' => 'Fatima Ahmed', 'sessions_count' => 32, 'total_hours' => 38],
            ['id' => 4, 'name' => 'Ibrahim Yusuf', 'sessions_count' => 28, 'total_hours' => 31],
            ['id' => 5, 'name' => 'Zainab Hassan', 'sessions_count' => 24, 'total_hours' => 27],
        ];

        return Inertia::render('Admin/Teachers/Analytics', [
            'teacher' => $teacher,
            'overview' => $overview,
            'charts' => $charts,
            'recent_sessions' => $recent_sessions,
            'top_students' => $top_students,
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
     * Show the form for editing the teacher
     */
    public function edit(Teacher $teacher): Response
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

        return Inertia::render('Admin/Teachers/Edit', [
            'teacher' => $teacher,
            'stats' => $stats,
            'availableSubjects' => Subject::active()->ordered()->get(['id', 'name']),
            'pageTitle' => 'Edit Teacher',
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
