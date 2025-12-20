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

        // 1. Policy Check: Is the user a participant?
        $isTeacher = $booking->teacher_id === $user->id; // Assuming user->id maps to teacher via some relation or direct check
        // Correct logic: teacher_id refers to Teacher model, but auth is User.
        // We need to resolve User -> Teacher/Student identity.
        // For MVP, if Auth ID matches booking->student_id (User) or booking->teacher->user_id?
        // Let's assume standard IqraQuest relation:
        // Student = User.
        // Teacher = User (or User hasOne Teacher).
        
        // Let's verify relation.
        // Student is a User (booking->student_id might be User ID or Student Profile ID).
        // Let's check Booking model to be sure.
        
        // Assuming strict checks for now. 
        // Admin override:
        $isAdmin = $user->isAdmin(); 

        $isStudent = $booking->user_id === $user->id; 
        
        // Check Teacher relation
        // We need to check if $user->teacher->id === $booking->teacher_id
        $isTeacherParticipant = false;
        if ($user->teacher && $user->teacher->id === $booking->teacher_id) {
            $isTeacherParticipant = true;
        }

        if (!$isStudent && !$isTeacherParticipant && !$isAdmin) {
            abort(403, 'You are not a participant of this class.');
        }

        // 2. Status Check
        if ($booking->status !== 'confirmed') {
            abort(403, 'This class is not confirmed.');
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
            'isTeacher' => $isTeacherParticipant,
            'isAdmin' => $isAdmin,
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
        
        // Determine role
        $isTeacher = $user->teacher && $user->teacher->id === $booking->teacher_id;
        $role = $isTeacher ? 'teacher' : 'student';

        // Check if there's an existing open attendance record (no left_at)
        $existingAttendance = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('user_id', $user->id)
            ->whereNull('left_at')
            ->first();

        if ($existingAttendance) {
            // Return existing record
            return response()->json([
                'success' => true,
                'attendance_id' => $existingAttendance->id,
                'message' => 'Existing attendance record found'
            ]);
        }

        // Create new attendance record
        $attendance = ClassroomAttendance::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'role' => $role,
            'joined_at' => now(),
            'metadata' => [
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ]
        ]);

        return response()->json([
            'success' => true,
            'attendance_id' => $attendance->id,
            'message' => 'Attendance recorded'
        ]);
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
        $attendance->recordLeave();

        // Optionally update connection quality from request
        if ($request->has('connection_quality')) {
            $attendance->update(['connection_quality' => $request->connection_quality]);
        }

        return response()->json([
            'success' => true,
            'duration' => $attendance->formatted_duration,
            'message' => 'Leave recorded'
        ]);
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
