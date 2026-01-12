<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the teacher dashboard.
     */
    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $teacher = $user->teacher; // Assuming relationship exists

        $stats = [
            'active_students' => 0,
            'upcoming_sessions' => 0,
            'pending_requests' => 0,
        ];
        $sessions = collect();

        if ($teacher) {
            // Stats
            $stats['active_students'] = Booking::where('teacher_id', $teacher->id)
                ->where('status', 'completed')
                ->distinct('user_id')
                ->count('user_id'); // Count distinct user_ids

            $stats['upcoming_sessions'] = Booking::where('teacher_id', $teacher->id)
                ->where('status', 'confirmed')
                ->where('start_time', '>=', now())
                ->count();

            $stats['pending_requests'] = Booking::where('teacher_id', $teacher->id)
                ->where('status', 'pending')
                ->count();

            $sessions = Booking::where('teacher_id', $teacher->id)
                ->whereIn('status', ['confirmed', 'ongoing'])
                ->where('end_time', '>', now())
                ->with(['student', 'subject'])
                ->orderBy('start_time', 'asc')
                ->limit(20) // Limit for dashboard performance
                ->get()
                ->map(function ($booking) {
                    $start = \Carbon\Carbon::parse($booking->start_time);
                    $end = \Carbon\Carbon::parse($booking->end_time);
                    
                    return [
                        'id' => $booking->id,
                        'student' => [
                            'id' => $booking->student->id,
                            'name' => $booking->student->name,
                            'avatar' => $booking->student->avatar_url ?? null,
                        ],
                        'subject' => [
                            'id' => $booking->subject->id,
                            'name' => $booking->subject->name,
                        ],
                        'start_time' => $start->toIso8601String(),
                        'end_time' => $end->toIso8601String(),
                        'date_key' => $start->format('Y-m-d'),
                        'formatted_date' => $start->format('M d, Y'),
                        'formatted_day' => $start->format('d'),
                        'formatted_month' => $start->format('M'),
                        'formatted_start_time' => $start->format('g:i A'),
                        'formatted_end_time' => $end->format('g:i A'),
                        'status' => $booking->status,
                        'can_join' => $start->isToday() && $start->diffInMinutes(now()) <= 15, // Simple logic
                        'meeting_link' => $booking->meeting_link,
                        'notes' => null, // Placeholder as notes column was not confirmed
                    ];
                });
        }

        return Inertia::render('Teacher/Dashboard', [
            'stats' => $stats,
            'sessions' => $sessions,
            'serverDate' => now()->format('Y-m-d'),
        ]);
    }
    /**
     * Display the teacher quick start page (active students, etc).
     */
    public function quickStart(): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return to_route('teacher.onboarding.step1');
        }

        // Stats (simplified for now directly in view or reuse card)
        $stats = [
            'active_students' => Booking::where('teacher_id', $teacher->id)
                ->where('status', 'completed')
                ->distinct('user_id')
                ->count('user_id'),
            'upcoming_sessions' => Booking::where('teacher_id', $teacher->id)
                ->where('status', 'confirmed')
                ->where('start_time', '>=', now())
                ->count(),
            'pending_requests' => Booking::where('teacher_id', $teacher->id)
                ->where('status', 'pending')
                ->count(),
        ];

        // Fetch Active Students with details
        $activeStudentIds = Booking::where('teacher_id', $teacher->id)
            ->where('status', 'completed')
            ->distinct('user_id')
            ->pluck('user_id');

        $activeStudents = \App\Models\User::whereIn('id', $activeStudentIds)
            ->with(['student.subjects']) // Eager load student profile AND their subjects from student_subjects table
            ->get()
            ->map(function ($studentUser) use ($teacher) {
                $studentProfile = $studentUser->student; 

                // Get all bookings for this student with this teacher
                $studentBookings = Booking::where('teacher_id', $teacher->id)
                    ->where('user_id', $studentUser->id)
                    ->with('subject')
                    ->get();

                $completedBookings = $studentBookings->where('status', 'completed');
                $sessionsCompleted = $completedBookings->count();
                
                // Calculate total hours from completed sessions
                $totalMinutes = $completedBookings->sum(function ($booking) {
                    return $booking->actual_duration_minutes ?? $booking->start_time->diffInMinutes($booking->end_time);
                });
                $totalHours = round($totalMinutes / 60, 1);

                // Get subjects from student_subjects table (student's learning preferences)
                // Fallback to booking subjects if no preferences set
                $subjects = [];
                if ($studentProfile && $studentProfile->subjects->isNotEmpty()) {
                    $subjects = $studentProfile->subjects->pluck('name')->toArray();
                } else {
                    // Fallback: get subjects from bookings
                    $subjects = $studentBookings->pluck('subject.name')->unique()->filter()->values()->toArray();
                }

                // Get last session date
                $lastSession = $completedBookings->sortByDesc('end_time')->first();
                $lastSessionDate = $lastSession ? $lastSession->end_time->format('M d, Y') : null;

                // Get next upcoming session
                $nextSession = $studentBookings
                    ->where('status', 'confirmed')
                    ->where('start_time', '>=', now())
                    ->sortBy('start_time')
                    ->first();

                // Get all upcoming sessions for modal
                $upcomingSessions = $studentBookings
                    ->where('status', 'confirmed')
                    ->where('start_time', '>=', now())
                    ->sortBy('start_time')
                    ->take(5)
                    ->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'start_time' => $booking->start_time->format('g A'),
                            'end_time' => $booking->start_time->addMinutes($booking->start_time->diffInMinutes($booking->end_time))->format('g A'),
                            'day' => $booking->start_time->format('l'),
                            'subject' => $booking->subject->name ?? 'Session',
                        ];
                    })
                    ->values()
                    ->toArray();

                // Get latest booking ID for messaging
                $latestBooking = $studentBookings->sortByDesc('created_at')->first();

                // Get booking status from latest confirmed/pending booking
                $activeBooking = $studentBookings
                    ->whereIn('status', ['confirmed', 'pending'])
                    ->sortByDesc('created_at')
                    ->first();

                // Calculate age from date of birth
                $age = null;
                if ($studentProfile && $studentProfile->date_of_birth) {
                    $age = $studentProfile->date_of_birth->age;
                }

                // Get preferred learning time
                $preferredTime = null;
                if ($studentProfile && $studentProfile->preferred_hours) {
                    $preferredTime = $studentProfile->preferred_hours;
                }

                // Get available days
                $availableDays = [];
                if ($studentProfile && $studentProfile->preferred_days) {
                    $availableDays = is_array($studentProfile->preferred_days) 
                        ? $studentProfile->preferred_days 
                        : json_decode($studentProfile->preferred_days, true) ?? [];
                }
                
                return [
                    'id' => $studentUser->id,
                    'name' => $studentUser->name,
                    'avatar' => $studentUser->avatar ?? null,
                    'email' => $studentUser->email,
                    'level' => $studentProfile ? ucfirst($studentProfile->level ?? 'Beginner') : 'Beginner',
                    'location' => $studentProfile && $studentProfile->city 
                        ? ($studentProfile->city . ($studentProfile->country ? ', ' . $studentProfile->country : '')) 
                        : null,
                    'sessions_completed' => $sessionsCompleted,
                    'total_hours' => $totalHours,
                    'subjects' => $subjects,
                    'last_session_date' => $lastSessionDate,
                    'next_session' => $nextSession ? [
                        'id' => $nextSession->id,
                        'date' => $nextSession->start_time->format('M d'),
                        'time' => $nextSession->start_time->format('g:i A'),
                        'subject' => $nextSession->subject->name ?? 'Session',
                    ] : null,
                    'booking_id' => $latestBooking?->id,
                    // Additional fields for modal
                    'joined_date' => $studentUser->created_at->format('F Y'),
                    'age' => $age,
                    'gender' => $studentProfile?->gender,
                    'preferred_learning_time' => $preferredTime,
                    'learning_goal' => $studentProfile?->learning_goal_description,
                    'available_days' => $availableDays,
                    'booking_status' => $activeBooking?->status,
                    'upcoming_sessions' => $upcomingSessions,
                ];
            });

        // Upcoming Sessions for Calendar
        $sessions = Booking::where('teacher_id', $teacher->id)
            ->where('status', 'confirmed')
            ->where('start_time', '>=', now())
            ->with(['student', 'subject'])
            ->orderBy('start_time', 'asc')
            ->limit(50)
            ->get()
            ->map(function ($booking) {
                $start = \Carbon\Carbon::parse($booking->start_time);
                $end = \Carbon\Carbon::parse($booking->end_time);
                
                return [
                    'id' => $booking->id,
                    'student' => [
                        'id' => $booking->student->id,
                        'name' => $booking->student->name,
                        'avatar' => $booking->student->avatar_url ?? null,
                    ],
                    'subject' => [
                        'id' => $booking->subject->id,
                        'name' => $booking->subject->name,
                    ],
                    'start_time' => $start->toIso8601String(),
                    'end_time' => $end->toIso8601String(),
                    'date_key' => $start->format('Y-m-d'),
                    'formatted_date' => $start->format('M d, Y'),
                    'formatted_day' => $start->format('d'),
                    'formatted_month' => $start->format('M'),
                    'formatted_start_time' => $start->format('g:i A'),
                    'formatted_end_time' => $end->format('g:i A'),
                    'status' => $booking->status,
                    'can_join' => $start->isToday() && $start->diffInMinutes(now()) <= 15,
                    'meeting_link' => $booking->meeting_link,
                    'notes' => null,
                ];
            });

        return Inertia::render('Teacher/QuickStart/Index', [
            'stats' => $stats,
            'activeStudents' => $activeStudents,
            'sessions' => $sessions,
            'serverDate' => now()->format('Y-m-d'),
        ]);
    }
}
