<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    /**
     * Display a paginated list of teachers with filters
     */
    public function index(Request $request)
    {
        $query = Teacher::query()
            ->where('status', 'approved') // Only show approved teachers
            ->with(['user', 'subjects'])
            ->select('teachers.*')
            // Calculate average rating
            ->selectSub(function ($query) {
                $query->from('reviews')
                    ->selectRaw('AVG(rating)')
                    ->whereColumn('teacher_id', 'teachers.id')
                    ->where('is_approved', true);
            }, 'average_rating')
            // Calculate total reviews
            ->selectSub(function ($query) {
                $query->from('reviews')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('teacher_id', 'teachers.id')
                    ->where('is_approved', true);
            }, 'total_reviews');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('bio', 'like', "%{$search}%");
        }

        // Subject filter
        if ($request->filled('subject')) {
            $query->whereHas('subjects', function ($q) use ($request) {
                $q->where('subject_id', $request->subject);
            });
        }

        // Rating filter
        if ($request->filled('min_rating')) {
            $query->havingRaw('average_rating >= ?', [$request->min_rating]);
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('hourly_rate', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('hourly_rate', '<=', $request->max_price);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'rating') {
            $query->orderByRaw('average_rating ' . ($sortOrder === 'asc' ? 'ASC' : 'DESC'));
        } elseif ($sortBy === 'price') {
            $query->orderBy('hourly_rate', $sortOrder);
        } elseif ($sortBy === 'experience') {
            $query->orderBy('experience_years', $sortOrder);
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        // Paginate results
        $perPage = $request->get('per_page', 12);
        $teachers = $query->paginate($perPage);

        // Transform data
        $teachers->getCollection()->transform(function ($teacher) {
            return [
                'id' => $teacher->id,
                'user' => [
                    'name' => $teacher->user->name,
                    'email' => $teacher->user->email,
                    'avatar' => $teacher->user->avatar,
                ],
                'bio' => $teacher->bio,
                'experience_years' => $teacher->experience_years,
                'hourly_rate' => $teacher->hourly_rate,
                'subjects' => $teacher->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'proficiency_level' => $subject->pivot->proficiency_level ?? null,
                    ];
                }),
                'average_rating' => round((float) $teacher->average_rating, 1) ?: 0,
                'total_reviews' => (int) $teacher->total_reviews ?: 0,
            ];
        });

        return response()->json($teachers);
    }
    /**
     * Display the specified teacher.
     */
    public function show($id)
    {
        $teacher = Teacher::with(['user', 'subjects', 'availability', 'paymentMethods'])
            ->withCount(['reviews as total_reviews' => function ($query) {
                $query->where('is_approved', true);
            }])
            ->withAvg(['reviews as average_rating' => function ($query) {
                $query->where('is_approved', true);
            }], 'rating')
            ->findOrFail($id);

        return response()->json([
            'teacher' => [
                'id' => $teacher->id,
                'user' => [
                    'name' => $teacher->user->name,
                    'email' => $teacher->user->email,
                    'avatar' => $teacher->user->avatar,
                ],
                'bio' => $teacher->bio,
                'experience_years' => $teacher->experience_years,
                'hourly_rate' => $teacher->hourly_rate,
                'status' => $teacher->status,
                'city' => $teacher->city,
                'country' => $teacher->country,
                'teaching_mode' => $teacher->teaching_mode,
                'availability_schedule' => $teacher->availability->map(function ($slot) {
                    return [
                        'day_of_week' => $slot->day_of_week,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'is_available' => (bool) $slot->is_available,
                    ];
                }),
                'subjects' => $teacher->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'proficiency_level' => $subject->pivot->proficiency_level ?? null,
                    ];
                }),
                'average_rating' => round((float) $teacher->average_rating, 1) ?: 0.0,
                'total_reviews' => (int) $teacher->total_reviews ?: 0,
                'isCertified' => $teacher->status === 'approved',
                'qualifications' => $teacher->qualifications,
                'specializations' => $teacher->specializations,
                'preferred_currency' => $teacher->preferred_currency,
                'payment_methods' => $teacher->paymentMethods->pluck('payment_type'),
                'reviews' => $teacher->reviews()
                    ->where('is_approved', true)
                    ->with('user:id,name,avatar')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($review) {
                        return [
                            'id' => $review->id,
                            'user' => [
                                'name' => $review->user->name,
                                'avatar' => $review->user->avatar,
                            ],
                            'rating' => $review->rating,
                            'comment' => $review->comment,
                            'created_at' => $review->created_at->format('M j, Y'),
                        ];
                    }),
            ]
        ]);
    }
}
