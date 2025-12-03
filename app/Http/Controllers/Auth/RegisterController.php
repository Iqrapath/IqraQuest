<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;

class RegisterController extends Controller
{
    /**
     * Handle the incoming registration request.
     */
    public function store(Request $request, CreateNewUser $creator): RedirectResponse
    {
        // Validate and create the user using the existing Fortify action
        $user = $creator->create($request->all());

        sleep(10);

        // Send email verification notification directly (like teacher registration)
        $user->sendEmailVerificationNotification();

        // Do NOT log the user in (unlike default Fortify behavior)
        // This allows us to keep them on the registration page to show the success modal
        
        return back()->with('success', 'Registration successful! Please check your email to verify your account.');
    }
}
