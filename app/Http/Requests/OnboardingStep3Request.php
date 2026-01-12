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
            $availability = $data['availability'] ?? [];
            
            // Group slots by day
            $slotsByDay = [];
            foreach ($availability as $slot) {
                $day = $slot['day'] ?? '';
                if (!isset($slotsByDay[$day])) {
                    $slotsByDay[$day] = [];
                }
                $slotsByDay[$day][] = $slot;
            }
            
            // Check max 5 slots per day
            foreach ($slotsByDay as $day => $slots) {
                if (count($slots) > 5) {
                    $validator->errors()->add('availability', "Maximum 5 time slots allowed per day. {$day} has " . count($slots) . " slots.");
                }
                
                // Check for overlapping times on same day
                for ($i = 0; $i < count($slots); $i++) {
                    for ($j = $i + 1; $j < count($slots); $j++) {
                        $start1 = strtotime($slots[$i]['start']);
                        $end1 = strtotime($slots[$i]['end']);
                        $start2 = strtotime($slots[$j]['start']);
                        $end2 = strtotime($slots[$j]['end']);
                        
                        // Check if times overlap
                        if ($start1 < $end2 && $start2 < $end1) {
                            $validator->errors()->add('availability', "Overlapping time slots on {$day}: {$slots[$i]['start']}-{$slots[$i]['end']} overlaps with {$slots[$j]['start']}-{$slots[$j]['end']}");
                        }
                    }
                }
                
                // Check max 1 hour duration per slot
                foreach ($slots as $slot) {
                    $start = strtotime($slot['start']);
                    $end = strtotime($slot['end']);
                    
                    // Handle overnight slots (e.g., 23:00 to 00:00)
                    if ($end <= $start) {
                        $end += 24 * 60 * 60; // Add 24 hours
                    }
                    
                    $durationMinutes = ($end - $start) / 60;
                    
                    if ($durationMinutes > 60) {
                        $validator->errors()->add('availability', "Time slot on {$day} ({$slot['start']}-{$slot['end']}) exceeds maximum 1 hour duration.");
                    }
                    
                    if ($durationMinutes <= 0) {
                        $validator->errors()->add('availability', "Time slot on {$day} has invalid duration. End time must be after start time.");
                    }
                }
            }
            
            // Part-time: max 3 unique days total
            if (
                isset($data['teaching_modes']) && 
                in_array('part-time', $data['teaching_modes']) && 
                count($slotsByDay) > 3
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
