<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\ClassroomAttendance;
use App\Notifications\NoShowWarningNotification;
use App\Notifications\NoShowDetectedNotification;
use App\Services\EscrowService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DetectNoShows extends Command
{
    protected $signature = 'sessions:detect-no-shows';

    protected $description = 'Detect and handle no-shows for sessions that should have started';

    // Grace period before marking as no-show (minutes)
    const GRACE_PERIOD_MINUTES = 15;

    // Warning sent after X minutes
    const WARNING_AFTER_MINUTES = 10;

    protected EscrowService $escrowService;

    public function __construct(EscrowService $escrowService)
    {
        parent::__construct();
        $this->escrowService = $escrowService;
    }

    public function handle(): int
    {
        $this->info('Checking for no-shows...');

        // 1. Send warnings for sessions where someone hasn't joined after 10 minutes
        $this->sendNoShowWarnings();

        // 2. Process no-shows for sessions past grace period
        $this->processNoShows();

        return Command::SUCCESS;
    }

    /**
     * Send warnings to participants who haven't joined after 10 minutes
     */
    protected function sendNoShowWarnings(): void
    {
        // Find sessions that started 10+ minutes ago but less than grace period
        $warningWindow = now()->setTimezone('UTC')->subMinutes(self::WARNING_AFTER_MINUTES);
        $graceWindow = now()->setTimezone('UTC')->subMinutes(self::GRACE_PERIOD_MINUTES);

        $bookings = Booking::where('status', 'confirmed')
            ->where('start_time', '<=', $warningWindow)
            ->where('start_time', '>', $graceWindow)
            ->where(function ($query) {
                // At least one party hasn't joined
                $query->where('teacher_attended', false)
                    ->orWhere('student_attended', false);
            })
            ->whereNull('no_show_warning_sent_at')
            ->with(['student', 'teacher.user', 'subject'])
            ->get();

        foreach ($bookings as $booking) {
            try {
                // ── Option B: Cross-check flags from actual attendance records ──
                $this->syncAttendanceFlagsFromRecords($booking);

                // Skip if both have actually attended (flags were just out of sync)
                if ($booking->teacher_attended && $booking->student_attended) {
                    continue;
                }

                $minutesLate = now()->diffInMinutes($booking->start_time);

                // Warn student if they haven't joined
                if (!$booking->student_attended) {
                    $booking->student->notify(new NoShowWarningNotification($booking, 'student', $minutesLate));
                    $this->line("  ⚠️ Sent warning to student for Booking #{$booking->id}");
                }

                // Warn teacher if they haven't joined
                if (!$booking->teacher_attended) {
                    $booking->teacher->user->notify(
                        (new NoShowWarningNotification($booking, 'teacher', $minutesLate))->delay(now()->addSeconds(10))
                    );
                    $this->line("  ⚠️ Sent warning to teacher for Booking #{$booking->id}");
                }

                $booking->update(['no_show_warning_sent_at' => now()]);

            } catch (\Exception $e) {
                Log::error("Failed to send no-show warning for booking #{$booking->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Process bookings where grace period has passed
     */
    protected function processNoShows(): void
    {
        // Find sessions past grace period that haven't been processed
        $graceWindow = now()->setTimezone('UTC')->subMinutes(self::GRACE_PERIOD_MINUTES);

        $bookings = Booking::where('status', 'confirmed')
            ->where('start_time', '<=', $graceWindow)
            ->where('payment_status', 'held')
            ->where(function ($query) {
                // At least one party is a no-show (based on flags)
                $query->where('teacher_attended', false)
                    ->orWhere('student_attended', false);
            })
            ->with(['student', 'teacher.user', 'subject'])
            ->get();

        foreach ($bookings as $booking) {
            try {
                // ── Option B: Cross-check against actual attendance records ──
                $this->syncAttendanceFlagsFromRecords($booking);

                // Re-check after syncing — if both actually attended, skip no-show
                if ($booking->teacher_attended && $booking->student_attended) {
                    $this->line("  ℹ️ Booking #{$booking->id} - Both attended (flags auto-corrected), skipping no-show");
                    continue;
                }

                $this->processNoShow($booking);
            } catch (\Exception $e) {
                Log::error("Failed to process no-show for booking #{$booking->id}: " . $e->getMessage());
                $this->error("  ✗ Failed for Booking #{$booking->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Sync attendance flags from actual ClassroomAttendance records.
     * If someone joined (has an attendance record) but their flag wasn't set, fix it.
     */
    protected function syncAttendanceFlagsFromRecords(Booking $booking): void
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
            Log::info("DetectNoShows: Auto-fixed attendance flags for booking #{$booking->id}", $updates);
            $this->line("  🔧 Auto-fixed attendance flags for Booking #{$booking->id}");
        }
    }

    /**
     * Process a single no-show booking
     */
    protected function processNoShow(Booking $booking): void
    {
        $teacherAttended = $booking->teacher_attended;
        $studentAttended = $booking->student_attended;

        if (!$teacherAttended && !$studentAttended) {
            // Both no-show - full refund to student
            $this->handleBothNoShow($booking);
        } elseif (!$teacherAttended) {
            // Teacher no-show - full refund to student
            $this->handleTeacherNoShow($booking);
        } elseif (!$studentAttended) {
            // Student no-show — full refund after arbiter (teacher gets nothing)
            $this->handleStudentNoShow($booking);
        }
    }

    /**
     * Handle case where both parties didn't show up
     */
    protected function handleBothNoShow(Booking $booking): void
    {
        // Defer to the Arbiter — just flag the no-show type
        $booking->update([
            'status' => 'awaiting_judgment',
            'judgment_at' => now(),
            'cancellation_reason' => 'Both parties no-show',
        ]);

        // Notify both parties
        $booking->student->notify(new NoShowDetectedNotification($booking, 'both', true));
        $booking->teacher->user->notify(
            (new NoShowDetectedNotification($booking, 'both', false))->delay(now()->addSeconds(10))
        );

        $this->info("  ✓ Both no-show for Booking #{$booking->id} — submitted to Arbiter");
        Log::info("No-show: Both parties for booking #{$booking->id} — deferred to Arbiter");

        app(\App\Services\AuditService::class)->log(
            'NO_SHOW_DETECTED',
            $booking,
            ['status' => 'confirmed'],
            ['status' => 'awaiting_judgment'],
            "Both parties no-show after 15 minutes. Session auto-ended and sent for judgment."
        );
    }

    /**
     * Handle teacher no-show
     */
    protected function handleTeacherNoShow(Booking $booking): void
    {
        // Defer to the Arbiter — just flag the no-show type
        $booking->update([
            'status' => 'awaiting_judgment',
            'judgment_at' => now(),
            'cancellation_reason' => 'Teacher no-show',
        ]);

        // Notify both parties
        $booking->student->notify(new NoShowDetectedNotification($booking, 'teacher', true));
        $booking->teacher->user->notify(
            (new NoShowDetectedNotification($booking, 'teacher', false))->delay(now()->addSeconds(10))
        );

        $this->info("  ✓ Teacher no-show for Booking #{$booking->id} — submitted to Arbiter");
        Log::info("No-show: Teacher for booking #{$booking->id} — deferred to Arbiter");

        app(\App\Services\AuditService::class)->log(
            'NO_SHOW_DETECTED',
            $booking,
            ['status' => 'confirmed'],
            ['status' => 'awaiting_judgment'],
            "Teacher no-show after 15 minutes. Session auto-ended and sent for judgment.",
            ['party' => 'teacher']
        );
    }

    /**
     * Handle student no-show
     */
    protected function handleStudentNoShow(Booking $booking): void
    {
        // Defer to the Arbiter — just flag the no-show type
        $booking->update([
            'status' => 'awaiting_judgment',
            'judgment_at' => now(),
            'cancellation_reason' => 'Student no-show',
        ]);

        // Notify both parties
        $booking->student->notify(new NoShowDetectedNotification($booking, 'student', true));
        $booking->teacher->user->notify(
            (new NoShowDetectedNotification($booking, 'student', false))->delay(now()->addSeconds(10))
        );

        $this->info("  ✓ Student no-show for Booking #{$booking->id} — submitted to Arbiter");
        Log::info("No-show: Student for booking #{$booking->id} — deferred to Arbiter");

        app(\App\Services\AuditService::class)->log(
            'NO_SHOW_DETECTED',
            $booking,
            ['status' => 'confirmed'],
            ['status' => 'awaiting_judgment'],
            "Student no-show after 15 minutes. Session auto-ended and sent for judgment.",
            ['party' => 'student']
        );
    }
}
