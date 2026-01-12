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
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Inertia\Inertia;

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

        // Build the state with role or context if provided
        $state = [];
        if ($request->has('role')) {
            $state['role'] = $request->role;
        }
        if ($request->has('context')) {
            $state['context'] = $request->context;
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

        // Extract role and context from state if present
        $role = null;
        $context = null;
        if ($request->has('state')) {
            $stateData = json_decode(base64_decode($request->state), true);
            if (isset($stateData['role'])) {
                $role = $stateData['role'];
            }
            if (isset($stateData['context'])) {
                $context = $stateData['context'];
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

            // If teacher hasn't completed onboarding, redirect to the correct step
            if ($user->isTeacher() && $user->teacher && $user->teacher->onboarding_step < 5) {
                $step = $user->teacher->onboarding_step;
                
                $routeName = match ($step) {
                    2 => 'teacher.onboarding.step2',
                    3 => 'teacher.onboarding.step3',
                    4 => 'teacher.onboarding.step4',
                    default => 'teacher.onboarding.step1',
                };

                return redirect()->route($routeName)
                    ->with('success', 'Welcome back! Please continue your onboarding.');
            }

            return redirect()->intended(route($user->dashboardRoute()));
        }

        // NEW USER - No role specified (came from login page)
        // Store social data in session and redirect to role selection
        if (!$role) {
            Session::put('social_registration', [
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'avatar' => $socialUser->getAvatar(),
                'context' => $context,
            ]);

            \Illuminate\Support\Facades\Log::info("New user without role. Redirecting to social role selection.");
            
            return redirect()->route('social.select-role');
        }

        // Role was specified (came from registration page) - create user directly
        return $this->createUserWithRole($socialUser, $provider, $role);
    }

    /**
     * Show the role selection page for social login users.
     */
    public function showRoleSelection()
    {
        $socialData = Session::get('social_registration');
        
        if (!$socialData) {
            return redirect()->route('login')->with('error', 'Session expired. Please try again.');
        }

        return Inertia::render('auth/SocialRoleSelection', [
            'name' => $socialData['name'],
            'email' => $socialData['email'],
            'avatar' => $socialData['avatar'],
            'context' => $socialData['context'] ?? null,
        ]);
    }

    /**
     * Handle role selection for social login users.
     */
    public function handleRoleSelection(Request $request)
    {
        $request->validate([
            'role' => 'required|in:student,guardian,teacher',
        ]);

        $socialData = Session::get('social_registration');
        
        if (!$socialData) {
            return redirect()->route('login')->with('error', 'Session expired. Please try again.');
        }

        // Create a mock social user object
        $socialUser = new \stdClass();
        $socialUser->name = $socialData['name'];
        $socialUser->email = $socialData['email'];
        $socialUser->id = $socialData['provider_id'];
        $socialUser->avatar = $socialData['avatar'];
        
        // Add methods to match Socialite user interface
        $socialUser->getName = fn() => $socialData['name'];
        $socialUser->getEmail = fn() => $socialData['email'];
        $socialUser->getId = fn() => $socialData['provider_id'];
        $socialUser->getAvatar = fn() => $socialData['avatar'];

        // Clear session data
        Session::forget('social_registration');

        return $this->createUserWithRole($socialUser, $socialData['provider'], $request->role);
    }

    /**
     * Create user with specified role.
     */
    protected function createUserWithRole($socialUser, string $provider, string $role)
    {
        \Illuminate\Support\Facades\Log::info("Creating new user with role: {$role}");

        // Validate role
        if (!in_array($role, [UserRole::TEACHER->value, UserRole::STUDENT->value, UserRole::GUARDIAN->value])) {
            $role = UserRole::STUDENT->value;
        }

        // Get values - handle both object and stdClass with closures
        $name = is_callable([$socialUser, 'getName']) ? $socialUser->getName() : ($socialUser->name ?? 'User');
        $email = is_callable([$socialUser, 'getEmail']) ? $socialUser->getEmail() : $socialUser->email;
        $providerId = is_callable([$socialUser, 'getId']) ? $socialUser->getId() : $socialUser->id;
        $avatar = is_callable([$socialUser, 'getAvatar']) ? $socialUser->getAvatar() : ($socialUser->avatar ?? null);

        // Download and store avatar locally if it's a URL
        if ($avatar && filter_var($avatar, FILTER_VALIDATE_URL)) {
            $uploadService = app(\App\Services\FileUploadService::class);
            $localAvatar = $uploadService->uploadFromUrl($avatar, 'avatars', $name, 'avatar');
            if ($localAvatar) {
                $avatar = $localAvatar;
            }
        }

        // Create user
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make(Str::random(16)),
            'role' => $role,
            "{$provider}_id" => $providerId,
            'email_verified_at' => now(),
            'avatar' => $avatar,
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
            Student::create([
                'user_id' => $user->id,
            ]);
            $redirectRoute = 'student.dashboard';
        } elseif ($user->role === UserRole::GUARDIAN) {
            Guardian::create(['user_id' => $user->id]);
            $redirectRoute = 'guardian.dashboard';
        } else {
            $redirectRoute = 'home';
        }

        \Illuminate\Support\Facades\Log::info("User created. Redirecting to: {$redirectRoute}");

        Auth::login($user);

        return redirect()->route($redirectRoute)->with('success', 'Welcome! Your account has been created.');
    }
}
