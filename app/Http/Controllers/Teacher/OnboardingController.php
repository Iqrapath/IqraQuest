<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\OnboardingStep1Request;
use App\Http\Requests\OnboardingStep2Request;
use App\Http\Requests\OnboardingStep3Request;
use App\Http\Requests\OnboardingStep4Request;
use App\Models\Subject;
use App\Services\TeacherRegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private TeacherRegistrationService $registrationService
    ) {}

    /**
     * Show onboarding step 1: Personal Information
     */
    public function step1(): Response
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        Log::info('Teacher Onboarding Step 1: Rendering page', [
            'user_id' => $user->id,
            'teacher_id' => $teacher?->id,
            'teacher_status' => $teacher?->status,
            'onboarding_step' => $teacher?->onboarding_step,
        ]);

        return Inertia::render('Teacher/Onboarding/Step1', [
            'teacher' => $teacher,
        ]);
    }

    /**
     * Store onboarding step 1
     */
    public function storeStep1(OnboardingStep1Request $request): RedirectResponse
    {
        $user = auth()->user();
        $teacher = $user->teacher;
        
        DB::transaction(function () use ($user, $teacher, $request) {
            // Update User details
            if ($request->hasFile('avatar')) {
                $user->avatar = $request->file('avatar');
            }
            
            $user->phone = $request->phone;
            $user->save();

            // Update Teacher details
            $teacher->update($request->only(['country', 'city', 'preferred_language']));
        });

        return redirect()
            ->route('teacher.onboarding.step2')
            ->with('success', 'Personal information saved!');
    }

    /**
     * Show onboarding step 2: Teaching Details
     */
    public function step2(): Response
    {
        $teacher = auth()->user()->teacher;
        $subjects = Subject::all();

        return Inertia::render('Teacher/Onboarding/Step2', [
            'teacher' => $teacher->load('subjects'),
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store onboarding step 2
     */
    public function storeStep2(OnboardingStep2Request $request): RedirectResponse
    {
        $teacher = auth()->user()->teacher;
        
        DB::transaction(function () use ($teacher, $request) {
            $teacher->update($request->except('subjects'));
            
            // Sync subjects
            if ($request->has('subjects')) {
                $teacher->subjects()->sync($request->subjects);
            }
        });

        return redirect()
            ->route('teacher.onboarding.step3')
            ->with('success', 'Teaching details saved!');
    }

    /**
     * Show onboarding step 3: Availability & Schedule
     */
    public function step3(): Response
    {
        $teacher = auth()->user()->teacher;

        return Inertia::render('Teacher/Onboarding/Step3', [
            'teacher' => $teacher->load('availability'),
        ]);
    }

    /**
     * Store onboarding step 3
     */
    public function storeStep3(OnboardingStep3Request $request): RedirectResponse
    {
        $teacher = auth()->user()->teacher;
        
        DB::transaction(function () use ($teacher, $request) {
            // Calculate teaching mode enum value
            $modes = $request->teaching_modes;
            $teachingMode = 'full-time';
            if (in_array('full-time', $modes) && in_array('part-time', $modes)) {
                $teachingMode = 'both';
            } elseif (in_array('part-time', $modes)) {
                $teachingMode = 'part-time';
            }

            // Calculate teaching type enum value
            $types = $request->teaching_types;
            $teachingType = 'online';
            if (in_array('online', $types) && in_array('in-person', $types)) {
                $teachingType = 'both';
            } elseif (in_array('in-person', $types)) {
                $teachingType = 'in-person';
            }

            // Update teacher details
            $teacher->update([
                'timezone' => $request->timezone,
                'teaching_mode' => $teachingMode,
                'teaching_type' => $teachingType,
            ]);

            // Delete existing availability
            $teacher->availability()->delete();
            
            // Create new availability records
            foreach ($request->availability as $slot) {
                $teacher->availability()->create([
                    'day_of_week' => $slot['day'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'is_available' => true,
                ]);
            }
        });

        return redirect()
            ->route('teacher.onboarding.step4')
            ->with('success', 'Availability saved!');
    }

    /**
     * Show onboarding step 4: Payment & Earnings
     */
    public function step4(): Response
    {
        $teacher = auth()->user()->teacher;

        return Inertia::render('Teacher/Onboarding/Step4', [
            'teacher' => $teacher->load('paymentMethod'),
        ]);
    }

    /**
     * Store onboarding step 4 and complete onboarding
     */
    public function storeStep4(OnboardingStep4Request $request): RedirectResponse
    {
        $teacher = auth()->user()->teacher;
        
        DB::transaction(function () use ($teacher, $request) {
            // Update teacher hourly rate
            $teacher->update([
                'hourly_rate' => $request->hourly_rate,
            ]);
            
            // Prepare payment method data
            $paymentData = [
                'payment_type' => $request->payment_type,
                'is_primary' => true, // Default to primary for first method
                'bank_name' => $request->bank_name,
                'bank_code' => $request->bank_code,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'routing_number' => $request->routing_number,
                'email' => $request->paypal_email,
                'account_id' => $request->stripe_account_id,
            ];

            // Create or update payment method
            $teacher->paymentMethod()->updateOrCreate(
                ['teacher_id' => $teacher->id],
                $paymentData
            );
            
            // Complete onboarding
            $this->registrationService->submitApplication($teacher);
        });

        return redirect()
            ->route('teacher.waiting-area')
            ->with('success', 'Onboarding completed! Your application is under review.');
    }
}
