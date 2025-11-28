<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the guardian dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Guardian/Dashboard');
    }
}
