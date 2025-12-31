<?php

namespace App\Http\Controllers;

use App\Models\MatchRequest;
use App\Models\Subject;
use App\Services\TeacherMatchingService;
use App\Mail\TeacherRecommendationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MatchRequestController extends Controller
{
    protected TeacherMatchingService $matchingService;

    public function __construct(TeacherMatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    /**
     * Store a new match request and process it
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string',
            'time_preference' => 'required|in:morning,afternoon,evening,flexible',
        ]);

        // Get subject info
        $subjectId = null;
        $subjectName = $validated['subject'];
        
        // Check if subject is an ID or name
        if (is_numeric($validated['subject'])) {
            $subject = Subject::find($validated['subject']);
            if ($subject) {
                $subjectId = $subject->id;
                $subjectName = $subject->name;
            }
        } else {
            $subject = Subject::where('name', $validated['subject'])->first();
            if ($subject) {
                $subjectId = $subject->id;
                $subjectName = $subject->name;
            }
        }

        // Create the match request
        $matchRequest = MatchRequest::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject_id' => $subjectId,
            'subject_name' => $subjectName,
            'time_preference' => $validated['time_preference'],
            'status' => 'pending',
        ]);

        // Process the matching
        $matchRequest->markAsProcessing();

        try {
            $result = $this->matchingService->match([
                'name' => $validated['name'],
                'subject_id' => $subjectId,
                'subject_name' => $subjectName,
                'time_preference' => $validated['time_preference'],
            ]);

            if ($result['success'] && !empty($result['recommendations'])) {
                $matchRequest->markAsCompleted($result['recommendations']);

                // Send email with recommendations
                Mail::to($validated['email'])->send(
                    new TeacherRecommendationMail($matchRequest, $result['recommendations'])
                );

                $matchRequest->markAsEmailed();

                return response()->json([
                    'success' => true,
                    'message' => 'We\'ve found great teacher matches for you! Check your email for personalized recommendations.',
                ]);
            } else {
                $matchRequest->markAsFailed($result['error'] ?? 'No matching teachers found');
                
                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'We couldn\'t find matching teachers at this time. Please try again later.',
                ], 422);
            }
        } catch (\Exception $e) {
            Log::error('Match request processing failed: ' . $e->getMessage());
            $matchRequest->markAsFailed($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again later.',
            ], 500);
        }
    }
}
