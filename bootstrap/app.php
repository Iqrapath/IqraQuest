<?php

use App\Http\Middleware\BlockSuspiciousIPs;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\EnsureOnboardingCompleted;
use App\Http\Middleware\EnsureTeacherApproved;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogSuspiciousActivity;
use App\Http\Middleware\PreventSqlInjection;
use App\Http\Middleware\SecurityHeaders;
use App\Jobs\CancelExpiredAwaitingPaymentBookings;
use App\Models\SystemActivity;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Sentry\Laravel\Integration;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

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
        $middleware->preventRequestForgery(except: [
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
            EnsureUserIsActive::class, // Check active status on every request
        ]);

        $middleware->api(append: [
            EnsureUserIsActive::class,
        ]);

        // Alias for middleware
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'verified' => EnsureEmailIsVerified::class,
            'onboarding.completed' => EnsureOnboardingCompleted::class,
            'teacher.approved' => EnsureTeacherApproved::class,
            'throttle.strict' => ThrottleRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        Integration::handles($exceptions);

        // Automatic DB Logging for all Critical Exceptions
        $exceptions->reportable(function (Throwable $e) {
            try {
                SystemActivity::create([
                    'user_id' => Auth::id(),
                    'category' => 'ERROR',
                    'event_type' => 'EXCEPTION_CAUGHT',
                    'description' => 'Uncaught Exception: '.$e->getMessage(),
                    'metadata' => [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'url' => request()->fullUrl(),
                        'ip' => request()->ip(),
                        'trace' => substr($e->getTraceAsString(), 0, 1000), // First 1000 chars of trace
                    ],
                    'severity' => ($e instanceof HttpException && $e->getStatusCode() < 500) ? 'warning' : 'error',
                ]);
            } catch (Exception $loggingError) {
                // Fail silently to avoid infinite loops if DB is down
                Log::error('Failed to log exception to DB: '.$loggingError->getMessage());
            }
        });

        // Render custom Inertia error pages (keep JSON/API and non-Inertia fetches on default responses)
        $exceptions->respond(function (Response $response) {
            $request = request();
            if (! in_array($response->getStatusCode(), [400, 401, 403, 404, 405, 408, 419, 429, 500, 502, 503, 504])) {
                return $response;
            }

            if ($request->is('api/*')
                || ($request->expectsJson() && ! $request->header('X-Inertia'))) {
                return $response;
            }

            return Inertia::render('errors/'.$response->getStatusCode())
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
        });
    })
    ->withSchedule(function (Schedule $schedule) {
        $schedule->job(new CancelExpiredAwaitingPaymentBookings)->everyFifteenMinutes();
    })->create();
