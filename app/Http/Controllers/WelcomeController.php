<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function handleRedirect()
    {
        $defaultPage = SystemSetting::get('default_landing_page', 'home');

        if ($defaultPage === 'home') {
            return redirect()->route('home');
        }

        if (Route::has($defaultPage)) {
            return redirect()->route($defaultPage);
        }

        return redirect()->route('home');
    }

    public function index()
    {
        $teachers = Teacher::with(['user'])
            ->where('status', 'approved')
            ->withCount([
                'reviews' => function ($query) {
                    $query->where('is_approved', true);
                }
            ])
            ->withAvg([
                'reviews' => function ($query) {
                    $query->where('is_approved', true);
                }
            ], 'rating')
            ->latest('approved_at')
            ->take(4)
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->user->name,
                    'specialty' => is_array($teacher->specializations) && count($teacher->specializations) > 0
                        ? implode(' & ', array_slice($teacher->specializations, 0, 2))
                        : 'Quran Teacher',
                    'rating' => number_format($teacher->reviews_avg_rating ?? 0, 1),
                    'reviews' => $teacher->reviews_count,
                    'experience' => ($teacher->experience_years ?? 0) . '+ Years Exp.',
                    'image' => $teacher->user->avatar ? asset('storage/' . $teacher->user->avatar) : null,
                ];
            });

        $faqs = \App\Models\FAQ::where('status', 'published')
            ->orderBy('order')
            ->get();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'teachers' => $teachers,
            'faqs' => $faqs,
        ]);
    }

    public function bookTeacher(\App\Models\Teacher $teacher)
    {
        $user = auth()->user();

        if ($user->role === 'student') {
            return redirect()->route('student.book.index', $teacher->id);
        }

        if ($user->role === 'guardian') {
            return redirect()->route('guardian.book.index', $teacher->id);
        }

        return redirect()->route('home')->with('error', 'Only students and guardians can book classes.');
    }
}
