<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
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
        // Fix for Mixed Content with Cloudflare/Ngrok/Expose
        if (request()->hasHeader('X-Forwarded-Proto') && request()->header('X-Forwarded-Proto') === 'https') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register observers
        \App\Models\User::observe(\App\Observers\UserObserver::class);
        \App\Models\Teacher::observe(\App\Observers\TeacherObserver::class);
        \App\Models\TeacherCertificate::observe(\App\Observers\TeacherCertificateObserver::class);
        \App\Models\Booking::observe(\App\Observers\BookingObserver::class);
        \App\Models\SystemSetting::observe(\App\Observers\SystemSettingObserver::class);

        // Set global locale from settings when DB is available.
        // In CI/bootstrap phases, DB may not be ready yet (e.g. package:discover).
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('system_settings')) {
                $locale = \App\Models\SystemSetting::get('language');
                if ($locale) {
                    \Illuminate\Support\Facades\App::setLocale($locale);
                }
            }
        } catch (\Throwable $e) {
            // Gracefully skip locale bootstrapping when DB is unavailable.
        }
    }
}
