<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use App\Notifications\WelcomeTeacherNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherRegistrationService
{
    /**
     * Register a new teacher account
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            // Create user account
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'teacher',
            ]);

            // Create empty teacher profile
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'onboarding_step' => 1,
            ]);

            // Dispatch Registered event to trigger welcome email
            event(new Registered($user));

            return $user;
        });
    }

    /**
     * Complete Step 1: Personal Information
     */
    public function completeStep1(Teacher $teacher, array $data): Teacher
    {
        $teacher->update([
            'country' => $data['country'],
            'city' => $data['city'],
            'preferred_language' => $data['preferred_language'] ?? null,
            'onboarding_step' => 2,
        ]);

        // Handle avatar upload if provided
        if (isset($data['avatar'])) {
            $teacher->user->update(['avatar' => $data['avatar']]);
        }

        return $teacher->fresh();
    }

    /**
     * Complete Step 2: Teaching Details
     */
    public function completeStep2(Teacher $teacher, array $data): Teacher
    {
        $teacher->update([
            'bio' => $data['bio'],
            'qualifications' => $data['qualifications'],
            'qualification_level' => $data['qualification_level'],
            'experience_years' => $data['experience_years'],
            'onboarding_step' => 3,
        ]);

        // Sync subjects (many-to-many relationship)
        $teacher->subjects()->sync($data['subjects']);

        return $teacher->fresh();
    }

    /**
     * Complete Step 3: Availability & Schedule
     */
    public function completeStep3(Teacher $teacher, array $data): Teacher
    {
        $teacher->update([
            'timezone' => $data['timezone'],
            'teaching_modes' => $data['teaching_modes'],
            'teaching_types' => $data['teaching_types'],
            'onboarding_step' => 4,
        ]);

        // Delete existing availability and create new ones
        $teacher->availability()->delete();
        
        foreach ($data['availability'] as $day => $times) {
            $teacher->availability()->create([
                'day_of_week' => $day,
                'start_time' => $times['start'],
                'end_time' => $times['end'],
                'is_available' => true,
            ]);
        }

        return $teacher->fresh();
    }

    /**
     * Complete Step 4: Payment & Earnings
     */
    public function completeStep4(Teacher $teacher, array $data): Teacher
    {
        $teacher->update([
            'preferred_currency' => $data['preferred_currency'],
            'hourly_rate' => $data['hourly_rate'],
            'onboarding_step' => 5, // Completed
        ]);

        // Create or update payment method
        $teacher->paymentMethod()->updateOrCreate(
            ['teacher_id' => $teacher->id],
            [
                'payment_type' => $data['payment_type'],
                'bank_name' => $data['bank_name'] ?? null,
                'account_number' => $data['account_number'] ?? null,
                'account_name' => $data['account_name'] ?? null,
                'paypal_email' => $data['paypal_email'] ?? null,
                'stripe_account_id' => $data['stripe_account_id'] ?? null,
            ]
        );

        return $teacher->fresh();
    }

/**
 * Submit application for admin approval
 */
public function submitApplication(Teacher $teacher): void
{
    $teacher->update([
        'status' => 'pending',
        'application_submitted_at' => now(),
    ]);

    // Send confirmation email to teacher (queued)
    $teacher->user->notify((new \App\Notifications\TeacherApplicationReceivedNotification($teacher))->delay(now()->addSeconds(5)));
    
    // Notify all admins about new teacher application (queued with delays)
    $admins = \App\Models\User::where('role', 'admin')->get();
    
    $delaySeconds = 10; // Start with 5 second delay
    foreach ($admins as $admin) {
        $admin->notify((new \App\Notifications\NewTeacherApplicationNotification($teacher, $teacher->user))->delay(now()->addSeconds($delaySeconds)));
        $delaySeconds += 10; // Add 5 seconds between each admin notification
    }
}
}
