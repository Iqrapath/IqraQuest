<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\ClassroomAttendance;
use App\Services\EscrowService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SessionArbiter extends Command
{
    protected $signature = 'sessions:arbiter';

    protected $description = 'The Supreme Court: Makes final, irreversible financial rulings for completed sessions';

    // Minimum cooling period before the Arbiter will process a booking (minutes)
    const COOLING_PERIOD_MINUTES = 15;

    // Min completion to get full payment (percentage)
    const MIN_COMPLETION_PERCENTAGE = 80;

    // Percentage teacher gets for student no-show
    const NO_SHOW_TEACHER_PERCENTAGE = 50;

    protected EscrowService $escrowService;

    public function __construct(EscrowService $escrowService)
    {
        parent::__construct();
        $this->escrowService = $escrowService;
    }

    public function handle(): int
    {
        $this->info('⚖️ Session Arbiter: Reviewing cases...');

        // Phase 1: Transition expired sessions to awaiting_judgment
        $this->transitionExpiredSessions();

        // Phase 2: Rule on cases that have cooled down
        $this->ruleOnPendingCases();

        return Command::SUCCESS;
    }

    /**
     * Phase 1: Find sessions that have ended but haven't been submitted for judgment yet.
     * Transition them to 'awaiting_judgment'.
     */
    protected function transitionExpiredSessions(): void
    {
        $now = now()->setTimezone('UTC');

        // Find confirmed/ongoing bookings where end_time has passed
        $expiredBookings = Booking::whereIn('status', ['confirmed', 'ongoing'])
            ->where('end_time', '<=', $now)
            ->where('payment_status', 'held')
            ->get();

        foreach ($expiredBookings as $booking) {
            // Close any open attendance records before transitioning
            $this->closeOpenAttendanceRecords($booking);

            $booking->update([
                'status' => 'awaiting_judgment',
                'judgment_at' => now(),
            ]);

            $this->line("  📋 Booking #{$booking->id} → awaiting_judgment");
            Log::info("Arbiter: Booking #{$booking->id} transitioned to awaiting_judgment");
        }
    }

    /**
     * Phase 2: Process bookings that have been in awaiting_judgment
     * for at least the cooling period.
     */
    protected function ruleOnPendingCases(): void
    {
        $coolingCutoff = now()->subMinutes(self::COOLING_PERIOD_MINUTES);

        $pendingCases = Booking::where('status', 'awaiting_judgment')
            ->where('payment_status', 'held')
            ->where('judgment_at', '<=', $coolingCutoff)
            ->with(['student', 'teacher.user', 'subject'])
            ->get();

        if ($pendingCases->isEmpty()) {
            $this->info('  No cases ready for ruling.');
            return;
        }

        foreach ($pendingCases as $booking) {
            try {
                $this->ruleOnCase($booking);
            } catch (\Exception $e) {
                Log::error("Arbiter: Failed to rule on booking #{$booking->id}: " . $e->getMessage());
                $this->error("  ✗ Failed for Booking #{$booking->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Make the final ruling for a single booking.
     * This is the ONLY place in the entire system that makes financial decisions
     * for session completion.
     */
    protected function ruleOnCase(Booking $booking): void
    {
        // Idempotency guard — only process if funds are still held
        if ($booking->payment_status !== 'held') {
            $this->line("  ⏭️ Booking #{$booking->id} already processed (status: {$booking->payment_status})");
            return;
        }

        // Close any lingering open attendance records (safety net)
        $this->closeOpenAttendanceRecords($booking);

        // Sync attendance flags from actual records (ground truth)
        $this->syncAttendanceFlags($booking);

        // Gather evidence
        $evidence = $this->gatherEvidence($booking);

        // Make the ruling
        $ruling = $this->determineRuling($booking, $evidence);

        // Execute the ruling
        $this->executeRuling($booking, $ruling, $evidence);
    }

    /**
     * Close any attendance records that are still open (left_at = null).
     * This handles cases where participants didn't properly leave.
     */
    protected function closeOpenAttendanceRecords(Booking $booking): void
    {
        $openRecords = ClassroomAttendance::where('booking_id', $booking->id)
            ->whereNull('left_at')
            ->get();

        foreach ($openRecords as $record) {
            // Use end_time as the leave time (they stayed until the end)
            $leaveTime = $booking->end_time;
            $record->left_at = $leaveTime;
            $record->duration_seconds = $record->joined_at->diffInSeconds($leaveTime);
            $record->save();

            Log::info("Arbiter: Auto-closed attendance #{$record->id} for booking #{$booking->id}");
        }
    }

    /**
     * Sync attendance flags from actual ClassroomAttendance records.
     */
    protected function syncAttendanceFlags(Booking $booking): void
    {
        $hasTeacher = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'teacher')
            ->exists();

        $hasStudent = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'student')
            ->exists();

        $updates = [];
        if ($hasTeacher && !$booking->teacher_attended) {
            $updates['teacher_attended'] = true;
        }
        if ($hasStudent && !$booking->student_attended) {
            $updates['student_attended'] = true;
        }

        if (!empty($updates)) {
            $booking->update($updates);
            $booking->refresh();
            Log::info("Arbiter: Fixed attendance flags for booking #{$booking->id}", $updates);
        }
    }

    /**
     * Gather all evidence for the ruling.
     */
    protected function gatherEvidence(Booking $booking): array
    {
        $teacherAttendance = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'teacher')
            ->get();

        $studentAttendance = ClassroomAttendance::where('booking_id', $booking->id)
            ->where('role', 'student')
            ->get();

        $teacherMinutes = floor($teacherAttendance->sum('duration_seconds') / 60);
        $studentMinutes = floor($studentAttendance->sum('duration_seconds') / 60);
        $expectedMinutes = $booking->getExpectedDurationMinutes();
        $completionPercentage = $expectedMinutes > 0
            ? min(100, ($teacherMinutes / $expectedMinutes) * 100)
            : 0;

        return [
            'teacher_attended' => $booking->teacher_attended,
            'student_attended' => $booking->student_attended,
            'teacher_minutes' => $teacherMinutes,
            'student_minutes' => $studentMinutes,
            'expected_minutes' => $expectedMinutes,
            'completion_percentage' => round($completionPercentage, 1),
            'teacher_records' => $teacherAttendance->count(),
            'student_records' => $studentAttendance->count(),
        ];
    }

    /**
     * Determine the ruling based on the gathered evidence.
     */
    protected function determineRuling(Booking $booking, array $evidence): array
    {
        // Case 1: Both no-show
        if (!$evidence['teacher_attended'] && !$evidence['student_attended']) {
            return [
                'type' => 'both_no_show',
                'action' => 'full_refund',
                'final_status' => 'cancelled',
                'reason' => "Both parties no-show. No attendance records found. Full refund to student.",
            ];
        }

        // Case 2: Teacher no-show only
        if (!$evidence['teacher_attended']) {
            return [
                'type' => 'teacher_no_show',
                'action' => 'full_refund',
                'final_status' => 'cancelled',
                'reason' => "Teacher no-show. Student waited but teacher never joined. Full refund to student.",
            ];
        }

        // Case 3: Student no-show only
        if (!$evidence['student_attended']) {
            return [
                'type' => 'student_no_show',
                'action' => 'partial_payment',
                'teacher_percentage' => self::NO_SHOW_TEACHER_PERCENTAGE,
                'final_status' => 'completed',
                'reason' => "Student no-show. Teacher attended for {$evidence['teacher_minutes']}min. " .
                    "Teacher receives " . self::NO_SHOW_TEACHER_PERCENTAGE . "% compensation.",
            ];
        }

        // Case 4: Both attended — check completion
        if ($evidence['completion_percentage'] >= self::MIN_COMPLETION_PERCENTAGE) {
            return [
                'type' => 'full_completion',
                'action' => 'hold_for_dispute_window',
                'final_status' => 'completed',
                'reason' => "Both attended. {$evidence['completion_percentage']}% completion " .
                    "(teacher: {$evidence['teacher_minutes']}min/{$evidence['expected_minutes']}min). " .
                    "Funds held for 24h dispute window.",
            ];
        }

        // Case 5: Both attended but insufficient completion
        return [
            'type' => 'early_ending',
            'action' => 'partial_payment',
            'teacher_percentage' => $evidence['completion_percentage'],
            'final_status' => 'completed',
            'reason' => "Both attended but early ending. {$evidence['completion_percentage']}% completion " .
                "(teacher: {$evidence['teacher_minutes']}min/{$evidence['expected_minutes']}min). " .
                "Pro-rated payment to teacher.",
        ];
    }

    /**
     * Execute the financial ruling.
     */
    protected function executeRuling(Booking $booking, array $ruling, array $evidence): void
    {
        DB::transaction(function () use ($booking, $ruling, $evidence) {
            // Double-check idempotency inside the transaction
            $freshBooking = Booking::lockForUpdate()->find($booking->id);
            if ($freshBooking->payment_status !== 'held') {
                Log::warning("Arbiter: Skipping booking #{$booking->id} — already ruled on (race condition avoided)");
                return;
            }

            switch ($ruling['action']) {
                case 'full_refund':
                    $this->escrowService->refundFunds($freshBooking, null, $ruling['reason']);
                    $freshBooking->update([
                        'status' => $ruling['final_status'],
                        'cancellation_reason' => $ruling['reason'],
                        'judgment_reason' => $ruling['reason'],
                    ]);
                    $this->info("  🔴 Booking #{$booking->id}: FULL REFUND — {$ruling['type']}");
                    break;

                case 'partial_payment':
                    $this->escrowService->processPartialPayment(
                        $freshBooking,
                        $ruling['teacher_percentage'],
                        $ruling['reason']
                    );
                    $freshBooking->update([
                        'status' => $ruling['final_status'],
                        'judgment_reason' => $ruling['reason'],
                    ]);
                    $this->info("  🟡 Booking #{$booking->id}: PARTIAL ({$ruling['teacher_percentage']}%) — {$ruling['type']}");
                    break;

                case 'hold_for_dispute_window':
                    // Funds stay 'held' — ProcessEscrowReleases will release after 24h
                    $freshBooking->update([
                        'status' => $ruling['final_status'],
                        'judgment_reason' => $ruling['reason'],
                    ]);
                    $this->info("  🟢 Booking #{$booking->id}: HELD for dispute window — {$ruling['type']}");
                    break;
            }

            // Structured audit log
            Log::info("Arbiter: RULING for booking #{$booking->id}", [
                'ruling_type' => $ruling['type'],
                'action' => $ruling['action'],
                'final_status' => $ruling['final_status'],
                'reason' => $ruling['reason'],
                'evidence' => $evidence,
            ]);
        });
    }
}
