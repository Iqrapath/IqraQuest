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
    ->weekends()
    ->at('00:00')
    ->appendOutputTo(storage_path('logs/payouts.log'));

// Escrow: Process eligible fund releases every hour
// Releases funds to teachers after 24-hour dispute window expires
Schedule::command('escrow:process-releases')
    ->hourly()
    ->appendOutputTo(storage_path('logs/escrow-releases.log'));

// Session Reminders: Send reminders at 24h, 1h, and 15min before sessions
// Runs every 5 minutes to catch all reminder windows
Schedule::command('sessions:send-reminders')
    ->everyFiveMinutes()
    ->appendOutputTo(storage_path('logs/session-reminders.log'));

// No-Show Detection: Check for participants who haven't joined after session start
// Sends warnings at 10 min, processes no-shows at 15 min
Schedule::command('sessions:detect-no-shows')
    ->everyFiveMinutes()
    ->appendOutputTo(storage_path('logs/no-show-detection.log'));

// Booking Status: Mark confirmed bookings as completed when session ends
// Runs every minute for accurate status updates
Schedule::command('bookings:complete-ended')
    ->everyMinute()
    ->appendOutputTo(storage_path('logs/booking-completions.log'));

// Admin Notifications: Send scheduled broadcast notifications
// Runs every minute to send notifications at their scheduled time
Schedule::command('notifications:send-scheduled')
    ->everyMinute()
    ->appendOutputTo(storage_path('logs/scheduled-notifications.log'));
