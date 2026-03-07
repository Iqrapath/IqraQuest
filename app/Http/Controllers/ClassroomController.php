<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\ClassroomAttendance;
use App\Services\LiveKitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ClassroomController extends Controller
{
    protected LiveKitService $liveKitService;

    public function __construct(LiveKitService $liveKitService)
    {
        $this->liveKitService = $liveKitService;
    }

    /**
     * Join the classroom.
     */
    public function join(Request $request, Booking $booking)
    {
        $user = Auth::user();

        // 1. Participant Check
        $isAdmin = $user->isAdmin();
        if (!$booking->isParticipant($user)) {
            abort(403, 'You are not a participant of this class.');
        }

        // 2. Status Check
        if (!in_array($booking->status, ['confirmed', 'ongoing'])) {
            abort(403, 'This class is not confirmed or ongoing.');
        }

        // 3. Time Check (Allow 15 min early)
        $now = Carbon::now();
        $start = Carbon::parse($booking->start_time);
        $end = Carbon::parse($booking->end_time);

        // Can join 15 minutes before start until session ends
        if ($now->lt($start->copy()->subMinutes(15))) {
            abort(403, 'Class has not started yet. You can join 15 minutes before the scheduled time.');
        }

        if ($now->gt($end)) {
            abort(403, 'This class has already ended.');
        }

        // 4. Generate Token
        $roomName = "booking-" . $booking->id;
        $participantIdentity = "user-" . $user->id;
        $participantName = $user->name;

        $token = $this->liveKitService->generateToken(
            $roomName,
            $participantIdentity,
            $participantName,
            $isAdmin
        );

        // Load materials with formatted data
        $materials = $booking->materials()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'type' => $m->file_type,
                'url' => $m->url,
                'size' => $m->formatted_size,
            ]);

        return Inertia::render('Classroom/Room', [
            'booking' => $booking->load(['student', 'teacher.user', 'subject']),
            'token' => $token,
            'roomName' => $roomName,
            'isTeacher' => $booking->getAttendeeRole($user) === 'teacher',
            'isAdmin' => $user->isAdmin(),
            'liveKitUrl' => config('services.livekit.url'),
            'materials' => $materials,
        ]);
    }

    /**
     * Record attendance when user joins the classroom
     */
    public function recordJoin(Request $request, Booking $booking)
    {
        $user = Auth::user();
        $role = $booking->getAttendeeRole($user);

        \Illuminate\Support\Facades\Log::debug("[Classroom] User #{$user->id} joining booking #{$booking->id} as {$role}");

        return \Illuminate\Support\Facades\DB::transaction(function () use ($user, $booking, $role, $request) {
            // 1. Record individual attendance record if not exists
            $attendance = ClassroomAttendance::firstOrCreate([
                'booking_id' => $booking->id,
                'user_id' => $user->id,
                'left_at' => null,
            ], [
                'role' => $role,
                'joined_at' => now()->setTimezone('UTC'),
                'metadata' => [
                    'user_agent' => $request->userAgent(),
                    'ip' => $request->ip(),
                ]
            ]);

            // 2. Set attendance flags on the Booking
            if ($role === 'teacher') {
                $booking->recordTeacherAttendance();
            } else {
                $booking->recordStudentAttendance();
            }

            // 3. Mark session as started on the first join
            $booking->markSessionStarted();

            // 4. Refresh and handle status transition
            $booking->refresh();
            if ($booking->teacher_attended && $booking->student_attended && $booking->status === 'confirmed') {
                $affected = Booking::where('id', $booking->id)
                    ->where('status', 'confirmed')
                    ->where('teacher_attended', true)
                    ->where('student_attended', true)
                    ->update(['status' => 'ongoing']);

                if ($affected) {
                    \Illuminate\Support\Facades\Log::info("[Classroom] Booking #{$booking->id} transitioned to ONGOING");
                }
            }

            return response()->json([
                'success' => true,
                'attendance_id' => $attendance->id,
                'message' => 'Attendance recorded'
            ]);
        });
    }

    /**
     * Record when user leaves the classroom
     */
    public function recordLeave(Request $request, Booking $booking)
    {
        $user = Auth::user();

        // Find the open attendance record
        $attendance = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('user_id', $user->id)
            ->whereNull('left_at')
            ->latest('joined_at')
            ->first();

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active attendance record found'
            ], 404);
        }

        // Record leave time and calculate duration
        \Illuminate\Support\Facades\Log::debug("[Classroom] User #{$user->id} leaving booking #{$booking->id}");
        $attendance->recordLeave();

        // Optionally update connection quality from request
        if ($request->has('connection_quality')) {
            $attendance->update(['connection_quality' => $request->connection_quality]);
        }

        // ── Option C: Event-driven session completion ──
        // Check if everyone has left and trigger completion immediately
        $this->checkAndCompleteSession($booking);

        return response()->json([
            'success' => true,
            'duration' => $attendance->formatted_duration,
            'message' => 'Leave recorded'
        ]);
    }

    /**
     * Check if session should be submitted for judgment.
     * Called when a participant leaves the room.
     *
     * NOTE: This method ONLY transitions the booking to 'awaiting_judgment'.
     * It does NOT make any financial decisions — that is the SessionArbiter's job.
     */
    protected function checkAndCompleteSession(Booking $booking): void
    {
        // Only process if session is still active (confirmed or ongoing)
        if (!in_array($booking->status, ['confirmed', 'ongoing'])) {
            return;
        }

        // Check if anyone is still in the room
        $activeParticipants = ClassroomAttendance::where('booking_id', $booking->id)
            ->whereNull('left_at')
            ->count();

        if ($activeParticipants > 0) {
            return; // Someone is still in the room
        }

        // Everyone has left — check if end time has passed
        $endTime = Carbon::parse($booking->end_time);
        $now = Carbon::now();

        if ($now->gte($endTime)) {
            // End time passed and room is empty → submit for judgment
            $booking->markSessionEnded();

            // Sync attendance flags from actual records
            $this->syncAttendanceFlags($booking);

            // Transition to awaiting_judgment — the Arbiter will handle financials
            $booking->update([
                'status' => 'awaiting_judgment',
                'judgment_at' => now(),
            ]);

            \Illuminate\Support\Facades\Log::info(
                "Classroom: Booking #{$booking->id} submitted for judgment (room emptied after end_time)"
            );
        }
    }

    /**
     * Sync attendance flags from actual ClassroomAttendance records.
     * Safety net ensuring flags match reality even if they weren't set earlier.
     */
    protected function syncAttendanceFlags(Booking $booking): void
    {
        $hasTeacher = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'teacher')
            ->exists();

        $hasStudent = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'student')
            ->exists();

        $updates = [];
        if ($hasTeacher && !$booking->teacher_attended) {
            $updates['teacher_attended'] = true;
        }
        if ($hasStudent && !$booking->student_attended) {
            $updates['student_attended'] = true;
        }

        if (!empty($updates)) {
            $booking->update($updates);
            $booking->refresh();
            \Illuminate\Support\Facades\Log::info(
                "Classroom: Auto-fixed attendance flags for booking #{$booking->id}",
                $updates
            );
        }
    }

    /**
     * Get attendance records for a booking (teacher/admin only)
     */
    public function getAttendance(Booking $booking)
    {
        $user = Auth::user();

        // Check authorization
        $isTeacher = $user->teacher && $user->teacher->id === $booking->teacher_id;
        $isAdmin = $user->isAdmin();

        if (!$isTeacher && !$isAdmin) {
            abort(403, 'Unauthorized');
        }

        $attendance = ClassroomAttendance::where('booking_id', $booking->id)
            ->with('user:id,name,email')
            ->orderBy('joined_at', 'desc')
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'user' => $a->user,
                'role' => $a->role,
                'joined_at' => $a->joined_at->format('H:i:s'),
                'left_at' => $a->left_at?->format('H:i:s'),
                'duration' => $a->formatted_duration,
                'connection_quality' => $a->connection_quality,
            ]);

        return response()->json([
            'success' => true,
            'attendance' => $attendance
        ]);
    }
}
