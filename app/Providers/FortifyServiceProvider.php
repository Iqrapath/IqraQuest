<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\VerifyEmailResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        // Custom authentication logic to check for suspended accounts
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if ($user && Hash::check($request->password, $user->password)) {
                if ($user->status === 'suspended') {
                    throw ValidationException::withMessages([
                        Fortify::username() => 'Your account has been suspended. Please contact support.',
                    ]);
                }

                return $user;
            }
        });

        // Custom email verification response - redirect to onboarding
        $this->app->singleton(
            VerifyEmailResponse::class,
            \App\Http\Responses\VerifyEmailResponse::class
        );

        // Custom login response - handle teacher onboarding redirects
        $this->app->singleton(
            LoginResponse::class,
            \App\Http\Responses\LoginResponse::class
        );
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        // Redirect after login based on role
        Fortify::redirects('login', function () {
            $user = auth()->user();

            // Update last login
            $user->update([
                'last_login_at' => now(),
                'last_login_ip' => request()->ip(),
            ]);

            // Note: Login notification is sent by SendLoginNotification listener
            // which listens to the Login event fired by Fortify

            // Check if there's an intended URL (e.g., email verification link)
            if ($intended = session()->pull('url.intended')) {
                return $intended;
            }

            // If teacher hasn't completed onboarding, redirect to the correct step
            Log::info('Login Redirect Debug:', [
                'is_teacher' => $user->isTeacher(),
                'has_teacher_profile' => (bool) $user->teacher,
                'onboarding_step' => $user->teacher?->onboarding_step,
            ]);

            if ($user->isTeacher() && $user->teacher && $user->teacher->onboarding_step < 5) {
                $step = $user->teacher->onboarding_step;

                // Map step number to route name
                $routeName = match ($step) {
                    2 => 'teacher.onboarding.step2',
                    3 => 'teacher.onboarding.step3',
                    4 => 'teacher.onboarding.step4',
                    default => 'teacher.onboarding.step1',
                };

                // Return URL string, not a RedirectResponse
                return route($routeName);
            }

            // Redirect to role-specific dashboard
            return route($user->dashboardRoute());
        });

        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
            'login_warning' => $request->session()->get('login_warning'),
            'login_error' => $request->session()->get('login_error'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(function (Request $request) {
            $verificationMethod = config('auth.verification.method', 'link');

            if ($verificationMethod === 'otp') {
                return redirect()->route('verification.otp');
            }

            return Inertia::render('auth/verify-email', [
                'status' => $request->session()->get('status'),
            ]);
        });

        Fortify::registerView(fn () => Inertia::render('auth/register', [
            'verificationMethod' => config('auth.verification.method', 'link'),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            //  return Limit::perMinute(5)->by($request->session()->get('login.id'));
            return Limit::perMinute(1000)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());
            $perMinute = app()->environment('testing') ? 5 : 1000;

            return Limit::perMinute($perMinute)->by($throttleKey);
        });
    }
}
