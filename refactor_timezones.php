<?php

$files = [
    'app/Services/BookingStatusService.php',
    'app/Notifications/VerificationReminderNotification.php',
    'app/Notifications/VerificationCallScheduledNotification.php',
    'app/Notifications/SessionReminderNotification.php',
    'app/Notifications/NewBookingRequestNotification.php',
    'app/Notifications/BookingRequestedNotification.php',
    'app/Notifications/BookingRejectedNotification.php',
    'app/Notifications/BookingFailedNotification.php',
    'app/Notifications/BookingConfirmedNotification.php',
    'app/Notifications/BookingCancelledByStudentNotification.php',
    'app/Notifications/BookingCancelledByAdminNotification.php',
    'app/Notifications/BookingApprovedNotification.php',
    'app/Http/Controllers/VerificationRoomController.php',
    'app/Http/Controllers/Teacher/ScheduleController.php',
    'app/Http/Controllers/Teacher/DashboardController.php',
    'app/Http/Controllers/Student/RescheduleController.php',
    'app/Http/Controllers/Student/BookingController.php',
    'app/Http/Controllers/Admin/BookingController.php',
];

foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    if (!file_exists($path))
        continue;

    $content = file_get_contents($path);

    // Determine the timezone variable to inject
    if (str_contains($file, 'Notification')) {
        $tzVar = '$notifiable->timezone ?? config(\'app.timezone\')';
        // For Notifications, we often are inside toMail or toArray which takes $notifiable
        // Also fix the toMail cases
        $content = preg_replace("/->format\((['\"].+?['\"])\)\s*\.\s*(['\"]) UTC['\"]/", "->setTimezone($tzVar)->format($1)", $content);
        $content = preg_replace("/->format\((['\"].+?['\"])\)\s*\.\s*(['\"]) \- ['\"] \.\s*(.+?)->format\((['\"].+?['\"])\)\s*\.\s*(['\"]) UTC['\"]/", "->setTimezone($tzVar)->format($1) . ' - ' . $3->setTimezone($tzVar)->format($4)", $content);
    } else {
        $tzVar = "request()->user()?->timezone ?? config('app.timezone')";

        // Single formats
        $content = preg_replace("/->format\((['\"].+?['\"])\)\s*\.\s*(['\"]) UTC['\"]/", "->setTimezone($tzVar)->format($1)", $content);
        // Double formats (start_time - end_time)
        $content = preg_replace("/->format\((['\"].+?['\"])\)\s*\.\s*(['\"]) \- ['\"] \.\s*(.+?)->format\((['\"].+?['\"])\)/", "->setTimezone($tzVar)->format($1) . ' - ' . $3->setTimezone($tzVar)->format($4)", $content);
    }

    file_put_contents($path, $content);
    echo "Refactored $file\n";
}

echo "Done!\n";
