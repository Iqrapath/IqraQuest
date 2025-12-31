<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HowItWorksController extends Controller
{
    /**
     * Display the How It Works page.
     */
    public function index()
    {
        return Inertia::render('HowItWorks/Index');
    }
}
