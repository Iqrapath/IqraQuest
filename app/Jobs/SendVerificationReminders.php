<?php

namespace App\Jobs;

use App\Models\Teacher;
use App\Notifications\VerificationReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendVerificationReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Checking for upcoming verification calls...');

        // Find teachers with scheduled verification in the next hour (e.g. 50-60 mins from now)
        // OR exactly 15 mins before (depending on how often cron runs)
        // For robustness, we'll check for calls starting in 15-20 minutes
        // AND calls starting in 23-24 hours (1 day reminder) if desired.

        // Let's implement the "About Due" (15 mins before) reminder
        $startWindow = now()->addMinutes(15);
        $endWindow = now()->addMinutes(20);

        $upcomingTeachers = Teacher::where('video_verification_status', 'scheduled')
            ->whereBetween('video_verification_scheduled_at', [$startWindow, $endWindow])
            ->get();

        foreach ($upcomingTeachers as $teacher) {
            try {
                $teacher->user->notify(
                    new VerificationReminderNotification($teacher, $teacher->video_verification_scheduled_at)
                );
                Log::info("Sent verification reminder to teacher ID: {$teacher->id}");
            } catch (\Exception $e) {
                Log::error("Failed to send verification reminder to teacher ID {$teacher->id}: " . $e->getMessage());
            }
        }

        Log::info("Verification reminder check completed. Sent: " . $upcomingTeachers->count());
    }
}
