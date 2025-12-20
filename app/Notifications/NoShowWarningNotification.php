<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NoShowWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Booking $booking;
    protected string $role; // 'learner' (student/guardian) or 'teacher'
    protected int $minutesLate;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking, string $role, int $minutesLate)
    {
        $this->booking = $booking;
        $this->role = $role;
        $this->minutesLate = $minutesLate;

        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isLearner = in_array($this->role, ['student', 'learner', 'guardian']);
        $otherParty = $isLearner
            ? $this->booking->teacher->user->name
            : $this->booking->student->name;

        $otherRole = $isLearner ? 'teacher' : 'learner';

        return (new MailMessage)
            ->subject("⚠️ Your Session Has Started - Please Join Now!")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!")
            ->line("🚨 **Your session started {$this->minutesLate} minutes ago!**")
            ->line("Your {$otherRole} ({$otherParty}) is waiting for you.")
            ->line("**Session Details:**")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- Started at: {$this->booking->start_time->format('h:i A')}")
            ->line("---")
            ->line("⏰ **Important:** If you don't join within the next 5 minutes, you may be marked as a no-show.")
            ->line($isLearner 
                ? "No-shows may forfeit up to 50% of the session fee."
                : "No-show teachers will result in a full refund.")
            ->action('Join Session Now', url("/classroom/{$this->booking->id}"))
            ->line("Please join immediately to avoid penalties.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'no_show_warning',
            'booking_id' => $this->booking->id,
            'role' => $this->role,
            'minutes_late' => $this->minutesLate,
            'subject' => $this->booking->subject->name,
            'message' => "⚠️ Your {$this->booking->subject->name} session started {$this->minutesLate} minutes ago. Join now!",
        ];
    }
}
