<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleSelectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ensure user is authenticated
        if (!auth()->check()) {
            return false;
        }

        // Ensure user has verified their email
        if (!auth()->user()->hasVerifiedEmail()) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:student,guardian'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => 'Please select a role.',
            'role.in' => 'Invalid role selected. Please choose either Student or Guardian.',
        ];
    }
}
