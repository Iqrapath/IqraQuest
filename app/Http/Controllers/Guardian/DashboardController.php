<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Teacher;
use App\Services\BookingStatusService;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected $bookingStatusService;

    public function __construct(BookingStatusService $bookingStatusService)
    {
        $this->bookingStatusService = $bookingStatusService;
    }

    /**
     * Display the guardian dashboard.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $guardian = $user->guardian()->first();
        
        // Fetch Stats for the Guardian (direct bookings)
        $stats = $this->bookingStatusService->getStatusCounts($user);

        // Fetch Upcoming Classes (limit to 2 for the dashboard feed)
        $upcomingClasses = $this->bookingStatusService->getBookings(
            $user, 
            BookingStatusService::STATUS_UPCOMING, 
            2, 
            false
        )->map(fn($booking) => $this->bookingStatusService->formatBookingForResponse($booking, $user));

        // Fetch Top Rated Teachers (top 5 by rating)
        $topTeachers = Teacher::with(['user', 'subjects'])
            ->withCount(['reviews as approved_reviews_count' => function ($query) {
                $query->where('is_approved', true);
            }])
            ->withAvg(['reviews as average_rating' => function ($query) {
                $query->where('is_approved', true);
            }], 'rating')
            ->where('status', 'approved')
            ->where('holiday_mode', false)
            ->orderByDesc('average_rating')
            ->orderByDesc('approved_reviews_count')
            ->limit(5)
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'user' => [
                        'name' => $teacher->user->name,
                        'avatar' => $teacher->user->avatar,
                    ],
                    'bio' => $teacher->bio,
                    'experience_years' => $teacher->experience_years,
                    'hourly_rate' => $teacher->hourly_rate,
                    'subjects' => $teacher->subjects,
                    'average_rating' => round($teacher->average_rating ?? 0, 1),
                    'total_reviews' => $teacher->approved_reviews_count,
                ];
            });

        return Inertia::render('Guardian/Dashboard', [
            'guardian' => [
                'name' => $user->name,
                'email' => $user->email,
                'children_count' => $guardian ? $guardian->students()->count() : 0,
            ],
            'stats' => [
                'total_classes' => array_sum($stats),
                'completed' => $stats['completed'] ?? 0,
                'upcoming_count' => $stats['upcoming'] ?? 0,
            ],
            'upcomingClasses' => $upcomingClasses,
            'topTeachers' => $topTeachers,
        ]);
    }

    /**
     * Display the Quick Start (class history) page for the guardian.
     */
    public function quickStart(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        // Fetch booking stats
        $stats = $this->bookingStatusService->getStatusCounts($user);

        // Fetch all bookings using BookingStatusService for consistent formatting
        $allBookings = $user->bookings()
            ->with(['teacher.user', 'subject'])
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(fn($booking) => $this->bookingStatusService->formatBookingForResponse($booking, $user));

        // Fetch upcoming bookings
        $upcomingBookings = $this->bookingStatusService->getBookings(
            $user,
            BookingStatusService::STATUS_UPCOMING,
            10,
            false
        )->map(fn($booking) => $this->bookingStatusService->formatBookingForResponse($booking, $user));

        return Inertia::render('Guardian/QuickStart/Index', [
            'stats' => [
                'total' => array_sum($stats),
                'completed' => $stats['completed'] ?? 0,
                'upcoming' => $stats['upcoming'] ?? 0,
            ],
            'allBookings' => $allBookings,
            'upcomingBookings' => $upcomingBookings,
        ]);
    }

    /**
     * Display the list of registered children for the guardian.
     */
    public function children(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $guardian = $user->guardian()->first();
        
        $children = $guardian ? $guardian->students()
            ->with(['user', 'subjects'])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->user->name,
                    'age' => $student->date_of_birth ? $student->date_of_birth->age : 'N/A',
                    'subjects' => $student->subjects->pluck('name')->join(', '),
                    'status' => ucfirst($student->user->status),
                ];
            }) : collect([]);

        return Inertia::render('Guardian/ChildrenDetails', [
            'guardian_name' => $user->name,
            'children' => $children,
            'total_children' => $children->count(),
        ]);
    }

    /**
     * Show the edit page for a specific child.
     */
    public function editChild(Student $student): Response
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure this student belongs to this guardian
        $guardian = $user->guardian()->first();
        if (!$guardian || !$guardian->students()->where('students.id', $student->id)->exists()) {
            abort(403);
        }

        $student->load(['user', 'subjects']);
        $subjects = \App\Models\Subject::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Guardian/Children/Edit', [
            'child' => [
                'id' => $student->id,
                'name' => $student->user->name,
                'email' => $student->user->email,
                'age' => $student->date_of_birth ? $student->date_of_birth->age : null,
                'gender' => $student->gender,
                'subjects' => $student->subjects->pluck('id'),
                'created_at' => $student->created_at,
                'status' => $student->user->status,
                'learning_goal_description' => $student->learning_goal_description,
                'preferred_days' => $student->preferred_days,
            ],
            'subjects' => $subjects,
        ]);
    }

    /**
     * Update a specific child's profile.
     */
    public function updateChild(Request $request, Student $student)
    {
        /** @var User $user */
        $user = Auth::user();
        $guardian = $user->guardian()->first();

        if (!$guardian || !$guardian->students()->where('students.id', $student->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'gender' => 'sometimes|required|in:male,female,other',
            'subjects' => 'sometimes|required|array|min:1',
            'subjects.*' => 'exists:subjects,id',
            'learning_goal_description' => 'sometimes|nullable|string|max:1000',
            'preferred_days' => 'sometimes|nullable|array',
        ]);

        if (isset($validated['name'])) {
            $student->user->update(['name' => $validated['name']]);
        }

        $studentData = array_diff_key($validated, array_flip(['name', 'subjects']));
        $student->update($studentData);

        if (isset($validated['subjects'])) {
            $student->subjects()->sync($validated['subjects']);
        }
    }
}
