<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RatingController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Dashboard Data
        $pendingBookings = Booking::with(['teacher.user', 'subject'])
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereDoesntHave('reviews', function ($query) {
                $query->whereIn('reviewer_type', ['student', 'guardian']);
            })
            ->orderBy('end_time', 'desc')
            ->get();

        $teacherFeedbackPreview = Review::with(['teacher.user', 'booking.subject'])
            ->where('user_id', $user->id)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        // Performance Summary Stats
        $attendedCount = Booking::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('student_attended', true)
            ->count();
        
        $totalCompleted = Booking::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
            
        $attendanceRate = $totalCompleted > 0 ? round(($attendedCount / $totalCompleted) * 100) : 0;

        $allReceived = Review::where('user_id', $user->id)
            ->where('reviewer_type', 'teacher')
            ->get();

        $totalReviewsReceived = $allReceived->count();
        $positiveReviews = $allReceived->where('rating', '>=', 4)->count();
        $positiveFeedbackRate = $totalReviewsReceived > 0 
            ? round(($positiveReviews / $totalReviewsReceived) * 100) 
            : 0;

        $averageRating = $totalReviewsReceived > 0 ? $allReceived->avg('rating') : 0;

        return Inertia::render('Student/Ratings/Index', [
            'pendingBookings' => $pendingBookings,
            'recentReviews' => $teacherFeedbackPreview,
            'stats' => [
                'averageRating' => round($averageRating, 1),
                'totalReviews' => $totalReviewsReceived,
                'responseTime' => 'Within 45 minus',
                'attendanceRate' => $attendanceRate,
                'positiveFeedbackRate' => $positiveFeedbackRate,
            ]
        ]);
    }

    public function feedback()
    {
        $user = Auth::user();

        $teacherFeedback = Review::with(['teacher.user', 'booking.subject'])
            ->where('user_id', $user->id)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->get();

        $submittedFeedback = Review::with(['teacher.user', 'booking.subject'])
            ->where('user_id', $user->id)
            ->where('reviewer_type', 'student')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Student/Ratings/Feedback', [
            'teacherFeedback' => $teacherFeedback,
            'submittedFeedback' => $submittedFeedback,
        ]);
    }

    public function allReviews()
    {
        $user = Auth::user();

        // All reviews received from teachers (no limit)
        $reviews = Review::with(['teacher.user', 'booking.subject'])
            ->where('user_id', $user->id)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Student/Ratings/AllReviews', [
            'reviews' => $reviews,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $booking = Booking::with('teacher')->findOrFail($validated['booking_id']);

        // Security check: ensure booking belongs to user
        if ($booking->user_id !== $user->id) {
            abort(403);
        }

        // Create the review
        Review::create([
            'teacher_id' => $booking->teacher_id,
            'user_id' => $user->id,
            'booking_id' => $booking->id,
            'reviewer_type' => 'student', // Explicitly setting type
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_approved' => true,
        ]);

        return back()->with('success', 'Review submitted successfully!');
    }

    public function update(Request $request, Review $review)
    {
        // Security check: ensure review belongs to user and is of type student
        if ($review->user_id !== Auth::id() || $review->reviewer_type !== 'student') {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return back()->with('success', 'Review updated successfully!');
    }
}
