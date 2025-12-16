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
        $user = auth()->user();
        
        $bookings = collect();
        if ($user->teacher) {
            $bookings = Booking::where('teacher_id', $user->teacher->id)
                ->where('status', 'confirmed')
                ->where('start_time', '>=', now())
                ->with(['student', 'subject'])
                ->orderBy('start_time', 'asc')
                ->get();
        }

        return Inertia::render('Teacher/Dashboard', [
            'bookings' => $bookings
        ]);
    }
}
