<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Services\LiveKitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VerificationRoomController extends Controller
{
    protected LiveKitService $liveKitService;

    public function __construct(LiveKitService $liveKitService)
    {
        $this->liveKitService = $liveKitService;
    }

    /**
     * Join the verification room
     */
    public function join(Request $request, Teacher $teacher)
    {
        $user = Auth::user();

        // 1. Authorization Check
        // Only Admins or the Teacher himself can join
        $isAdmin = $user->isAdmin();
        $isOwnProfile = $user->id === $teacher->user_id;

        if (!$isAdmin && !$isOwnProfile) {
            abort(403, 'Unauthorized access to verification room.');
        }

        // 2. Scheduled Check
        if ($teacher->video_verification_status !== 'scheduled' || !$teacher->video_verification_room_id) {
            return redirect()->back()->with('error', 'No verification call is currently scheduled.');
        }

        // 3. Time Window Check - Allow joining 15 minutes before to 1 hour after scheduled time
        $scheduledAt = \Carbon\Carbon::parse($teacher->video_verification_scheduled_at);
        $now = now();
        $earlyJoinMinutes = 15;  // Can join 15 minutes early
        $lateJoinMinutes = 60;   // Can still join up to 60 minutes late

        if ($now->lt($scheduledAt->copy()->subMinutes($earlyJoinMinutes))) {
            $canJoinAt = $scheduledAt->copy()->subMinutes($earlyJoinMinutes)->format('M d, Y \a\t h:i A');
            return redirect()->back()->with('error', "The room will be available at {$canJoinAt}. Please come back closer to the scheduled time.");
        }

        if ($now->gt($scheduledAt->copy()->addMinutes($lateJoinMinutes))) {
            return redirect()->back()->with('error', 'The scheduled verification time has passed. Please contact support to reschedule.');
        }

        // 4. Generate Token
        $roomName = "verification-" . $teacher->video_verification_room_id;
        $participantIdentity = "user-" . $user->id;
        $participantName = $user->name;

        $token = $this->liveKitService->generateToken(
            $roomName,
            $participantIdentity,
            $participantName,
            $isAdmin && !$isOwnProfile // Admins join as "ghosts" or staff
        );

        return Inertia::render('Admin/Verifications/Room', [
            'teacher' => $teacher->load('user'),
            'token' => $token,
            'roomName' => $roomName,
            'isAdmin' => $isAdmin,
            'liveKitUrl' => config('services.livekit.url'),
        ]);
    }

    /**
     * Complete the verification call (Admin only)
     */
    public function complete(Request $request, Teacher $teacher)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $teacher->update([
            'video_verification_status' => 'completed',
            'video_verification_notes' => $request->notes,
        ]);

        return redirect()->route('admin.verifications.show', $teacher->id)->with('success', 'Verification call marked as completed.');
    }
}
