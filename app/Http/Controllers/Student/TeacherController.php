<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    /**
     * Display the browse teachers page
     */
    public function index()
    {
        return Inertia::render('Student/Teachers/Browse');
    }

    /**
     * Display a specific teacher's profile
     */
    public function show($id)
    {
        return Inertia::render('Student/Teachers/Show', [
            'teacherId' => $id,
        ]);
    }
}
