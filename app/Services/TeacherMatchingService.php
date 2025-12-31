<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TeacherMatchingService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY', ''));
    }

    /**
     * Match a user with teachers based on their preferences
     */
    public function match(array $preferences): array
    {
        // Get available teachers
        $teachers = $this->getAvailableTeachers($preferences);

        if ($teachers->isEmpty()) {
            return [
                'success' => false,
                'error' => 'No teachers available matching your criteria.',
                'recommendations' => [],
            ];
        }

        // Build the prompt
        $prompt = $this->buildPrompt($preferences, $teachers);

        // Call Gemini API
        try {
            $response = $this->callGeminiApi($prompt);
            $recommendations = $this->parseResponse($response, $teachers);

            return [
                'success' => true,
                'recommendations' => $recommendations,
            ];
        } catch (\Exception $e) {
            Log::error('Gemini API error: ' . $e->getMessage());
            
            // Fallback to simple scoring if API fails
            return $this->fallbackMatching($preferences, $teachers);
        }
    }

    /**
     * Get teachers matching the subject preference
     */
    protected function getAvailableTeachers(array $preferences): \Illuminate\Database\Eloquent\Collection
    {
        $query = Teacher::with(['user', 'subjects', 'reviews'])
            ->where('status', 'approved')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating');

        // Filter by subject if provided
        if (!empty($preferences['subject_id'])) {
            $query->whereHas('subjects', function ($q) use ($preferences) {
                $q->where('subjects.id', $preferences['subject_id']);
            });
        }

        return $query->limit(20)->get();
    }

    /**
     * Build the prompt for Gemini
     */
    protected function buildPrompt(array $preferences, $teachers): string
    {
        $teacherList = $teachers->map(function ($teacher, $index) {
            $subjects = $teacher->subjects->pluck('name')->join(', ');
            $rating = round($teacher->reviews_avg_rating ?? 0, 1);
            $reviews = $teacher->reviews_count ?? 0;
            
            return "Teacher " . ($index + 1) . " (ID: {$teacher->id}):
- Name: {$teacher->user->name}
- Subjects: {$subjects}
- Experience: {$teacher->experience_years} years
- Hourly Rate: \${$teacher->hourly_rate}
- Rating: {$rating}/5 ({$reviews} reviews)
- Bio: " . substr($teacher->bio ?? 'N/A', 0, 200);
        })->join("\n\n");

        $timeLabels = [
            'morning' => 'Morning (6AM - 12PM)',
            'afternoon' => 'Afternoon (12PM - 6PM)',
            'evening' => 'Evening (6PM - 10PM)',
            'flexible' => 'Flexible',
        ];

        $timePreference = $timeLabels[$preferences['time_preference']] ?? $preferences['time_preference'];

        return <<<PROMPT
You are a helpful assistant for IqraQuest, an online Quran learning platform.

A student is looking for a Quran teacher with these preferences:
- Name: {$preferences['name']}
- Preferred Subject: {$preferences['subject_name']}
- Preferred Learning Time: {$timePreference}

Here are the available teachers:

{$teacherList}

Please recommend the TOP 3 teachers that best match this student's needs. For each recommendation, provide:
1. Teacher ID
2. Match score (1-100)
3. A brief reason (2-3 sentences) explaining why this teacher is a good fit

Respond in this exact JSON format:
{
  "recommendations": [
    {"teacher_id": 1, "match_score": 95, "reason": "..."},
    {"teacher_id": 2, "match_score": 88, "reason": "..."},
    {"teacher_id": 3, "match_score": 82, "reason": "..."}
  ]
}

Only respond with the JSON, no other text.
PROMPT;
    }

    /**
     * Call the Gemini API
     */
    protected function callGeminiApi(string $prompt): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Gemini API key not configured');
        }

        $response = Http::timeout(30)->post($this->apiUrl . '?key=' . $this->apiKey, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 1024,
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('Gemini API request failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Parse Gemini's response
     */
    protected function parseResponse(array $response, $teachers): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        // Extract JSON from the response
        preg_match('/\{[\s\S]*\}/', $text, $matches);
        
        if (empty($matches[0])) {
            throw new \Exception('Could not parse Gemini response');
        }

        $data = json_decode($matches[0], true);
        
        if (!isset($data['recommendations'])) {
            throw new \Exception('Invalid response format');
        }

        // Enrich recommendations with teacher data
        return collect($data['recommendations'])->map(function ($rec) use ($teachers) {
            $teacher = $teachers->firstWhere('id', $rec['teacher_id']);
            
            if (!$teacher) {
                return null;
            }

            return [
                'teacher_id' => $teacher->id,
                'name' => $teacher->user->name,
                'avatar' => $teacher->user->avatar,
                'subjects' => $teacher->subjects->pluck('name')->toArray(),
                'experience_years' => $teacher->experience_years,
                'hourly_rate' => $teacher->hourly_rate,
                'rating' => round($teacher->reviews_avg_rating ?? 0, 1),
                'reviews_count' => $teacher->reviews_count ?? 0,
                'match_score' => $rec['match_score'],
                'reason' => $rec['reason'],
            ];
        })->filter()->values()->toArray();
    }

    /**
     * Fallback matching using simple scoring
     */
    protected function fallbackMatching(array $preferences, $teachers): array
    {
        $scored = $teachers->map(function ($teacher) use ($preferences) {
            $score = 50; // Base score

            // Subject match bonus
            if (!empty($preferences['subject_id'])) {
                $hasSubject = $teacher->subjects->contains('id', $preferences['subject_id']);
                if ($hasSubject) {
                    $score += 30;
                }
            }

            // Rating bonus (up to 15 points)
            $rating = $teacher->reviews_avg_rating ?? 0;
            $score += ($rating / 5) * 15;

            // Experience bonus (up to 5 points)
            $expYears = min($teacher->experience_years ?? 0, 10);
            $score += ($expYears / 10) * 5;

            return [
                'teacher_id' => $teacher->id,
                'name' => $teacher->user->name,
                'avatar' => $teacher->user->avatar,
                'subjects' => $teacher->subjects->pluck('name')->toArray(),
                'experience_years' => $teacher->experience_years,
                'hourly_rate' => $teacher->hourly_rate,
                'rating' => round($rating, 1),
                'reviews_count' => $teacher->reviews_count ?? 0,
                'match_score' => min(round($score), 100),
                'reason' => $this->generateFallbackReason($teacher, $preferences),
            ];
        });

        return [
            'success' => true,
            'recommendations' => $scored->sortByDesc('match_score')->take(3)->values()->toArray(),
        ];
    }

    /**
     * Generate a fallback reason for matching
     */
    protected function generateFallbackReason(Teacher $teacher, array $preferences): string
    {
        $name = $teacher->user->name;
        $subjects = $teacher->subjects->pluck('name')->join(', ');
        $exp = $teacher->experience_years ?? 0;

        return "{$name} teaches {$subjects} and has {$exp} years of experience. " .
               "They are highly rated by students and available for your preferred time slot.";
    }
}
