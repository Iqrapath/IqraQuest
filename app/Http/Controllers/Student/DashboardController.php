<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard.
     */
    public function index(): Response
    {
        $bookings = auth()->user()->bookings() // Assumes 'bookings()' relationship exists on User model (Student)
            ->with(['teacher.user', 'subject'])
            ->where('status', 'confirmed')
            ->where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->get();

        return Inertia::render('Student/Dashboard', [
            'bookings' => $bookings
        ]);
    }
}
