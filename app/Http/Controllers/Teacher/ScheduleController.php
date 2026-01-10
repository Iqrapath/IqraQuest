<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TeacherAvailability;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display the schedule page with availability settings and sessions
     */
    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        $tab = $request->get('tab', 'availability'); // 'availability' or 'schedule'
        $sessionTab = $request->get('session_tab', 'upcoming'); // 'upcoming' or 'past'

        // Get availability settings
        $availability = $teacher->availability()
            ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')")
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'day_of_week' => $a->day_of_week,
                'is_available' => $a->is_available,
                'start_time' => $a->start_time ? substr($a->start_time, 0, 5) : null,
                'end_time' => $a->end_time ? substr($a->end_time, 0, 5) : null,
            ]);

        // Get session counts (Only confirmed sessions, rescheduling sessions are "on hold")
        $upcomingCount = Booking::where('teacher_id', $teacher->id)
            ->where('status', 'confirmed')
            ->where('start_time', '>', now())
            ->count();

        $pastCount = Booking::where('teacher_id', $teacher->id)
            ->where('status', 'completed')
            ->count();

        // Get sessions based on tab
        $sessions = $this->getSessions($teacher->id, $sessionTab);

        return Inertia::render('Teacher/Schedule/Index', [
            'tab' => $tab,
            'sessionTab' => $sessionTab,
            'availability' => $availability,
            'holidayMode' => $teacher->holiday_mode,
            'sessions' => $sessions,
            'counts' => [
                'upcoming' => $upcomingCount,
                'past' => $pastCount,
            ],
            'serverDate' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Get sessions for the schedule view
     */
    protected function getSessions(int $teacherId, string $tab)
    {
        $query = Booking::where('teacher_id', $teacherId)
            ->with(['student', 'subject']);

        if ($tab === 'upcoming') {
            $query->where('status', 'confirmed')
                ->where('start_time', '>', now())
                ->orderBy('start_time', 'asc');
        } else {
            $query->where('status', 'completed')
                ->orderBy('start_time', 'desc');
        }

        return $query->get()->map(fn($booking) => [
            'id' => $booking->id,
            'student' => [
                'id' => $booking->student->id,
                'name' => $booking->student->name,
                'avatar' => $booking->student->avatar,
            ],
            'subject' => [
                'id' => $booking->subject->id,
                'name' => $booking->subject->name,
            ],
            'start_time' => $booking->start_time->toIso8601String(),
            'end_time' => $booking->end_time->toIso8601String(),
            'date_key' => $booking->start_time->format('Y-m-d'),
            'formatted_date' => $booking->start_time->format('j M'),
            'formatted_day' => $booking->start_time->format('j'),
            'formatted_month' => $booking->start_time->format('F'),
            'formatted_start_time' => $booking->start_time->format('g:i A'),
            'formatted_end_time' => $booking->end_time->format('g:i A'),
            'status' => $booking->status,
            'can_join' => $this->canJoinSession($booking),
            'meeting_link' => $booking->meeting_link,
        ]);
    }

    /**
     * Check if teacher can join the session
     */
    protected function canJoinSession(Booking $booking): bool
    {
        if (!in_array($booking->status, ['confirmed', 'rescheduling'])) {
            return false;
        }

        $now = now();
        $startTime = $booking->start_time;
        $endTime = $booking->end_time;

        // Can join 15 minutes before until session ends (aligned with ClassroomController)
        return $now->gte($startTime->copy()->subMinutes(15)) && $now->lte($endTime);
    }

    /**
     * Get sessions for a specific date (AJAX)
     */
    public function getSessionsForDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $teacher = Auth::user()->teacher;
        $date = Carbon::parse($request->date);

        $sessions = Booking::where('teacher_id', $teacher->id)
            ->whereIn('status', ['confirmed', 'rescheduling'])
            ->whereDate('start_time', $date)
            ->with(['student', 'subject'])
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(fn($booking) => [
                'id' => $booking->id,
                'student' => [
                    'id' => $booking->student->id,
                    'name' => $booking->student->name,
                    'avatar' => $booking->student->avatar,
                ],
                'subject' => [
                    'id' => $booking->subject->id,
                    'name' => $booking->subject->name,
                ],
                'formatted_start_time' => $booking->start_time->format('g:i A'),
                'formatted_end_time' => $booking->end_time->format('g:i A'),
                'can_join' => $this->canJoinSession($booking),
                'meeting_link' => $booking->meeting_link,
            ]);

        return response()->json(['sessions' => $sessions]);
    }

    /**
     * Update availability settings
     */
    public function updateAvailability(Request $request)
    {
        $request->validate([
            'availability' => 'required|array',
            'availability.*.day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'availability.*.is_available' => 'required|boolean',
            'availability.*.start_time' => 'nullable|date_format:H:i',
            'availability.*.end_time' => [
                'nullable',
                'date_format:H:i',
                'after:availability.*.start_time',
                function ($attribute, $value, $fail) use ($request) {
                    $index = explode('.', $attribute)[1];
                    $avail = $request->input("availability.{$index}");
                    if ($avail['is_available'] && !empty($avail['start_time']) && !empty($value)) {
                        $startParts = explode(':', $avail['start_time']);
                        $endParts = explode(':', $value);
                        $startMin = (int)$startParts[0] * 60 + (int)$startParts[1];
                        $endMin = (int)$endParts[0] * 60 + (int)$endParts[1];

                        // Handle rollover (e.g. 23:00 to 00:00)
                        if ($endMin < $startMin) {
                            $endMin += 1440;
                        }

                        if (($endMin - $startMin) !== 60) {
                            $fail("The duration for {$avail['day_of_week']} must be exactly 1 hour.");
                        }
                    }
                }
            ],
        ]);

        $teacher = Auth::user()->teacher;

        DB::transaction(function () use ($teacher, $request) {
            // Delete existing availability
            $teacher->availability()->delete();

            // Create new availability records
            foreach ($request->availability as $day) {
                TeacherAvailability::create([
                    'teacher_id' => $teacher->id,
                    'day_of_week' => $day['day_of_week'],
                    'is_available' => $day['is_available'],
                    'start_time' => $day['is_available'] ? $day['start_time'] : null,
                    'end_time' => $day['is_available'] ? $day['end_time'] : null,
                ]);
            }
        });

        return back()->with('success', 'Availability updated successfully.');
    }

    /**
     * Toggle holiday mode
     */
    public function toggleHolidayMode(Request $request)
    {
        $teacher = Auth::user()->teacher;
        $teacher->update(['holiday_mode' => !$teacher->holiday_mode]);

        $status = $teacher->holiday_mode ? 'enabled' : 'disabled';
        return back()->with('success', "Holiday mode {$status}.");
    }
}

