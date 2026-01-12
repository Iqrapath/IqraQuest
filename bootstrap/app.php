<?php

use App\Http\Middleware\BlockSuspiciousIPs;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogSuspiciousActivity;
use App\Http\Middleware\PreventSqlInjection;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));
            Route::middleware('web')
                ->group(base_path('routes/teacher.php'));
            Route::middleware('web')
                ->group(base_path('routes/guardian.php'));
            Route::middleware('web')
                ->group(base_path('routes/student.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'webhooks/*', // Allow webhooks without CSRF token
        ]);
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            SecurityHeaders::class,
            BlockSuspiciousIPs::class,
            LogSuspiciousActivity::class,
            PreventSqlInjection::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Alias for middleware
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'onboarding.completed' => \App\Http\Middleware\EnsureOnboardingCompleted::class,
            'teacher.approved' => \App\Http\Middleware\EnsureTeacherApproved::class,
            'throttle.strict' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':60,1',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->job(new \App\Jobs\CancelExpiredAwaitingPaymentBookings)->everyFifteenMinutes();
    })->create();
