<?php

use App\Http\Controllers\AboutUsController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\RoleSelectionController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\Auth\TeacherRegistrationController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ClassroomMaterialController;
use App\Http\Controllers\ClassroomPollController;
use App\Http\Controllers\FindTeacherController;
use App\Http\Controllers\HowItWorksController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\LiveKitWebhookController;
use App\Http\Controllers\MatchRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Student\OnboardingController;
use App\Http\Controllers\Webhooks\PaystackWebhookController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\ZoomWebhookController;
use App\Models\Teacher;
use App\Models\User;
use App\Notifications\NewTeacherApplicationNotification;
use App\Notifications\TeacherApplicationReceivedNotification;
use App\Notifications\WelcomeTeacherNotification;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'handleRedirect']);
Route::get('/home', [WelcomeController::class, 'index'])->name('home');

// Find Teacher Page
Route::get('/find-teacher', [FindTeacherController::class, 'index'])->name('find-teacher');

// How It Works Page
Route::get('/how-it-works', [HowItWorksController::class, 'index'])->name('how-it-works');

// Blog Page (Placeholder)
Route::get('/blog', function () {
    return Inertia::render('Blog/Index');
})->name('blog');

// About Us Page
Route::get('/about-us', [AboutUsController::class, 'index'])->name('about-us');

// Legal Pages
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');

// Match Request API (Teacher Matching with Gemini) — rate limited to reduce abuse / cost
Route::post('/api/match-request', [MatchRequestController::class, 'store'])
    ->middleware('throttle:8,1')
    ->name('match-request.store');

// Booking Gateway (Preserves intent after login)
Route::get('/book/{teacher}', [WelcomeController::class, 'bookTeacher'])
    ->middleware('auth')
    ->name('book.teacher');

// Teacher Registration (Separate from default registration)
// GET route allows both guest and authenticated (for showing modal after registration)
Route::get('/register/teacher', [TeacherRegistrationController::class, 'create'])
    ->name('teacher.register');

// Error Page Previews (Only in local environment)
if (app()->environment('local')) {
    Route::get('/preview/errors', fn () => Inertia::render('errors/Preview'))->name('preview.errors');
    Route::get('/preview/error/400', fn () => Inertia::render('errors/400'))->name('preview.error.400');
    Route::get('/preview/error/401', fn () => Inertia::render('errors/401'))->name('preview.error.401');
    Route::get('/preview/error/403', fn () => Inertia::render('errors/403'))->name('preview.error.403');
    Route::get('/preview/error/404', fn () => Inertia::render('errors/404'))->name('preview.error.404');
    Route::get('/preview/error/405', fn () => Inertia::render('errors/405'))->name('preview.error.405');
    Route::get('/preview/error/408', fn () => Inertia::render('errors/408'))->name('preview.error.408');
    Route::get('/preview/error/419', fn () => Inertia::render('errors/419'))->name('preview.error.419');
    Route::get('/preview/error/429', fn () => Inertia::render('errors/429'))->name('preview.error.429');
    Route::get('/preview/error/500', fn () => Inertia::render('errors/500'))->name('preview.error.500');
    Route::get('/preview/error/502', fn () => Inertia::render('errors/502'))->name('preview.error.502');
    Route::get('/preview/error/503', fn () => Inertia::render('errors/503'))->name('preview.error.503');
    Route::get('/preview/error/504', fn () => Inertia::render('errors/504'))->name('preview.error.504');
}

// POST route only for guests
Route::post('/register/teacher', [TeacherRegistrationController::class, 'store'])
    ->middleware('guest');

// Override default Fortify registration to prevent auto-login and show success modal
Route::post('/register', [RegisterController::class, 'store'])
    ->middleware('guest');

// Role Selection Routes (After Email Verification)
Route::get('/select-role', [RoleSelectionController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('select-role');

// Social Login Routes
Route::get('/auth/{provider}/redirect', [SocialLoginController::class, 'redirect'])
    ->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialLoginController::class, 'callback'])
    ->name('social.callback');

// Social Login Role Selection (for new users without pre-selected role)
Route::get('/social/select-role', [SocialLoginController::class, 'showRoleSelection'])
    ->name('social.select-role');
Route::post('/social/select-role', [SocialLoginController::class, 'handleRoleSelection'])
    ->name('social.select-role.store');

Route::post('/select-role', [RoleSelectionController::class, 'store'])
    ->middleware(['auth', 'verified']);

