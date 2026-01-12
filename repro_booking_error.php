<?php

use App\Services\BookingService;
use App\Models\User;
use App\Models\Teacher;

$svc = resolve(BookingService::class);
$u = User::find(21);
$t = Teacher::find(17);

// Scenario: 
// Session 1: Jan 12, 9-10
// Session 2: Jan 12, 10-11
// Recurring 4 weeks.

$sessions = [
    [
        'start_time' => '2026-01-12 09:00:00', 
        'end_time' => '2026-01-12 10:00:00'
    ], 
    [
        'start_time' => '2026-01-12 10:00:00', 
        'end_time' => '2026-01-12 11:00:00'
    ]
];

try {
    $svc->createBatchBookings(
        $u, 
        $t, 
        $sessions, 
        true, // isRecurring
        4,    // occurrences
        1     // subject_id
    );
    echo "Success\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
