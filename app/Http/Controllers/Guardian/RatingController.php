<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Guardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RatingController extends Controller
{
    private function getStudentUserIds()
    {
        $guardian = Auth::user()->guardian;
        if (!$guardian) return [];
        
        return $guardian->students()
            ->with('user')
            ->get()
            ->pluck('user_id')
            ->toArray();
    }

    public function index()
    {
        $studentUserIds = $this->getStudentUserIds();

        // Dashboard Data
        $pendingBookings = Booking::with(['teacher.user', 'subject', 'student'])
            ->whereIn('user_id', $studentUserIds)
            ->where('status', 'completed')
            ->whereDoesntHave('reviews', function ($query) {
                $query->whereIn('reviewer_type', ['student', 'guardian']);
            })
            ->orderBy('end_time', 'desc')
            ->get();

        $teacherFeedbackPreview = Review::with(['teacher.user', 'booking.subject', 'user'])
            ->whereIn('user_id', $studentUserIds)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        // Performance Summary Stats (Aggregated across all students)
        $attendedCount = Booking::whereIn('user_id', $studentUserIds)
            ->where('status', 'completed')
            ->where('student_attended', true)
            ->count();
        
        $totalCompleted = Booking::whereIn('user_id', $studentUserIds)
            ->where('status', 'completed')
            ->count();
            
        $attendanceRate = $totalCompleted > 0 ? round(($attendedCount / $totalCompleted) * 100) : 0;

        $allReceived = Review::whereIn('user_id', $studentUserIds)
            ->where('reviewer_type', 'teacher')
            ->get();

        $totalReviewsReceived = $allReceived->count();
        $positiveReviews = $allReceived->where('rating', '>=', 4)->count();
        $positiveFeedbackRate = $totalReviewsReceived > 0 
            ? round(($positiveReviews / $totalReviewsReceived) * 100) 
            : 0;

        $averageRating = $totalReviewsReceived > 0 ? $allReceived->avg('rating') : 0;

        return Inertia::render('Guardian/Ratings/Index', [
            'pendingBookings' => $pendingBookings,
            'recentReviews' => $teacherFeedbackPreview,
            'stats' => [
                'averageRating' => round($averageRating, 1),
                'totalReviews' => $totalReviewsReceived,
                'responseTime' => 'Within 1 hour', // Placeholder for Guardian
                'attendanceRate' => $attendanceRate,
                'positiveFeedbackRate' => $positiveFeedbackRate,
            ]
        ]);
    }

    public function feedback()
    {
        $studentUserIds = $this->getStudentUserIds();

        $teacherFeedback = Review::with(['teacher.user', 'booking.subject', 'user'])
            ->whereIn('user_id', $studentUserIds)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->get();

        $submittedFeedback = Review::with(['teacher.user', 'booking.subject', 'user'])
            ->whereIn('user_id', $studentUserIds)
            ->where('reviewer_type', 'guardian')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Guardian/Ratings/Feedback', [
            'teacherFeedback' => $teacherFeedback,
            'submittedFeedback' => $submittedFeedback,
        ]);
    }

    public function allReviews()
    {
        $studentUserIds = $this->getStudentUserIds();

        // All reviews received for any of the guardian's students
        $reviews = Review::with(['teacher.user', 'booking.subject', 'user'])
            ->whereIn('user_id', $studentUserIds)
            ->where('reviewer_type', 'teacher')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Guardian/Ratings/AllReviews', [
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

        $studentUserIds = $this->getStudentUserIds();
        $booking = Booking::with('teacher')->findOrFail($validated['booking_id']);

        // Security check: ensure booking belongs to one of the guardian's students
        if (!in_array($booking->user_id, $studentUserIds)) {
            abort(403);
        }

        // Create the review with type 'guardian'
        Review::create([
            'teacher_id' => $booking->teacher_id,
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'reviewer_type' => 'guardian', 
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_approved' => true,
        ]);

        return back()->with('success', 'Review submitted successfully!');
    }

    public function update(Request $request, Review $review)
    {
        $studentUserIds = $this->getStudentUserIds();
        
        // Security check: ensure review belongs to one of the guardian's students
        if (!in_array($review->user_id, $studentUserIds) || $review->reviewer_type !== 'guardian') {
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
