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

        return Inertia::render('Student/Dashboard', [
            'student' => [
                'name' => $user->name,
                'email' => $user->email,
                'subjects_count' => $student ? $student->subjects()->count() : 0,
                'active_plan' => 'Free Plan', // Placeholder until subscription system
            ],
            'stats' => [
                'total_classes' => array_sum($stats),
                'completed' => $stats['completed'] ?? 0,
                'upcoming_count' => $stats['upcoming'] ?? 0,
            ],
            'upcomingClasses' => $upcomingClasses,
            'topTeachers' => $topTeachers,
            'progress' => [
                'label' => 'Juz\' Amma',
                'percentage' => 77,
                'subjects' => [
                    ['name' => 'Tajweed', 'status' => 'Intermediate', 'color' => 'yellow'],
                    ['name' => 'Quran Recitation', 'status' => 'Good', 'color' => 'green'],
                    ['name' => 'Memorization', 'status' => 'In Progress (8 Surahs completed)', 'color' => 'blue'],
                ]
            ],
        ]);
    }

    /**
     * Display the student progress page.
     */
    public function progress(): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $student = $user->student()->first();

        // Fetch real feedback from reviews table (reviews written BY teachers TO this student)
        $feedback = \App\Models\Review::where('user_id', $user->id)
            ->where('reviewer_type', 'teacher')
            ->where('is_approved', true)
            ->with(['teacher.user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($review) {
                return [
                    'teacher_name' => $review->teacher?->user?->name ?? 'Unknown Teacher',
                    'teacher_avatar' => $review->teacher?->user?->avatar,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'date' => $review->created_at->format('M d, Y'),
                ];
            })
            ->toArray();

        // If no real feedback, provide placeholder
        if (empty($feedback)) {
            $feedback = [[
                'teacher_name' => 'No feedback yet',
                'teacher_avatar' => null,
                'rating' => 0,
                'comment' => 'Teachers will leave feedback here after sessions.',
                'date' => now()->format('M d, Y'),
            ]];
        }

        // Mock data for attendance/progress (until subscription system is ready)
        $mockData = [
            'attendance' => [
                'Monday' => 'checked',
                'Tuesday' => 'checked',
                'Wednesday' => 'missed',
                'Thursday' => 'checked',
                'Friday' => 'checked',
                'Saturday' => 'none',
                'Sunday' => 'none',
            ],
            'weekly_stats' => [
                ['day' => 'Mon', 'percentage' => 80],
                ['day' => 'Tue', 'percentage' => 80],
                ['day' => 'Wed', 'percentage' => 45],
                ['day' => 'Thu', 'percentage' => 80],
                ['day' => 'Fri', 'percentage' => 80],
                ['day' => 'Sat', 'percentage' => 5],
                ['day' => 'Sun', 'percentage' => 5],
            ],
            'memorization' => [
                'goal' => 'Juz\' Amma',
                'completed_percentage' => 77,
                'subjects_status' => [
                    ['name' => 'Tajweed', 'level' => 'Intermediate', 'color' => 'yellow'],
                    ['name' => 'Quran Recitation', 'level' => 'Good', 'color' => 'green'],
                    ['name' => 'Memorization', 'level' => '8 Surahs completed', 'color' => 'blue'],
                ],
                'upcoming_goal' => 'Complete Surah At-Tariq by next Friday.'
            ],
            'feedback' => $feedback,
        ];

        return Inertia::render('Student/Progress/Index', [
            'student' => [
                'id' => $student?->id ?? 0,
                'name' => $user->name,
                'avatar' => $user->avatar,
            ],
            'stats' => $mockData,
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
}
