<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class OnboardingStep2Request extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === UserRole::TEACHER;
    }

    public function rules(): array
    {
        return [
            'bio' => ['required', 'string', 'max:1000'],
            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*' => ['exists:subjects,id'],
            'qualification_level' => ['required', 'string', 'max:255'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'bio.required' => 'Please provide a brief bio about yourself.',
            'bio.max' => 'Bio must not exceed 1000 characters.',
            'subjects.required' => 'Please select at least one subject you can teach.',
            'subjects.min' => 'Please select at least one subject.',
            'subjects.*.exists' => 'One or more selected subjects are invalid.',
            'qualification_level.required' => 'Please select your highest qualification level.',
            'experience_years.required' => 'Please enter your years of teaching experience.',
            'experience_years.min' => 'Experience years cannot be negative.',
        ];
    }
}
