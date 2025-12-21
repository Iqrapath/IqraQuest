<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the guardian's profile settings page.
     */
    public function index()
    {
        $user = Auth::user()->load('guardian.subjects');
        $guardian = $user->guardian;
        
        $subjects = Subject::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Guardian/Profile/Index', [
            'auth' => [
                'user' => $user,
            ],
            'guardian' => $guardian,
            'subjects' => $subjects,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Update the guardian's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $guardian = $user->guardian;

        if (!$guardian) {
            // Should exist via onboarding, but fallback if needed
             $user->guardian()->create(['user_id' => $user->id]);
             $guardian = $user->guardian;
        }

        $validated = $request->validate([
            // Profile Picture & Bio Section
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'city' => 'sometimes|nullable|string|max:100',
            'country' => 'sometimes|nullable|string|max:100',
            
            // About Me
            'bio' => 'sometimes|nullable|string|max:1000',

            // Student/Guardian Details (Schedule etc)
            'preferred_days' => 'sometimes|nullable|array',
            'preferred_hours' => 'sometimes|nullable|string|max:255',
            'availability_type' => 'sometimes|nullable|string|max:255',
            'timezone' => 'sometimes|nullable|string|max:50',

            // Learning Preferences
            'subjects' => 'sometimes|nullable|array',
            'subjects.*' => 'exists:subjects,id',
            'learning_goal_description' => 'sometimes|nullable|string|max:500',
        ]);

        // Update User table fields (Partial Update)
        $user->fill($request->only(['name', 'phone']));
        if ($user->isDirty()) {
            $user->save();
        }

        // Update Guardian table fields (Partial Update)
        // We filter out user fields and 'subjects' which is handled separately
        $guardianData = array_diff_key($validated, array_flip(['name', 'phone', 'subjects']));
        
        $guardian->fill($guardianData);
        if ($guardian->isDirty()) {
            $guardian->save();
        }

        // Sync Subjects
        if (isset($validated['subjects'])) {
            $guardian->subjects()->sync($validated['subjects']);
        }

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update the profile picture.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB Max
        ]);

        $user = Auth::user();
        
        if ($request->hasFile('avatar')) {
             $path = $request->file('avatar')->store('avatars', 'public');
             $user->update(['avatar' => $path]);
        }

        return back()->with('success', 'Profile picture updated.');
    }
}
