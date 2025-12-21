<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use App\Models\Student;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    /**
     * Get available subjects for selection
     */
    public function getSubjects()
    {
        return response()->json(Subject::active()->ordered()->get(['id', 'name', 'icon']));
    }

    /**
     * Complete guardian onboarding by registering children and updating profile
     */
    public function complete(Request $request)
    {
        $request->validate([
            // Guardian Info
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:50',
            'bio' => 'nullable|string|max:1000',

            // Children Info
            'children' => 'required|array|min:1',
            'children.*.name' => 'required|string|max:255',
            'children.*.email' => 'required|email|unique:users,email',
            'children.*.password' => 'required|string|min:8',
            'children.*.age' => 'required|numeric|min:1|max:100',
            'children.*.gender' => 'required|in:male,female,other',
            'children.*.subjects' => 'required|array|min:1',
            'children.*.subjects.*' => 'exists:subjects,id',
            'children.*.learning_times' => 'required|array|min:1',
        ]);

        $guardianUser = auth()->user();
        $guardian = $guardianUser->guardian()->firstOrCreate(['user_id' => $guardianUser->id]);

        try {
            DB::beginTransaction();

            // 1. Update Guardian User Profile
            $guardianUser->update([
                'phone' => $request->phone,
            ]);

            // 2. Update Guardian Details
            $guardian->update([
                'city' => $request->city,
                'country' => $request->country,
                'timezone' => $request->timezone,
                'bio' => $request->bio,
            ]);

            // 3. Register Children
            foreach ($request->children as $childData) {
                // Create account for the child
                $childUser = User::create([
                    'name' => $childData['name'],
                    'email' => $childData['email'],
                    'password' => Hash::make($childData['password']),
                    'role' => UserRole::STUDENT,
                    'email_verified_at' => now(), // Assume verified since added by guardian
                ]);

                // Calculate approximate DOB from age
                $dob = now()->subYears($childData['age'])->format('Y-m-d');

                // Create Student profile
                $student = Student::create([
                    'user_id' => $childUser->id,
                    'gender' => $childData['gender'],
                    'date_of_birth' => $dob,
                    'preferred_days' => $childData['learning_times'],
                ]);

                // Attach subjects
                $student->subjects()->sync($childData['subjects']);

                // Link to Guardian
                $guardian->students()->attach($student->id, [
                    'relationship' => 'parent',
                    'is_primary' => true,
                ]);

                // Notify Child
                $childUser->notify(new \App\Notifications\WelcomeStudentNotification());
            }

            // Mark guardian onboarding as complete
            $guardianUser->update([
                'onboarding_completed_at' => now()
            ]);

            // Notify Guardian
            $guardianUser->notify(new \App\Notifications\WelcomeGuardianNotification());

            DB::commit();

            return back()->with('success', 'Registration successful! Your profile and children have been registered.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to save onboarding data: ' . $e->getMessage());
        }
    }

    /**
     * Skip onboarding
     */
    public function skip()
    {
        auth()->user()->update([
            'onboarding_skipped' => true
        ]);

        return back()->with('info', 'Onboarding skipped for now.');
    }
}
