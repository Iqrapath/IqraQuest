<?php

namespace App\Http\Controllers\Teacher;

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
        $teacher = Auth::user()->teacher;
        if (!$teacher) abort(404);

        // Dashboard Data
        $pendingBookings = Booking::with(['student', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->where('status', 'completed')
            ->whereDoesntHave('reviews', function ($query) {
                $query->where('reviewer_type', 'teacher');
            })
            ->orderBy('end_time', 'desc')
            ->get();

        $recentReviews = Review::with(['user', 'booking.subject'])
            ->where('teacher_id', $teacher->id)
            ->whereIn('reviewer_type', ['student', 'guardian'])
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        // Performance Summary Stats
        $attendedCount = Booking::where('teacher_id', $teacher->id)
            ->where('status', 'completed')
            ->where('teacher_attended', true)
            ->count();
        
        $totalCompleted = Booking::where('teacher_id', $teacher->id)
            ->where('status', 'completed')
            ->count();
            
        $attendanceRate = $totalCompleted > 0 ? round(($attendedCount / $totalCompleted) * 100) : 0;

        $allReceived = Review::where('teacher_id', $teacher->id)
            ->whereIn('reviewer_type', ['student', 'guardian'])
            ->get();

        $totalReviewsReceived = $allReceived->count();
        $positiveReviews = $allReceived->where('rating', '>=', 4)->count();
        $positiveFeedbackRate = $totalReviewsReceived > 0 
            ? round(($positiveReviews / $totalReviewsReceived) * 100) 
            : 0;

        $averageRating = $totalReviewsReceived > 0 ? $allReceived->avg('rating') : 0;

        return Inertia::render('Teacher/Ratings/Index', [
            'pendingBookings' => $pendingBookings,
            'recentReviews' => $recentReviews,
            'stats' => [
                'averageRating' => round($averageRating, 1),
                'totalReviews' => $totalReviewsReceived,
                'attendanceRate' => $attendanceRate,
                'positiveFeedbackRate' => $positiveFeedbackRate,
            ]
        ]);
    }

    public function feedback()
    {
        $teacher = Auth::user()->teacher;
        
        $receivedFeedback = Review::with(['user', 'booking.subject'])
            ->where('teacher_id', $teacher->id)
            ->whereIn('reviewer_type', ['student', 'guardian'])
            ->orderBy('created_at', 'desc')
            ->get();

        $givenFeedback = Review::with(['user', 'booking.subject'])
            ->where('teacher_id', $teacher->id)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/Ratings/Feedback', [
            'receivedFeedback' => $receivedFeedback,
            'givenFeedback' => $givenFeedback,
        ]);
    }

    public function allReviews()
    {
        $teacher = Auth::user()->teacher;

        $reviews = Review::with(['user', 'booking.subject'])
            ->where('teacher_id', $teacher->id)
            ->whereIn('reviewer_type', ['student', 'guardian'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/Ratings/AllReviews', [
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

        $teacher = Auth::user()->teacher;
        $booking = Booking::findOrFail($validated['booking_id']);

        if ($booking->teacher_id !== $teacher->id) {
            abort(403);
        }

        Review::create([
            'teacher_id' => $teacher->id,
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'reviewer_type' => 'teacher',
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_approved' => true,
        ]);

        return back()->with('success', 'Feedback sent to student!');
    }

    public function update(Request $request, Review $review)
    {
        $teacher = Auth::user()->teacher;

        if ($review->teacher_id !== $teacher->id || $review->reviewer_type !== 'teacher') {
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

        return back()->with('success', 'Feedback updated successfully!');
    }
}
