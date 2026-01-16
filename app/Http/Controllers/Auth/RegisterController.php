<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\RateLimiter;

class RegisterController extends Controller
{
    /**
     * Handle the incoming registration request.
     */
    public function store(Request $request, CreateNewUser $creator): RedirectResponse
    {
        // Rate limiting: 3 registrations per IP per hour
        $key = 'registration-attempts:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);
            return back()->withErrors([
                'email' => "Too many registration attempts. Please try again in {$minutes} minutes.",
            ]);
        }

        RateLimiter::hit($key, 3600);

        // Validate and create the user using the existing Fortify action
        $user = $creator->create($request->all());

        // Dispatch Registered event to trigger welcome email and verification
        event(new Registered($user));

        // Log the user in so they can access the OTP verification page
        auth()->login($user);

        // Store email in session for the OTP page display
        session()->put('verification_email', $user->email);

        // Do NOT log the user in (unlike default Fortify behavior)
        // This allows us to keep them on the registration page to show the success modal
        
        return back()->with('success', 'Registration successful! Please check your email to verify your account.');
    }
}
