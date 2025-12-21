<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TeacherController extends Controller
{
    /**
     * Display the browse teachers page for guardians
     */
    public function index()
    {
        return Inertia::render('Guardian/Teachers/Browse');
    }

    /**
     * Display a specific teacher's profile
     */
    public function show($id)
    {
        return Inertia::render('Guardian/Teachers/Show', [
            'teacherId' => $id,
        ]);
    }
}
