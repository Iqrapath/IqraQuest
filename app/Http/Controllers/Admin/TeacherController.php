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
        ];

        return Inertia::render('Admin/Teachers/Show', [
            'teacher' => $teacher,
            'stats' => $stats,
            'pageTitle' => 'Teacher Management',
        ]);
    }

    /**
     * Update teacher status (suspend/activate)
     */
    public function updateStatus(Request $request, Teacher $teacher)
    {
        $request->validate([
            'status' => 'required|in:approved,suspended',
            'reason' => 'required_if:status,suspended|string|max:500',
        ]);

        $teacher->update([
            'status' => $request->status,
            'suspension_reason' => $request->status === 'suspended' ? $request->reason : null,
            'suspended_at' => $request->status === 'suspended' ? now() : null,
        ]);

        $message = $request->status === 'suspended' 
            ? "Teacher {$teacher->user->name} has been suspended."
            : "Teacher {$teacher->user->name} has been activated.";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Get teacher analytics
     */
    public function analytics(Teacher $teacher)
    {
        // This can be expanded with actual booking/revenue data when those models exist
        $analytics = [
            'monthly_bookings' => [], // Placeholder
            'total_revenue' => $teacher->hourly_rate * 100, // Placeholder calculation
            'average_rating' => 4.5, // Placeholder
            'completion_rate' => 95, // Placeholder
        ];

        return response()->json($analytics);
    }
}
