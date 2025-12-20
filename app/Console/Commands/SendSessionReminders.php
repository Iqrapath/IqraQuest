<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Notifications\SessionReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendSessionReminders extends Command
{
    protected $signature = 'sessions:send-reminders';

    protected $description = 'Send reminder notifications for upcoming sessions';

    // Reminder intervals in minutes
    const REMINDER_24H = 1440;  // 24 hours
    const REMINDER_1H = 60;     // 1 hour
    const REMINDER_15M = 15;    // 15 minutes

    public function handle(): int
    {
        $this->info('Checking for sessions needing reminders...');

        $reminders = [
            ['minutes' => self::REMINDER_24H, 'type' => '24h', 'label' => '24 hours'],
            ['minutes' => self::REMINDER_1H, 'type' => '1h', 'label' => '1 hour'],
            ['minutes' => self::REMINDER_15M, 'type' => '15m', 'label' => '15 minutes'],
        ];

        $totalSent = 0;

        foreach ($reminders as $reminder) {
            $sent = $this->sendRemindersForInterval($reminder['minutes'], $reminder['type'], $reminder['label']);
            $totalSent += $sent;
        }

        $this->info("Total reminders sent: {$totalSent}");
        Log::info("Session reminders job completed. Sent: {$totalSent}");

        return Command::SUCCESS;
    }

    /**
     * Send reminders for a specific time interval
     */
    protected function sendRemindersForInterval(int $minutes, string $type, string $label): int
    {
        // Find bookings starting within the reminder window (±2 minutes tolerance)
        $targetTime = now()->addMinutes($minutes);
        $windowStart = $targetTime->copy()->subMinutes(2);
        $windowEnd = $targetTime->copy()->addMinutes(2);

        $bookings = Booking::where('status', 'confirmed')
            ->whereBetween('start_time', [$windowStart, $windowEnd])
            ->whereDoesntHave('remindersSent', function ($query) use ($type) {
                $query->where('reminder_type', $type);
            })
            ->with(['student', 'teacher.user', 'subject'])
            ->get();

        $sent = 0;

        foreach ($bookings as $booking) {
            try {
                // Send to student
                $booking->student->notify(new SessionReminderNotification($booking, $type, true));
                
                // Send to teacher (with delay to avoid rate limiting)
                $booking->teacher->user->notify(
                    (new SessionReminderNotification($booking, $type, false))->delay(now()->addSeconds(10))
                );

                // Record that reminder was sent
                $booking->remindersSent()->create([
                    'reminder_type' => $type,
                    'sent_at' => now(),
                ]);

                $sent += 2; // Count both student and teacher
                $this->line("  ✓ Sent {$label} reminder for Booking #{$booking->id}");

            } catch (\Exception $e) {
                Log::error("Failed to send {$type} reminder for booking #{$booking->id}: " . $e->getMessage());
                $this->error("  ✗ Failed for Booking #{$booking->id}: " . $e->getMessage());
            }
        }

        if ($sent > 0) {
            $this->info("Sent {$sent} {$label} reminders");
        }

        return $sent;
    }
}
