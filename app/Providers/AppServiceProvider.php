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
        // Register observers
        \App\Models\Teacher::observe(\App\Observers\TeacherObserver::class);
        \App\Models\TeacherCertificate::observe(\App\Observers\TeacherCertificateObserver::class);
    }
}
