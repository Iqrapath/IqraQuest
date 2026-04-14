<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZoomWebhookController extends Controller
{
    /**
     * Handle incoming Zoom webhook events.
     *
     * Zoom will POST events here when meetings start, end, etc.
     */
    public function handle(Request $request)
    {
        // 1. Verify webhook signature at the absolute top
        // Exception: endpoint.url_validation doesn't always have a signature in the same way,
        // but we handle it separately.
        $payload = $request->all();
        $event = $payload['event'] ?? null;

        // Handle URL validation challenge (MUST happen before general signature check or logging)
        if ($event === 'endpoint.url_validation') {
            $plainToken = $payload['payload']['plainToken'] ?? null;
            $secretToken = config('services.zoom.webhook_secret_token');

            if ($plainToken && $secretToken) {
                $encryptedToken = hash_hmac('sha256', $plainToken, $secretToken);
                return response()->json([
                    'plainToken' => $plainToken,
                    'encryptedToken' => $encryptedToken,
                ]);
            }

            return response()->json(['error' => 'Invalid validation request'], 400);
        }

        // 2. Regular event signature verification
        if (!$this->verifySignature($request)) {
            // Avoid logging here to prevent Permission Denied crashes
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // 3. Log verified payload
        Log::channel('daily')->info('Zoom Webhook Verified', [
            'event' => $event,
            'payload' => $payload,
        ]);

        // Handle meeting events
        switch ($event) {
            case 'meeting.started':
                $this->handleMeetingStarted($payload);
                break;

            case 'meeting.ended':
                $this->handleMeetingEnded($payload);
                break;

            case 'meeting.participant_joined':
                $this->handleParticipantJoined($payload);
                break;

            case 'meeting.participant_left':
                $this->handleParticipantLeft($payload);
                break;

            default:
                Log::channel('daily')->info('Zoom Webhook: Unhandled event', ['event' => $event]);
        }

        return response()->json(['status' => 'received']);
    }

    /**
     * Verify the webhook signature from Zoom.
     */
    protected function verifySignature(Request $request): bool
    {
        $secretToken = config('services.zoom.webhook_secret_token');

        if (empty($secretToken)) {
            // If no secret is configured, skip verification (not recommended for production)
            return false;
        }

        $signature = $request->header('x-zm-signature');
        $timestamp = $request->header('x-zm-request-timestamp');
        $body = $request->getContent();

        if (!$signature || !$timestamp) {
            return false;
        }

        $message = "v0:{$timestamp}:{$body}";
        $hash = hash_hmac('sha256', $message, $secretToken);
        $expectedSignature = "v0={$hash}";

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Handle meeting.started event.
     */
    protected function handleMeetingStarted(array $payload): void
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;

        if (!$meetingId) {
            return;
        }

        $teacher = Teacher::where('video_verification_room_id', $meetingId)->first();

        if ($teacher) {
            Log::channel('daily')->info('Zoom: Meeting started for teacher', [
                'teacher_id' => $teacher->id,
                'meeting_id' => $meetingId,
            ]);

            // Optionally update status or notify the UI
            broadcast(new \App\Events\TeacherUpdated($teacher, 'The verification meeting has started.'));
        }
    }

    /**
     * Handle meeting.ended event - Mark verification as completed.
     */
    protected function handleMeetingEnded(array $payload): void
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;

        if (!$meetingId) {
            return;
        }

        $teacher = Teacher::where('video_verification_room_id', $meetingId)->first();

        if ($teacher && $teacher->video_verification_status === 'scheduled') {
            $teacher->update([
                'video_verification_status' => 'completed',
            ]);

            Log::channel('daily')->info('Zoom: Meeting ended, marking verification as completed', [
                'teacher_id' => $teacher->id,
                'meeting_id' => $meetingId,
            ]);

            // Notify the teacher via real-time update
            broadcast(new \App\Events\TeacherUpdated($teacher, 'Your verification call has been completed!'));

            // Optionally send a notification
            $teacher->user->notify(new \App\Notifications\VerificationCallCompletedNotification($teacher));
        }
    }

    /**
     * Handle meeting.participant_joined event.
     */
    protected function handleParticipantJoined(array $payload): void
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;
        $participantName = $payload['payload']['object']['participant']['user_name'] ?? 'Unknown';

        Log::channel('daily')->info('Zoom: Participant joined', [
            'meeting_id' => $meetingId,
            'participant' => $participantName,
        ]);
    }

    /**
     * Handle meeting.participant_left event.
     */
    protected function handleParticipantLeft(array $payload): void
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;
        $participantName = $payload['payload']['object']['participant']['user_name'] ?? 'Unknown';

        Log::channel('daily')->info('Zoom: Participant left', [
            'meeting_id' => $meetingId,
            'participant' => $participantName,
        ]);
    }
}
