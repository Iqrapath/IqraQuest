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
        $scheduledAt = \Carbon\Carbon::parse($teacher->video_verification_scheduled_at)->utc();
        $now = now()->utc();
        $earlyJoinMinutes = 15;  // Can join 15 minutes early
        $lateJoinMinutes = 60;   // Can still join up to 60 minutes late

        if ($now->lt($scheduledAt->copy()->subMinutes($earlyJoinMinutes))) {
            $canJoinAt = $scheduledAt->copy()->subMinutes($earlyJoinMinutes)->setTimezone(request()->user()?->timezone ?? config('app.display_timezone'))->format('h:i A');
            $scheduledTime = $scheduledAt->setTimezone(request()->user()?->timezone ?? config('app.display_timezone'))->format('h:i A');
            $message = "The room opens 15 minutes early at {$canJoinAt} (Scheduled: {$scheduledTime}). Please come back then.";



            if (!$isAdmin) {
                return redirect()->route('teacher.waiting-area')->with('error', $message);
            }

            return redirect()->back()->with('error', $message);
        }

        if ($now->gt($scheduledAt->copy()->addMinutes($lateJoinMinutes))) {
            return redirect()->back()->with('error', 'The scheduled verification time has passed. Please contact support to reschedule.');
        }




        // 4. Handle Platform Specific Logic
        $platform = $teacher->video_verification_platform ?? 'LiveKit';
        $token = null;
        $roomName = "verification-" . $teacher->video_verification_room_id;

        if ($platform === 'Zoom') {
            // No token needed for external Zoom
        } else {
            // Generate LiveKit Token
            $participantIdentity = "user-" . $user->id;
            $participantName = $user->name;

            $token = $this->liveKitService->generateToken(
                $roomName,
                $participantIdentity,
                $participantName,
                $isAdmin && !$isOwnProfile
            );
        }

        return Inertia::render('Admin/Verifications/Room', [
            'teacher' => $teacher->load('user'),
            'token' => $token,
            'roomName' => $roomName,
            'isAdmin' => $isAdmin,
            'platform' => $platform,
            'zoomUrl' => ($platform === 'Zoom') ? $teacher->video_verification_url : null,
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
