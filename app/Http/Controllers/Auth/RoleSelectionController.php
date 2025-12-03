<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleSelectionRequest;
use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleSelectionController extends Controller
{
   /**
     * Show the role selection page
     */
    public function show(): Response
    {
        // Ensure user is authenticated and email is verified
        $user = auth()->user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        if (!$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }
        
        // If user already has a specific role and profile, redirect to their dashboard
        if (in_array($user->role, ['teacher', 'admin'])) {
            return redirect()->route($user->dashboardRoute());
        }
        
        // Check if student or guardian profile already exists
        if ($user->role === 'student' && $user->student) {
            return redirect()->route('student.dashboard');
        }
        
        if ($user->role === 'guardian' && $user->guardian) {
            return redirect()->route('guardian.dashboard');
        }
        
        return Inertia::render('auth/StudentGuardianRoleSelection');
    }

    /**
     * Handle role selection
     */
    public function store(RoleSelectionRequest $request): RedirectResponse
    {
        $user = auth()->user();
        $role = $request->validated()['role'];

        // Update user role
        $user->update(['role' => $role]);

        // Create appropriate profile
        if ($role === 'student') {
            Student::create([
                'user_id' => $user->id,
            ]);
            
            return redirect()->route('student.dashboard')
                ->with('success', 'Welcome! Your student profile has been created.');
        } else {
            Guardian::create([
                'user_id' => $user->id,
            ]);
            
            return redirect()->route('guardian.dashboard')
                ->with('success', 'Welcome! Your guardian profile has been created.');
        }
    }
}
