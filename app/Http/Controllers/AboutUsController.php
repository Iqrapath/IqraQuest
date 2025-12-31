<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class AboutUsController extends Controller
{
    /**
     * Display the About Us page.
     */
    public function index()
    {
        return Inertia::render('AboutUs/Index');
    }
}
