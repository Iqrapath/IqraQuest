<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class OnboardingStep3Request extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === UserRole::TEACHER;
    }

    public function rules(): array
    {
        return [
            'timezone' => ['required', 'string', 'timezone'],
            'teaching_modes' => ['required', 'array', 'min:1'],
            'teaching_modes.*' => ['string', 'in:full-time,part-time'],
            'teaching_types' => ['required', 'array', 'min:1'],
            'teaching_types.*' => ['string', 'in:online,in-person'],
            'availability' => ['required', 'array', 'min:1'],
            'availability.*.day' => ['required', 'string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'availability.*.start' => ['required', 'date_format:H:i'],
            'availability.*.end' => ['required', 'date_format:H:i', 'after:availability.*.start'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $data = $validator->getData();
            if (
                isset($data['teaching_modes']) && 
                in_array('part-time', $data['teaching_modes']) && 
                isset($data['availability']) && 
                count($data['availability']) > 3
            ) {
                $validator->errors()->add('availability', 'Part-time teachers are limited to 3 days of availability.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'timezone.required' => 'Please select your timezone.',
            'teaching_modes.required' => 'Please select at least one teaching mode.',
            'availability.required' => 'Please set your availability for at least one day.',
            'availability.*.start.required' => 'Please set a start time.',
            'availability.*.end.required' => 'Please set an end time.',
            'availability.*.end.after' => 'End time must be after start time.',
        ];
    }
}
