<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\ClassroomPoll;
use App\Models\ClassroomPollResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassroomPollController extends Controller
{
    /**
     * Get active poll for a booking
     */
    public function getActive(Booking $booking)
    {
        $poll = ClassroomPoll::where('booking_id', $booking->id)
            ->where('is_active', true)
            ->latest()
            ->first();

        if (!$poll) {
            return response()->json(['poll' => null]);
        }

        $user = Auth::user();
        $userResponse = $poll->responses()->where('user_id', $user->id)->first();

        return response()->json([
            'poll' => [
                'id' => $poll->id,
                'question' => $poll->question,
                'options' => $poll->options,
                'type' => $poll->type,
                'show_results' => $poll->show_results,
                'results' => $poll->show_results ? $poll->results : null,
                'total_responses' => $poll->responses()->count(),
                'user_response' => $userResponse?->selected_option,
            ]
        ]);
    }

    /**
     * Create a new poll (teacher only)
     */
    public function store(Request $request, Booking $booking)
    {
        $user = Auth::user();
        
        // Verify teacher
        $isTeacher = $user->teacher && $user->teacher->id === $booking->teacher_id;
        if (!$isTeacher && !$user->isAdmin()) {
            abort(403, 'Only teachers can create polls');
        }

        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'options' => 'required|array|min:2|max:6',
            'options.*' => 'required|string|max:200',
            'type' => 'required|in:poll,quiz',
            'correct_option' => 'required_if:type,quiz|nullable|integer|min:0',
        ]);

        // End any existing active polls
        ClassroomPoll::where('booking_id', $booking->id)
            ->where('is_active', true)
            ->update(['is_active' => false, 'ended_at' => now()]);

        $poll = ClassroomPoll::create([
            'booking_id' => $booking->id,
            'created_by' => $user->id,
            'question' => $validated['question'],
            'options' => $validated['options'],
            'type' => $validated['type'],
            'correct_option' => $validated['correct_option'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'poll' => [
                'id' => $poll->id,
                'question' => $poll->question,
                'options' => $poll->options,
                'type' => $poll->type,
            ]
        ]);
    }

    /**
     * Submit a response to a poll
     */
    public function respond(Request $request, ClassroomPoll $poll)
    {
        $user = Auth::user();

        if (!$poll->is_active) {
            return response()->json(['error' => 'Poll is no longer active'], 400);
        }

        $validated = $request->validate([
            'selected_option' => 'required|integer|min:0',
        ]);

        // Check if option is valid
        if ($validated['selected_option'] >= count($poll->options)) {
            return response()->json(['error' => 'Invalid option'], 400);
        }

        // Create or update response
        $response = ClassroomPollResponse::updateOrCreate(
            ['poll_id' => $poll->id, 'user_id' => $user->id],
            ['selected_option' => $validated['selected_option']]
        );

        // Get updated results
        $poll->refresh();
        
        return response()->json([
            'success' => true,
            'is_correct' => $poll->type === 'quiz' && $poll->correct_option === $validated['selected_option'],
            'total_responses' => $poll->responses()->count(),
            'results' => $poll->results,
        ]);
    }

    /**
     * End a poll and show results (teacher only)
     */
    public function end(ClassroomPoll $poll)
    {
        $user = Auth::user();
        $booking = $poll->booking;
        
        $isTeacher = $user->teacher && $user->teacher->id === $booking->teacher_id;
        if (!$isTeacher && !$user->isAdmin()) {
            abort(403, 'Only teachers can end polls');
        }

        $poll->end();

        return response()->json([
            'success' => true,
            'results' => $poll->results,
        ]);
    }

    /**
     * Toggle results visibility
     */
    public function toggleResults(ClassroomPoll $poll)
    {
        $user = Auth::user();
        $booking = $poll->booking;
        
        $isTeacher = $user->teacher && $user->teacher->id === $booking->teacher_id;
        if (!$isTeacher && !$user->isAdmin()) {
            abort(403, 'Only teachers can toggle results');
        }

        $poll->update(['show_results' => !$poll->show_results]);

        return response()->json([
            'success' => true,
            'show_results' => $poll->show_results,
            'results' => $poll->show_results ? $poll->results : null,
        ]);
    }
}
