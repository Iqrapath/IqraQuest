<?php

namespace App\Actions\Fortify;

use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        return [
            'required',
            'string',
            Password::min(config('security.password.min_length', 12))
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(config('security.password.compromised_threshold', 0)),
            'confirmed',
        ];
    }
}
