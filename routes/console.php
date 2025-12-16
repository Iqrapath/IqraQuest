<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Security: Generate daily security report at 9 AM
Schedule::command('security:report --days=1')
    ->dailyAt('09:00')
    ->appendOutputTo(storage_path('logs/security-reports.log'));

// Security: Clean up old login attempts (older than 30 days)
Schedule::call(function () {
    \DB::table('login_attempts')
        ->where('attempted_at', '<', now()->subDays(30))
        ->delete();
})->weekly();

// Security: Clean up old security logs (older than 90 days)
Schedule::call(function () {
    \DB::table('security_logs')
        ->where('created_at', '<', now()->subDays(90))
        ->delete();
})->monthly();

// Finance: Process automatic payouts daily at midnight
Schedule::command('payouts:process-automatic')
    ->dailyAt('00:00')
    ->appendOutputTo(storage_path('logs/payouts.log'));

// Escrow: Process eligible fund releases every hour
// Releases funds to teachers after 24-hour dispute window expires
Schedule::command('escrow:process-releases')
    ->hourly()
    ->appendOutputTo(storage_path('logs/escrow-releases.log'));
