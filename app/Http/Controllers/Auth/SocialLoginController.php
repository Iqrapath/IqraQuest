<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Guardian;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirect(Request $request, string $provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            abort(404);
        }

        // Build the state with role if provided
        $state = [];
        if ($request->has('role')) {
            $state['role'] = $request->role;
        }

        // Use stateless mode with additional state parameters
        return Socialite::driver($provider)
            ->stateless()
            ->with(['state' => base64_encode(json_encode($state))])
            ->redirect();
    }

    /**
     * Obtain the user information from the provider.
     */
    public function callback(Request $request, string $provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            abort(404);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            \Illuminate\Support\Facades\Log::info("Social login success for {$provider}. Email: " . $socialUser->getEmail());
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Social login failed for {$provider}", ['exception' => $e]);
            return redirect()->route('login')->with('error', 'Unable to login with ' . ucfirst($provider));
        }

        // Extract role from state if present
        $role = UserRole::STUDENT->value; // Default
        if ($request->has('state')) {
            $stateData = json_decode(base64_decode($request->state), true);
            if (isset($stateData['role'])) {
                $role = $stateData['role'];
            }
        }

        // Check if user exists by email or provider ID
        $user = User::where('email', $socialUser->getEmail())
            ->orWhere("{$provider}_id", $socialUser->getId())
            ->first();

        if ($user) {
            \Illuminate\Support\Facades\Log::info("User found. ID: {$user->id}");
            // Update provider ID if missing
            if (!$user->{"{$provider}_id"}) {
                $user->update(["{$provider}_id" => $socialUser->getId()]);
            }

            Auth::login($user);

            return redirect()->intended($user->dashboardRoute());
        }

        // Create new user
        \Illuminate\Support\Facades\Log::info("Creating new user with role: {$role}");

        // Validate role
        if (!in_array($role, [UserRole::TEACHER->value, UserRole::STUDENT->value, UserRole::GUARDIAN->value])) {
            $role = UserRole::STUDENT->value;
        }

        // Create user
        $user = User::create([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'password' => Hash::make(Str::random(16)), // Random password
            'role' => $role,
            "{$provider}_id" => $socialUser->getId(),
            'email_verified_at' => now(), // Trust social provider email verification
            'avatar' => $socialUser->getAvatar(),
        ]);

        // Create profile based on role
        if ($user->role === UserRole::TEACHER) {
            Teacher::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'onboarding_step' => 1,
            ]);
            $redirectRoute = 'teacher.onboarding.step1';
        } elseif ($user->role === UserRole::STUDENT) {
            // Don't create Student profile yet - let them choose in role selection
            $redirectRoute = 'select-role';
        } elseif ($user->role === UserRole::GUARDIAN) {
            Guardian::create(['user_id' => $user->id]);
            $redirectRoute = 'guardian.dashboard';
        } else {
            $redirectRoute = 'home';
        }

        \Illuminate\Support\Facades\Log::info("User created. Redirecting to: {$redirectRoute}");

        Auth::login($user);

        return redirect()->route($redirectRoute);
    }
}
