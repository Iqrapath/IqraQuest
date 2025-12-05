<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Teacher Registration (Separate from default registration)
// GET route allows both guest and authenticated (for showing modal after registration)
Route::get('/register/teacher', [\App\Http\Controllers\Auth\TeacherRegistrationController::class, 'create'])
    ->name('teacher.register');

// POST route only for guests
Route::post('/register/teacher', [\App\Http\Controllers\Auth\TeacherRegistrationController::class, 'store'])
    ->middleware('guest');

// Override default Fortify registration to prevent auto-login and show success modal
Route::post('/register', [\App\Http\Controllers\Auth\RegisterController::class, 'store'])
    ->middleware('guest');

// Role Selection Routes (After Email Verification)
Route::get('/select-role', [\App\Http\Controllers\Auth\RoleSelectionController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('select-role');

// Social Login Routes
Route::get('/auth/{provider}/redirect', [\App\Http\Controllers\Auth\SocialLoginController::class, 'redirect'])
    ->name('social.redirect');
Route::get('/auth/{provider}/callback', [\App\Http\Controllers\Auth\SocialLoginController::class, 'callback'])
    ->name('social.callback');

Route::post('/select-role', [\App\Http\Controllers\Auth\RoleSelectionController::class, 'store'])
    ->middleware(['auth', 'verified']);

// Onboarding Completion Routes
Route::post('/onboarding/complete', function () {
    auth()->user()->update(['onboarding_completed_at' => now()]);
    return back();
})->middleware(['auth', 'verified'])->name('onboarding.complete');

Route::post('/onboarding/skip', function () {
    auth()->user()->update(['onboarding_skipped' => true]);
    return back();
})->middleware(['auth', 'verified'])->name('onboarding.skip');

// OTP Email Verification Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/email/verify/otp', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'show'])
        ->name('verification.otp');
    Route::post('/email/verify/otp', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'verify'])
        ->name('verification.otp.verify');
    Route::post('/email/verify/otp/resend', [\App\Http\Controllers\Auth\OtpVerificationController::class, 'resend'])
        ->name('verification.otp.resend');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Redirect to role-specific dashboard
    Route::get('dashboard', function () {
        return redirect()->route(auth()->user()->dashboardRoute());
    })->name('dashboard');

    // Notification routes
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])
        ->name('notifications.mark-as-read');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])
        ->name('notifications.mark-all-as-read');
});

// Email Preview Routes (Development Only)
Route::get('/preview-email/{type}', function ($type) {
    // Get the most recent teacher user (not admin)
    $user = \App\Models\User::where('role', 'teacher')->latest()->first() ?? \App\Models\User::first();
    $teacher = $user?->teacher ?? \App\Models\Teacher::first();
    
    // Get admin for new-application notification
    $admin = \App\Models\User::where('role', 'admin')->first();
    
    if (!$user || !$teacher) {
        return 'No user or teacher found. Please register first.';
    }
    
    return match($type) {
        'welcome' => (new \App\Notifications\WelcomeTeacherNotification())->toMail($user),
        'application-received' => (new \App\Notifications\TeacherApplicationReceivedNotification($teacher))->toMail($user),
        'new-application' => $admin 
            ? (new \App\Notifications\NewTeacherApplicationNotification($teacher, $user))->toMail($admin)
            : 'No admin found. Please create an admin user first.',
        default => 'Invalid type. Available: welcome, application-received, new-application'
    };
})->name('preview.email');

// Payment Webhooks
Route::post('/webhooks/paystack', [\App\Http\Controllers\Webhooks\PaystackWebhookController::class, 'handle'])
    ->name('webhooks.paystack');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/teacher.php';
require __DIR__.'/student.php';
require __DIR__.'/guardian.php';
