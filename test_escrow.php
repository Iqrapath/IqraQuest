<?php

/**
 * Escrow System Test Script
 * 
 * Tests the complete escrow flow:
 * 1. Student books a session (funds held in escrow)
 * 2. Teacher accepts booking
 * 3. Session completion scenarios:
 *    - Both attend → funds released after 24h
 *    -er no-show → full refund
 *    - Student no-show → 50% to teacher
 * 4. Dispute flow
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Teacher;
use App\Models\Booking;
use App\Models\Subject;
use App\Services\EscrowService;
use App\Services\WalletService;
use Illuminate\Support\Facades\DB;

echo "\n" . str_repeat("=", 60) . "\n";
echo "🧪 ESCROW SYSTEM TEST\n";
echo str_repeat("=", 60) . "\n\n";

// Get services
$escrowService = app(EscrowService::class);
$walletService = app(WalletService::class);

// Get test users
$student = User::where('email', 'student@iqraquest.com')->first();
$teacherUser = User::where('email', 'teacher@iqraquest.com')->first();
$teacher = $teacherUser->teacher;
$subject = Subject::first();

if (!$student || !$teacher || !$subject) {
    echo "❌ Error: Missing test data. Run: php artisan migrate:fresh --seed\n";
    exit(1);
}

echo "📋 Test Setup:\n";
echo "   Student: {$student->name} (ID: {$student->id})\n";
echo "   Teacher: {$teacherUser->name} (ID: {$teacher->id})\n";
echo "   Subject: {$subject->name}\n\n";

// Helper function to get wallet balance
function getBalance($userId) {
    $wallet = \App\Models\Wallet::where('user_id', $userId)->first();
    return $wallet ? $wallet->balance : 0;
}

// Helper to print balances
function printBalances($student, $teacherUser) {
    echo "   💰 Student Balance: " . number_format(getBalance($student->id), 2) . "\n";
    echo "   💰 Teacher Balance: " . number_format(getBalance($teacherUser->id), 2) . "\n";
}

// ============================================
// TEST 1: Hold Funds in Escrow
// ============================================
echo str_repeat("-", 60) . "\n";
echo "TEST 1: Hold Funds in Escrow\n";
echo str_repeat("-", 60) . "\n";

// Ensure student has funds
$walletService->creditWallet($student->id, 5000, "Test credit for escrow testing", ['type' => 'test']);
echo "✅ Credited student wallet with 5000\n";

$initialStudentBalance = getBalance($student->id);
$initialTeacherBalance = getBalance($teacherUser->id);
echo "\n📊 Initial Balances:\n";
printBalances($student, $teacherUser);

// Create a test booking
$booking1 = Booking::create([
    'teacher_id' => $teacher->id,
    'user_id' => $student->id,
    'subject_id' => $subject->id,
    'start_time' => now()->addDay(),
    'end_time' => now()->addDay()->addHour(),
    'status' => 'pending',
    'payment_status' => 'pending',
    'total_price' => 1000,
    'currency' => 'NGN',
    'commission_rate' => 15,
]);

echo "\n📝 Created Booking #{$booking1->id} (Price: 1000 NGN)\n";

// Hold funds
$result = $escrowService->holdFunds($booking1);
$booking1->refresh();

echo "\n🔒 Hold Funds Result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n";
echo "   Payment Status: {$booking1->payment_status}\n";
echo "   Funds Held At: {$booking1->funds_held_at}\n";

echo "\n📊 After Hold:\n";
printBalances($student, $teacherUser);

$expectedStudentBalance = $initialStudentBalance - 1000;
if (getBalance($student->id) == $expectedStudentBalance) {
    echo "✅ Student balance correctly reduced by 1000\n";
} else {
    echo "❌ Student balance mismatch! Expected: {$expectedStudentBalance}, Got: " . getBalance($student->id) . "\n";
}

// ============================================
// TEST 2: Release Funds to Teacher
// ============================================
echo "\n" . str_repeat("-", 60) . "\n";
echo "TEST 2: Release Funds to Teacher (Normal Completion)\n";
echo str_repeat("-", 60) . "\n";

// Simulate session completion
$booking1->update([
    'status' => 'completed',
    'teacher_attended' => true,
    'student_attended' => true,
    'actual_duration_minutes' => 60,
    'session_started_at' => now()->subHour(),
    'session_ended_at' => now(),
]);

$result = $escrowService->releaseFunds($booking1);
$booking1->refresh();

echo "💸 Release Funds Result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n";
echo "   Payment Status: {$booking1->payment_status}\n";
echo "   Amount Released: {$booking1->amount_released}\n";
echo "   Funds Released At: {$booking1->funds_released_at}\n";

echo "\n📊 After Release:\n";
printBalances($student, $teacherUser);

// Teacher should get 1000 - 15% commission = 850
$expectedTeacherEarnings = 850;
$actualTeacherGain = getBalance($teacherUser->id) - $initialTeacherBalance;
if ($actualTeacherGain == $expectedTeacherEarnings) {
    echo "✅ Teacher received correct amount: {$expectedTeacherEarnings} (after 10% commission)\n";
} else {
    echo "❌ Teacher earnings mismatch! Expected: {$expectedTeacherEarnings}, Got: {$actualTeacherGain}\n";
}

// ============================================
// TEST 3: Refund Funds (Teacher Rejection)
// ============================================
echo "\n" . str_repeat("-", 60) . "\n";
echo "TEST 3: Refund Funds (Teacher Rejection)\n";
echo str_repeat("-", 60) . "\n";

$balanceBeforeBooking2 = getBalance($student->id);

// Create another booking
$booking2 = Booking::create([
    'teacher_id' => $teacher->id,
    'user_id' => $student->id,
    'subject_id' => $subject->id,
    'start_time' => now()->addDays(2),
    'end_time' => now()->addDays(2)->addHour(),
    'status' => 'pending',
    'payment_status' => 'pending',
    'total_price' => 500,
    'currency' => 'NGN',
    'commission_rate' => 15,
]);

echo "📝 Created Booking #{$booking2->id} (Price: 500 NGN)\n";

// Hold funds
$escrowService->holdFunds($booking2);
$booking2->refresh();
echo "🔒 Funds held. Student balance: " . getBalance($student->id) . "\n";

// Refund (teacher rejects)
$result = $escrowService->refundFunds($booking2, null, 'Teacher declined the booking');
$booking2->refresh();

echo "\n💸 Refund Result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n";
echo "   Payment Status: {$booking2->payment_status}\n";
echo "   Amount Refunded: {$booking2->amount_refunded}\n";

echo "\n📊 After Refund:\n";
printBalances($student, $teacherUser);

if (getBalance($student->id) == $balanceBeforeBooking2) {
    echo "✅ Student received full refund\n";
} else {
    echo "❌ Refund mismatch! Expected: {$balanceBeforeBooking2}, Got: " . getBalance($student->id) . "\n";
}

// ============================================
// TEST 4: Partial Payment (Student No-Show)
// ============================================
echo "\n" . str_repeat("-", 60) . "\n";
echo "TEST 4: Partial Payment (Student No-Show - 50% to Teacher)\n";
echo str_repeat("-", 60) . "\n";

$studentBalanceBefore = getBalance($student->id);
$teacherBalanceBefore = getBalance($teacherUser->id);

// Create booking
$booking3 = Booking::create([
    'teacher_id' => $teacher->id,
    'user_id' => $student->id,
    'subject_id' => $subject->id,
    'start_time' => now()->addDays(3),
    'end_time' => now()->addDays(3)->addHour(),
    'status' => 'pending',
    'payment_status' => 'pending',
    'total_price' => 1000,
    'currency' => 'NGN',
    'commission_rate' => 15,
]);

echo "📝 Created Booking #{$booking3->id} (Price: 1000 NGN)\n";

// Hold funds
$escrowService->holdFunds($booking3);
$booking3->refresh();

// Simulate student no-show
$booking3->update([
    'teacher_attended' => true,
    'student_attended' => false,
]);

$result = $escrowService->processPartialPayment($booking3, 50, 'Student no-show');
$booking3->refresh();

echo "\n💸 Partial Payment Result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n";
echo "   Payment Status: {$booking3->payment_status}\n";
echo "   Amount Released: {$booking3->amount_released}\n";
echo "   Amount Refunded: {$booking3->amount_refunded}\n";

echo "\n📊 After Partial Payment:\n";
printBalances($student, $teacherUser);

// Teacher gets 50% of 1000 = 500, minus 15% commission = 425
$expectedTeacherPartial = 425;
$actualTeacherGain = getBalance($teacherUser->id) - $teacherBalanceBefore;
// Student gets 50% refund = 500
$expectedStudentRefund = 500;
$actualStudentRefund = getBalance($student->id) - ($studentBalanceBefore - 1000);

echo "   Teacher gain: {$actualTeacherGain} (expected: {$expectedTeacherPartial})\n";
echo "   Student refund: {$actualStudentRefund} (expected: {$expectedStudentRefund})\n";

// ============================================
// TEST 5: Dispute Flow
// ============================================
echo "\n" . str_repeat("-", 60) . "\n";
echo "TEST 5: Dispute Flow\n";
echo str_repeat("-", 60) . "\n";

// Create booking
$booking4 = Booking::create([
    'teacher_id' => $teacher->id,
    'user_id' => $student->id,
    'subject_id' => $subject->id,
    'start_time' => now()->subHours(2),
    'end_time' => now()->subHour(),
    'status' => 'completed',
    'payment_status' => 'pending',
    'total_price' => 800,
    'currency' => 'NGN',
    'commission_rate' => 15,
    'teacher_attended' => true,
    'student_attended' => true,
]);

echo "📝 Created Booking #{$booking4->id} (Price: 800 NGN)\n";

// Hold funds
$escrowService->holdFunds($booking4);
$booking4->refresh();

echo "🔒 Funds held. Payment status: {$booking4->payment_status}\n";

// Check if can be disputed
$canDispute = $booking4->canBeDisputed();
echo "❓ Can be disputed: " . ($canDispute ? "YES" : "NO") . "\n";

// Raise dispute
$disputeResult = $booking4->raiseDispute("Teacher was late and session was cut short");
$booking4->refresh();

echo "⚠️ Dispute raised: " . ($disputeResult ? "✅ SUCCESS" : "❌ FAILED") . "\n";
echo "   Payment Status: {$booking4->payment_status}\n";
echo "   Dispute Reason: {$booking4->dispute_reason}\n";
echo "   Dispute Raised At: {$booking4->dispute_raised_at}\n";

// ============================================
// TEST 6: Eligible for Release Check
// ============================================
echo "\n" . str_repeat("-", 60) . "\n";
echo "TEST 6: Eligible for Release Scope\n";
echo str_repeat("-", 60) . "\n";

// Create a booking that should be eligible (completed, held, 24h passed)
$booking5 = Booking::create([
    'teacher_id' => $teacher->id,
    'user_id' => $student->id,
    'subject_id' => $subject->id,
    'start_time' => now()->subDays(2),
    'end_time' => now()->subDays(2)->addHour(),
    'status' => 'completed',
    'payment_status' => 'held',
    'total_price' => 600,
    'currency' => 'NGN',
    'commission_rate' => 15,
    'teacher_attended' => true,
    'student_attended' => true,
    'funds_held_at' => now()->subDays(2),
]);

echo "📝 Created old completed Booking #{$booking5->id}\n";

$eligibleCount = Booking::eligibleForRelease()->count();
echo "📊 Bookings eligible for release: {$eligibleCount}\n";

$isEligible = $booking5->isEligibleForRelease();
echo "   Booking #{$booking5->id} eligible: " . ($isEligible ? "YES ✅" : "NO ❌") . "\n";

// ============================================
// TEST 7: Process Eligible Releases (Scheduled Job)
// ============================================
echo "\n" . str_repeat("-", 60) . "\n";
echo "TEST 7: Process Eligible Releases (Scheduled Job)\n";
echo str_repeat("-", 60) . "\n";

$teacherBalanceBefore = getBalance($teacherUser->id);

$results = $escrowService->processEligibleReleases();

echo "📊 Process Results:\n";
echo "   Released: {$results['released']}\n";
echo "   Failed: {$results['failed']}\n";

if (!empty($results['errors'])) {
    echo "   Errors:\n";
    foreach ($results['errors'] as $error) {
        echo "     - {$error}\n";
    }
}

$teacherGain = getBalance($teacherUser->id) - $teacherBalanceBefore;
echo "\n   Teacher balance increased by: {$teacherGain}\n";

// ============================================
// SUMMARY
// ============================================
echo "\n" . str_repeat("=", 60) . "\n";
echo "📋 TEST SUMMARY\n";
echo str_repeat("=", 60) . "\n";

echo "\n📊 Final Balances:\n";
printBalances($student, $teacherUser);

// Check platform earnings
$platformEarnings = \App\Models\PlatformEarning::sum('amount');
echo "\n💼 Total Platform Earnings: " . number_format($platformEarnings, 2) . "\n";

// Count bookings by payment status
$statusCounts = Booking::selectRaw('payment_status, count(*) as count')
    ->groupBy('payment_status')
    ->pluck('count', 'payment_status')
    ->toArray();

echo "\n📈 Bookings by Payment Status:\n";
foreach ($statusCounts as $status => $count) {
    echo "   {$status}: {$count}\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "✅ ESCROW SYSTEM TEST COMPLETE\n";
echo str_repeat("=", 60) . "\n\n";

