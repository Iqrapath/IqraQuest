<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Display the teacher's profile.
     */
    public function index()
    {
        $user = Auth::user();
        $teacher = $user->teacher()->with(['user', 'subjects', 'availability', 'certificates'])->firstOrFail();
        $allSubjects = Subject::all(['id', 'name']);

        return Inertia::render('Teacher/Profile/Index', [
            'teacher' => $teacher,
            'subjects' => $allSubjects,
            'flash' => session()->all(),
        ]);
    }

    /**
     * Update the teacher's profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        $validated = $request->validate([
            // User fields
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            
            // Teacher fields
            'bio' => 'sometimes|nullable|string',
            'intro_video_url' => 'sometimes|nullable|url',
            'city' => 'sometimes|nullable|string|max:100',
            'country' => 'sometimes|nullable|string|max:100',
            'experience_years' => 'sometimes|nullable|integer|min:0',
            'timezone' => 'sometimes|nullable|string|max:50',
            'teaching_mode' => 'sometimes|nullable|in:full-time,part-time,both',
            
            // Relationships
            'subjects' => 'sometimes|array',
            'subjects.*' => 'exists:subjects,id',
            
            'availability' => 'sometimes|array',
            'availability.*.day_of_week' => 'required_with:availability|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'availability.*.is_available' => 'required_with:availability|boolean',
            'availability.*.start_time' => 'required_with:availability|nullable|date_format:H:i',
            'availability.*.end_time' => 'required_with:availability|nullable|date_format:H:i',
        ]);

        DB::transaction(function () use ($user, $teacher, $validated, $request) {
            // Update User
            if ($request->has('name') || $request->has('phone')) {
                $user->fill($request->only(['name', 'phone']));
                $user->save();
            }

            // Update Teacher
            $teacher->fill($request->only([
                'bio', 'intro_video_url', 'city', 'country', 
                'experience_years', 'timezone', 'teaching_mode'
            ]));
            $teacher->save();

            // Sync Subjects
            if ($request->has('subjects')) {
                $teacher->subjects()->sync($validated['subjects']);
            }

            // Sync Availability
            if ($request->has('availability')) {
                // Delete existing availability
                $teacher->availability()->delete();
                // Create new entries
                $teacher->availability()->createMany($validated['availability']);
            }
        });

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:1024',
        ]);

        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return back()->with('success', 'Avatar updated successfully.');
    }

    /**
     * Upload introduction video
     */
    public function uploadVideo(Request $request) 
    {
        $request->validate([
            'video' => 'required|mimetypes:video/mp4,video/quicktime,video/x-msvideo|max:5242880', // 5GB max to match UI
        ]);

        $user = Auth::user();
        $teacher = $user->teacher;

        // In a real app, delete old video if stored locally
        // For now assuming simple update
        
        $path = $request->file('video')->store('teacher_videos', 'public');
        $url = Storage::url($path);
        
        $teacher->update(['intro_video_url' => $url]);

        return back()->with('success', 'Video uploaded successfully.');
    }
}
