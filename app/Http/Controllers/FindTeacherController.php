<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FindTeacherController extends Controller
{
    public function index(Request $request)
    {
        $query = Teacher::with(['user', 'subjects'])
            ->where('status', 'approved')
            ->withCount(['reviews' => function($q) {
                $q->where('is_approved', true);
            }])
            ->withAvg(['reviews' => function($q) {
                $q->where('is_approved', true);
            }], 'rating');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhere('bio', 'like', "%{$search}%")
                ->orWhereHas('subjects', function($subjectQuery) use ($search) {
                    $subjectQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Subject filter
        if ($request->filled('subject')) {
            $query->whereHas('subjects', function($q) use ($request) {
                $q->where('subjects.id', $request->subject);
            });
        }

        // Time preference filter
        if ($request->filled('time_preference')) {
            $query->where('time_preference', $request->time_preference);
        }

        // Budget filter (hourly_rate)
        if ($request->filled('budget_min')) {
            $query->where('hourly_rate', '>=', $request->budget_min);
        }
        if ($request->filled('budget_max')) {
            $query->where('hourly_rate', '<=', $request->budget_max);
        }

        // Language filter
        if ($request->filled('language')) {
            $query->where('languages', 'like', "%{$request->language}%");
        }

        // Paginate results
        $teachers = $query->latest('approved_at')
            ->paginate(12)
            ->through(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'user' => [
                        'name' => $teacher->user->name,
                        'avatar' => $teacher->user->avatar,
                    ],
                    'bio' => $teacher->bio,
                    'experience_years' => $teacher->experience_years,
                    'hourly_rate' => $teacher->hourly_rate,
                    'subjects' => $teacher->subjects->map(fn($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'proficiency_level' => $s->pivot->proficiency_level ?? 'intermediate',
                    ]),
                    'average_rating' => round($teacher->reviews_avg_rating ?? 0, 1),
                    'total_reviews' => $teacher->reviews_count,
                    'city' => $teacher->city,
                    'availability_summary' => $teacher->availability_summary,
                ];
            });

        // Get all subjects for filter dropdown
        $subjects = Subject::orderBy('name')->get(['id', 'name']);

        return Inertia::render('FindTeacher/Index', [
            'teachers' => $teachers,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject', 'time_preference', 'budget_min', 'budget_max', 'language']),
        ]);
    }
}