// Onboarding Completion Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Generic simple completion (fallback or for Teachers/Guardians if they don't need data)
    Route::post('/onboarding/complete', function () {
        auth()->user()->update(['onboarding_completed_at' => now()]);

        return back();
    })->name('onboarding.complete');

    Route::post('/onboarding/skip', function () {
        auth()->user()->update(['onboarding_skipped' => true]);

        return back();
    })->name('onboarding.skip');

    // Student-specific detailed onboarding
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('/onboarding/subjects', [OnboardingController::class, 'getSubjects'])->name('onboarding.subjects');
        Route::post('/onboarding/complete', [OnboardingController::class, 'complete'])->name('onboarding.complete');
        Route::post('/onboarding/skip', [OnboardingController::class, 'skip'])->name('onboarding.skip');
    });
});

// OTP Email Verification Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/email/verify/otp', [OtpVerificationController::class, 'show'])
        ->name('verification.otp');
    Route::post('/email/verify/otp', [OtpVerificationController::class, 'verify'])
        ->name('verification.otp.verify');
    Route::post('/email/verify/otp/resend', [OtpVerificationController::class, 'resend'])
        ->name('verification.otp.resend');
    Route::post('/email/verify/otp/update-email', [OtpVerificationController::class, 'updateEmail'])
        ->name('verification.otp.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Redirect to role-specific dashboard
    Route::get('dashboard', function () {
        return redirect()->route(auth()->user()->dashboardRoute());
    })->name('dashboard');

    // Notification routes
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.mark-as-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.mark-all-as-read');

    // Virtual Classroom (The Majlis)
    Route::get('/classroom/{booking}', [ClassroomController::class, 'join'])
        ->name('classroom.join');

    // Classroom Materials API
    Route::get('/classroom/{booking}/materials', [ClassroomMaterialController::class, 'index'])
        ->name('classroom.materials.index');
    Route::post('/classroom/{booking}/materials', [ClassroomMaterialController::class, 'store'])
        ->name('classroom.materials.store');
    Route::delete('/classroom/{booking}/materials/{material}', [ClassroomMaterialController::class, 'destroy'])
        ->name('classroom.materials.destroy');

    // Classroom Attendance API
    Route::post('/classroom/{booking}/attendance/join', [ClassroomController::class, 'recordJoin'])
        ->name('classroom.attendance.join');
    Route::post('/classroom/{booking}/attendance/leave', [ClassroomController::class, 'recordLeave'])
        ->name('classroom.attendance.leave');
    Route::get('/classroom/{booking}/attendance', [ClassroomController::class, 'getAttendance'])
        ->name('classroom.attendance.index');

    // Classroom Polls/Quiz API
    Route::get('/classroom/{booking}/poll/active', [ClassroomPollController::class, 'getActive'])
        ->name('classroom.poll.active');
    Route::post('/classroom/{booking}/poll', [ClassroomPollController::class, 'store'])
        ->name('classroom.poll.store');
    Route::post('/classroom/poll/{poll}/respond', [ClassroomPollController::class, 'respond'])
        ->name('classroom.poll.respond');
    Route::post('/classroom/poll/{poll}/end', [ClassroomPollController::class, 'end'])
        ->name('classroom.poll.end');
    Route::post('/classroom/poll/{poll}/toggle-results', [ClassroomPollController::class, 'toggleResults'])
        ->name('classroom.poll.toggle-results');
});

// Email Preview Routes (Development Only)
Route::get('/preview-email/{type}', function ($type) {
    // Get the most recent teacher user (not admin)
    $user = User::where('role', 'teacher')->latest()->first() ?? User::first();
    $teacher = $user?->teacher ?? Teacher::first();

    // Get admin for new-application notification
    $admin = User::where('role', 'admin')->first();

    if (! $user || ! $teacher) {
        return 'No user or teacher found. Please register first.';
    }

    return match ($type) {
        'welcome' => (new WelcomeTeacherNotification)->toMail($user),
        'application-received' => (new TeacherApplicationReceivedNotification($teacher))->toMail($user),
        'new-application' => $admin
        ? (new NewTeacherApplicationNotification($teacher, $user))->toMail($admin)
        : 'No admin found. Please create an admin user first.',
        default => 'Invalid type. Available: welcome, application-received, new-application'
    };
})->name('preview.email');

// Payment Webhooks
Route::post('/webhooks/paystack', [PaystackWebhookController::class, 'handle'])
    ->name('webhooks.paystack');

// LiveKit Webhooks (for session completion and escrow processing)
Route::post('/webhooks/livekit', [LiveKitWebhookController::class, 'handle'])
    ->name('webhooks.livekit');

// Zoom Webhooks (for meeting events: started, ended, participant joined)
Route::post('/webhooks/zoom', [ZoomWebhookController::class, 'handle'])
    ->name('webhooks.zoom');

require __DIR__.'/settings.php';
// require __DIR__ . '/admin.php';
// require __DIR__ . '/teacher.php';
// require __DIR__ . '/student.php';
// require __DIR__ . '/guardian.php';
