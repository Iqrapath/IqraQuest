<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index($teacherId)
    {
        $teacher = Teacher::with(['user', 'subjects', 'availability'])
            ->withCount(['reviews as total_reviews' => function ($query) {
                $query->where('is_approved', true);
            }])
            ->withAvg(['reviews as average_rating' => function ($query) {
                $query->where('is_approved', true);
            }], 'rating')
            ->findOrFail($teacherId);

        // Fetch existing bookings to prevent double booking
        $bookedSlots = Booking::where('teacher_id', $teacherId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('start_time', '>=', now())
            ->get(['start_time', 'end_time'])
            ->map(function ($booking) {
                return [
                    'start' => $booking->start_time->toIso8601String(),
                    'end' => $booking->end_time->toIso8601String(),
                ];
            });

        return Inertia::render('Student/Booking/Index', [
            'teacher' => [
                'id' => $teacher->id,
                'user' => [
                    'name' => $teacher->user->name,
                    'avatar' => $teacher->user->avatar,
                ],
                'city' => $teacher->city,
                'subjects' => $teacher->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ];
                }),
                'hourly_rate' => $teacher->hourly_rate,
                'average_rating' => (float) $teacher->average_rating ?: 0.0,
                'total_reviews' => $teacher->total_reviews,
                'availability_schedule' => $teacher->availability->map(function ($slot) {
                    return [
                        'day_of_week' => $slot->day_of_week,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'is_available' => (bool) $slot->is_available,
                    ];
                }),
            ],
            'booked_slots' => $bookedSlots,
        ]);
    }

    public function checkAvailability(Request $request, \App\Services\BookingService $bookingService)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'start_time' => 'required|date',
            'duration' => 'required|integer',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);
        $start = \Carbon\Carbon::parse($request->start_time);
        $end = $start->copy()->addMinutes($request->duration);

        // Check if I (the current user) already have a pending booking for this slot.
        // If so, it's "Available" for ME to resume.
        $myPending = Booking::where('teacher_id', $teacher->id)
            ->where('user_id', $request->user()->id)
            ->where('start_time', $start)
            ->where('status', 'pending')
            ->exists();

        if ($myPending) {
            return response()->json(['available' => true]);
        }

        $available = $bookingService->isSlotAvailable($teacher, $start, $end);

        return response()->json(['available' => $available]);
    }

    public function store(Request $request, \App\Services\BookingService $bookingService)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'start_time' => 'required|date|after:now',
            'duration' => 'required|integer|in:30,45,60', // minutes
            'is_recurring' => 'boolean',
            'recurrence_occurrences' => 'nullable|integer|min:2|max:12', // Max 12 weeks
        ]);

        $user = $request->user();
        if (!$user) abort(401);

        $teacher = Teacher::findOrFail($request->teacher_id);
        
        $startTime = \Carbon\Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($request->duration);

        $data = [
            'subject_id' => $request->subject_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];

        try {
            if ($request->is_recurring && $request->recurrence_occurrences > 1) {
                $bookingService->createRecurringSeries(
                    $user, 
                    $teacher, 
                    $data, 
                    'weekly', 
                    $request->recurrence_occurrences
                );
            } else {
                $bookingService->createBooking($user, $teacher, $data);
            }

            // Return back so frontend can show success modal
            return back()->with('success', 'Booking confirmed!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
