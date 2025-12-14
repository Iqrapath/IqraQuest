<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Support\Facades\DB;

class FilterController extends Controller
{
    /**
     * Get dynamic filter options for teachers
     */
    public function getOptions()
    {
        // Get time preferences from teacher availability
        $timePreferences = $this->getTimePreferences();
        
        // Get budget range from teacher hourly rates
        $budgetRange = $this->getBudgetRange();
        
        // Languages remain static for now
        $languages = [
            ['value' => 'english', 'label' => 'English'],
            ['value' => 'arabic', 'label' => 'Arabic'],
            ['value' => 'french', 'label' => 'French'],
            ['value' => 'urdu', 'label' => 'Urdu'],
        ];

        return response()->json([
            'time_preferences' => $timePreferences,
            'budget' => $budgetRange,
            'languages' => $languages,
        ]);
    }

    /**
     * Get available time preferences from teacher availability
     */
    private function getTimePreferences()
    {
        // Get all available time slots
        $availabilities = DB::table('teacher_availability')
            ->where('is_available', true)
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->select('start_time', 'end_time', 'teacher_id')
            ->distinct()
            ->get();

        // Categorize time slots
        $categories = [
            'morning' => 0,
            'afternoon' => 0,
            'evening' => 0,
        ];

        $teacherTimeSlots = [];

        foreach ($availabilities as $slot) {
            $startHour = (int) substr($slot->start_time, 0, 2);
            $teacherId = $slot->teacher_id;

            // Initialize teacher slot tracking
            if (!isset($teacherTimeSlots[$teacherId])) {
                $teacherTimeSlots[$teacherId] = [];
            }

            // Categorize based on start time
            if ($startHour >= 6 && $startHour < 12) {
                $categories['morning']++;
                $teacherTimeSlots[$teacherId][] = 'morning';
            } elseif ($startHour >= 12 && $startHour < 18) {
                $categories['afternoon']++;
                $teacherTimeSlots[$teacherId][] = 'afternoon';
            } elseif ($startHour >= 18 && $startHour < 23) {
                $categories['evening']++;
                $teacherTimeSlots[$teacherId][] = 'evening';
            }
        }

        // Build response array with only categories that have teachers
        $timePreferences = [];

        if ($categories['morning'] > 0) {
            $timePreferences[] = [
                'value' => 'morning',
                'label' => 'Morning (6AM - 12PM)',
                'teacher_count' => $categories['morning'],
            ];
        }

        if ($categories['afternoon'] > 0) {
            $timePreferences[] = [
                'value' => 'afternoon',
                'label' => 'Afternoon (12PM - 6PM)',
                'teacher_count' => $categories['afternoon'],
            ];
        }

        if ($categories['evening'] > 0) {
            $timePreferences[] = [
                'value' => 'evening',
                'label' => 'Evening (6PM - 10PM)',
                'teacher_count' => $categories['evening'],
            ];
        }

        // Add flexible option for teachers with multiple time slots
        $flexibleTeachers = collect($teacherTimeSlots)
            ->filter(fn($slots) => count(array_unique($slots)) > 1)
            ->count();

        if ($flexibleTeachers > 0) {
            $timePreferences[] = [
                'value' => 'flexible',
                'label' => 'Flexible',
                'teacher_count' => $flexibleTeachers,
            ];
        }

        return $timePreferences;
    }

    /**
     * Get budget range from teacher hourly rates
     */
    private function getBudgetRange()
    {
        $rates = Teacher::whereNotNull('hourly_rate')
            ->where('hourly_rate', '>', 0)
            ->selectRaw('MIN(hourly_rate) as min_rate, MAX(hourly_rate) as max_rate')
            ->first();

        return [
            'min' => $rates->min_rate ?? 0,
            'max' => $rates->max_rate ?? 20000,
            'currency' => 'NGN',
        ];
    }
}
