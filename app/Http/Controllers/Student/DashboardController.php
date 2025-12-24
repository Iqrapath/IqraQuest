<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use App\Services\BookingStatusService;
use Illuminate\Support\Facades\Auth;
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
     * Display the student dashboard.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $student = $user->student()->first();

        // Fetch Stats for the Student
        $stats = $this->bookingStatusService->getStatusCounts($user);

        // Fetch Upcoming Classes (limit to 3 for the dashboard feed)
        $upcomingClasses = $this->bookingStatusService->getBookings(
            $user,
            BookingStatusService::STATUS_UPCOMING,
            3,
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

        // Get progress data based on completed bookings
        $progress = $this->getStudentProgress($user);

        return Inertia::render('Student/Dashboard', [
            'student' => [
                'name' => $user->name,
                'email' => $user->email,
                'subjects_count' => $student ? $student->subjects()->count() : 0,
                'active_plan' => 'Free Plan',
            ],
            'stats' => [
                'total_classes' => array_sum($stats),
                'completed' => $stats['completed'] ?? 0,
                'upcoming_count' => $stats['upcoming'] ?? 0,
            ],
            'upcomingClasses' => $upcomingClasses,
            'topTeachers' => $topTeachers,
            'progress' => $progress,
        ]);
    }

    /**
     * Display the Quick Start (class history) page.
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

        // Fetch upcoming bookings using BookingStatusService (same format as Bookings/Index.tsx)
        $upcomingBookings = $this->bookingStatusService->getBookings(
            $user,
            BookingStatusService::STATUS_UPCOMING,
            10,
            false
        )->map(fn($booking) => $this->bookingStatusService->formatBookingForResponse($booking, $user));

        return Inertia::render('Student/QuickStart/Index', [
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
     * Get student progress based on completed bookings.
     */
    protected function getStudentProgress(User $user): array
    {
        $totalBookings = $user->bookings()->count();
        $completedBookings = $user->bookings()->where('status', 'completed')->count();
        
        $percentage = $totalBookings > 0 
            ? min(100, round(($completedBookings / max($totalBookings, 1)) * 100))
            : 0;

        $upcomingGoal = match (true) {
            $completedBookings === 0 => 'Book your first session to start learning!',
            $completedBookings < 5 => 'Great start! Keep booking sessions.',
            $completedBookings < 10 => 'Making progress! Stay consistent.',
            $completedBookings < 20 => 'Excellent dedication! Keep it up.',
            default => 'Amazing progress! You\'re doing great!',
        };

        return [
            'label' => 'Learning Progress',
            'percentage' => $percentage,
            'upcoming_goal' => $upcomingGoal,
        ];
    }
}
