<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the teacher dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Teacher/Dashboard');
    }
}
