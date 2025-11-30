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

Route::middleware(['auth', 'verified'])->group(function () {
    // Redirect to role-specific dashboard
    Route::get('dashboard', function () {
        return redirect()->route(auth()->user()->dashboardRoute());
    })->name('dashboard');
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

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/teacher.php';
