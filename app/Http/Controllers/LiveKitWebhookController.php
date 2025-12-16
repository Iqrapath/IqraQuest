<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\EscrowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LiveKitWebhookController extends Controller
{
    protected EscrowService $escrowService;

    public function __construct(EscrowService $escrowService)
    {
        $this->escrowService = $escrowService;
    }

    /**
     * Handle LiveKit webhook events
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        $event = $payload['event'] ?? null;

        Log::info('LiveKit Webhook received', ['event' => $event, 'payload' => $payload]);

        switch ($event) {
            case 'room_started':
                return $this->handleRoomStarted($payload);
            
            case 'room_finished':
                return $this->handleRoomFinished($payload);
            
            case 'participant_joined':
                return $this->handleParticipantJoined($payload);
            
            case 'participant_left':
                return $this->handleParticipantLeft($payload);
            
            default:
                Log::info("LiveKit: Unhandled event type: {$event}");
                return response()->json(['status' => 'ignored']);
        }
    }

    /**
     * Handle room started event
     */
    protected function handleRoomStarted(array $payload): \Illuminate\Http\JsonResponse
    {
        $roomName = $payload['room']['name'] ?? null;
        $booking = $this->getBookingFromRoom($roomName);

        if (!$booking) {
            return response()->json(['status' => 'booking_not_found']);
        }

        $booking->markSessionStarted();

        Log::info("LiveKit: Room started for booking #{$booking->id}");

        return response()->json(['status' => 'ok']);
    }

    /**
     * Handle room finished event - triggers escrow processing
     */
    protected function handleRoomFinished(array $payload): \Illuminate\Http\JsonResponse
    {
        $roomName = $payload['room']['name'] ?? null;
        $booking = $this->getBookingFromRoom($roomName);

        if (!$booking) {
            return response()->json(['status' => 'booking_not_found']);
        }

        // Mark session as ended
        $booking->markSessionEnded();

        // Process escrow based on attendance
        $this->escrowService->handleSessionCompletion($booking);

        Log::info("LiveKit: Room finished for booking #{$booking->id}, escrow processed");

        return response()->json(['status' => 'ok']);
    }

    /**
     * Handle participant joined event
     */
    protected function handleParticipantJoined(array $payload): \Illuminate\Http\JsonResponse
    {
        $roomName = $payload['room']['name'] ?? null;
        $participantIdentity = $payload['participant']['identity'] ?? null;

        $booking = $this->getBookingFromRoom($roomName);
        if (!$booking) {
            return response()->json(['status' => 'booking_not_found']);
        }

        // Extract user ID from identity (format: "user-123")
        $userId = $this->extractUserId($participantIdentity);
        if (!$userId) {
            return response()->json(['status' => 'invalid_identity']);
        }

        // Determine if teacher or student and record attendance
        if ($booking->teacher && $booking->teacher->user_id === $userId) {
            $booking->recordTeacherAttendance();
            Log::info("LiveKit: Teacher joined booking #{$booking->id}");
        } elseif ($booking->user_id === $userId) {
            $booking->recordStudentAttendance();
            Log::info("LiveKit: Student joined booking #{$booking->id}");
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Handle participant left event
     */
    protected function handleParticipantLeft(array $payload): \Illuminate\Http\JsonResponse
    {
        $roomName = $payload['room']['name'] ?? null;
        $participantIdentity = $payload['participant']['identity'] ?? null;

        Log::info("LiveKit: Participant {$participantIdentity} left room {$roomName}");

        return response()->json(['status' => 'ok']);
    }

    /**
     * Extract booking from room name (format: "booking-123")
     */
    protected function getBookingFromRoom(?string $roomName): ?Booking
    {
        if (!$roomName || !str_starts_with($roomName, 'booking-')) {
            return null;
        }

        $bookingId = (int) str_replace('booking-', '', $roomName);
        return Booking::find($bookingId);
    }

    /**
     * Extract user ID from participant identity (format: "user-123")
     */
    protected function extractUserId(?string $identity): ?int
    {
        if (!$identity || !str_starts_with($identity, 'user-')) {
            return null;
        }

        return (int) str_replace('user-', '', $identity);
    }
}
