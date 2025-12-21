<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Notifications\WelcomeStudentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OnboardingController extends Controller
{
    /**
     * Get active subjects for onboarding selection.
     */
    public function getSubjects()
    {
        return response()->json(
            Subject::where('is_active', true)
                ->orderBy('display_order')
                ->get(['id', 'name', 'description', 'icon'])
        );
    }

    /**
     * Complete the student onboarding process.
     */
    public function complete(Request $request)
    {
        $request->validate([
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
            'learning_goal_description' => 'nullable|string',
            'availability_type' => 'nullable|string|in:flexible,fixed,both',
            'subjects' => 'nullable|array',
            'subjects.*' => 'exists:subjects,id',
        ]);

        $user = auth()->user();
        
        DB::transaction(function () use ($user, $request) {
            // Update or create student profile
            $student = $user->student()->updateOrCreate(
                ['user_id' => $user->id],
                $request->only([
                    'gender',
                    'date_of_birth',
                    'city',
                    'country',
                    'timezone',
                    'learning_goal_description',
                    'availability_type'
                ])
            );

            // Sync subjects
            if ($request->has('subjects')) {
                $student->subjects()->sync($request->subjects);
            }

            // Mark onboarding as completed
            $user->update([
                'onboarding_completed_at' => now(),
                'onboarding_skipped' => false
            ]);

            // Notify user
            $user->notify(new WelcomeStudentNotification());
        });

        return back()->with('success', 'Onboarding completed successfully.');
    }

    /**
     * Skip the onboarding process.
     */
    public function skip()
    {
        auth()->user()->update(['onboarding_skipped' => true]);
        return back()->with('info', 'Onboarding skipped for now.');
    }
}
