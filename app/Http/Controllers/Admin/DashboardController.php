<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        // 1. Stats
        $totalTeachers = \App\Models\User::where('role', \App\Enums\UserRole::TEACHER)->count();
        $activeStudents = \App\Models\User::where('role', \App\Enums\UserRole::STUDENT)
            ->where('status', 'active')
            ->count();
        // Proxy for subscriptions: count of scheduled bookings
        $activeSubscriptions = \App\Models\Booking::where('status', 'scheduled')->count(); 
        // Pending verifications (teachers not yet approved/verified)
        $pendingVerifications = \App\Models\Teacher::where('status', 'pending')->count();

        // 2. Revenue Chart Data
        $timeRange = request('time_range', 'this_year');
        $query = \App\Models\Transaction::completed()->where('type', 'credit'); // Income

        $rangeData = [];
        
        if ($timeRange === 'this_year') {
            $query->whereYear('created_at', now()->year);
            $queryResult = $query->selectRaw('DATE_FORMAT(created_at, "%b") as label, SUM(amount) as total')
                ->groupBy('label')
                ->pluck('total', 'label');
            
            // Fill all months
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            foreach ($months as $month) {
                $rangeData[] = [
                    'label' => $month,
                    'total' => $queryResult[$month] ?? 0
                ];
            }

        } elseif ($timeRange === 'last_12_months') {
            $startDate = now()->subMonths(11)->startOfMonth();
            $query->where('created_at', '>=', $startDate);
            $queryResult = $query->selectRaw('DATE_FORMAT(created_at, "%b %Y") as label, SUM(amount) as total')
                ->groupBy('label')
                ->pluck('total', 'label');

            for ($i = 0; $i < 12; $i++) {
                $date = $startDate->copy()->addMonths($i);
                $label = $date->format('M Y');
                $rangeData[] = [
                    'label' => $date->format('M'), // Short label for chart
                    'full_label' => $label, // Full label for processing if needed
                    'total' => $queryResult[$label] ?? 0
                ];
            }

        } elseif ($timeRange === 'this_month') {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
            $query->whereBetween('created_at', [$startDate, $endDate]);
            $queryResult = $query->selectRaw('DATE_FORMAT(created_at, "%d %b") as label, SUM(amount) as total')
                ->groupBy('label')
                ->pluck('total', 'label');
            
            // Fill all days in month
            while ($startDate <= $endDate) {
                $label = $startDate->format('d M');
                $rangeData[] = [
                    'label' => $startDate->format('d'),
                    'total' => $queryResult[$label] ?? 0
                ];
                $startDate->addDay();
            }

        } elseif ($timeRange === 'last_month') {
            $startDate = now()->subMonth()->startOfMonth();
            $endDate = now()->subMonth()->endOfMonth();
            $query->whereBetween('created_at', [$startDate, $endDate]);
            $queryResult = $query->selectRaw('DATE_FORMAT(created_at, "%d %b") as label, SUM(amount) as total')
                ->groupBy('label')
                ->pluck('total', 'label');

            while ($startDate <= $endDate) {
                $label = $startDate->format('d M');
                $rangeData[] = [
                    'label' => $startDate->format('d'),
                    'total' => $queryResult[$label] ?? 0
                ];
                $startDate->addDay();
            }

        } elseif ($timeRange === 'last_30_days') {
            $startDate = now()->subDays(29);
            $query->where('created_at', '>=', $startDate);
            $queryResult = $query->selectRaw('DATE_FORMAT(created_at, "%d %b") as label, SUM(amount) as total')
                ->groupBy('label')
                ->pluck('total', 'label');

            for ($i = 0; $i < 30; $i++) {
                $date = $startDate->copy()->addDays($i);
                $label = $date->format('d M');
                $rangeData[] = [
                    'label' => $date->format('d M'),
                    'total' => $queryResult[$label] ?? 0
                ];
            }
        } else {
             // Fallback to this year
             $query->whereYear('created_at', now()->year);
             $queryResult = $query->selectRaw('DATE_FORMAT(created_at, "%b") as label, SUM(amount) as total')
                 ->groupBy('label')
                 ->pluck('total', 'label');
             
             $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
             foreach ($months as $month) {
                 $rangeData[] = [
                     'label' => $month,
                     'total' => $queryResult[$month] ?? 0
                 ];
             }
        }

        $revenueData = $rangeData;

        // 3. Recent Students
        $recentStudents = \App\Models\User::where('role', \App\Enums\UserRole::STUDENT)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                ];
            });

        // 4. Recent Bookings
        $recentBookings = \App\Models\Booking::with(['student', 'teacher.user', 'subject'])
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'student_name' => $booking->student->name ?? 'Unknown',
                    'teacher_name' => $booking->teacher->user->name ?? 'Unknown',
                    'student_avatar' => $booking->student->avatar_url ?? null,
                    'status' => $booking->status,
                    'subject' => $booking->subject->name ?? 'Class',
                    'created_at_human' => $booking->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_teachers' => $totalTeachers,
                'active_students' => $activeStudents,
                'active_subscriptions' => $activeSubscriptions,
                'pending_verifications' => $pendingVerifications,
            ],
            'revenue_data' => $revenueData,
            'current_filter' => $timeRange,
            'recent_students' => $recentStudents,
            'recent_bookings' => $recentBookings,
        ]);
    }
}
