<?php

namespace App\Actions\Fortify;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $emailRules = [
            'required',
            'string',
            'max:255',
            Rule::unique(User::class),
        ];
        $emailRules[] = (app()->runningUnitTests() || app()->environment('local')) ? 'email:rfc' : 'email:rfc,dns';

        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => $emailRules,
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        // Auto-verify email if admin has disabled email verification requirement
        if (! SystemSetting::get('email_verification_on_signup', true)) {
            $user->email_verified_at = now();
            $user->save();
        }

        return $user;
    }
}
