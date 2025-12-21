<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SessionReminderNotification extends Notification implements ShouldQueue
{
    use Queueable, RespectsNotificationPreferences;

    protected Booking $booking;
    protected string $reminderType; // '24h', '1h', '15m'
    protected bool $isStudent;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking, string $reminderType, bool $isStudent)
    {
        $this->booking = $booking;
        $this->reminderType = $reminderType;
        $this->isStudent = $isStudent;

        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return $this->getChannels($notifiable, 'session');
    }

    public function toMail(object $notifiable): MailMessage
    {
        $timeLabel = $this->getTimeLabel();
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->format('h:i A');
        $endTime = $this->booking->end_time->format('h:i A');

        $otherParty = $this->isStudent
            ? $this->booking->teacher->user->name
            : $this->booking->student->name;

        $role = $this->isStudent ? 'teacher' : 'student';

        $mail = (new MailMessage)
            ->subject("⏰ Session Reminder - {$timeLabel}")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!");

        if ($this->reminderType === '15m') {
            $mail->line("🔔 **Your session starts in 15 minutes!**");
        } elseif ($this->reminderType === '1h') {
            $mail->line("🔔 **Your session starts in 1 hour!**");
        } else {
            $mail->line("🔔 **Reminder: You have a session tomorrow!**");
        }

        $mail->line("**Session Details:**")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- " . ucfirst($role) . ": {$otherParty}")
            ->line("- Date: {$sessionDate}")
            ->line("- Time: {$sessionTime} - {$endTime}");

        if ($this->reminderType === '15m' || $this->reminderType === '1h') {
            $mail->line("---")
                ->line("**Preparation Tips:**")
                ->line("✓ Ensure stable internet connection")
                ->line("✓ Test your camera and microphone")
                ->line("✓ Find a quiet space for learning");
        }

        $mail->action('Join Session', url("/classroom/{$this->booking->id}"))
            ->line("We look forward to a productive session!");

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        $timeLabel = $this->getTimeLabel();
        $otherParty = $this->isStudent
            ? $this->booking->teacher->user->name
            : $this->booking->student->name;

        return [
            'type' => 'session_reminder',
            'booking_id' => $this->booking->id,
            'reminder_type' => $this->reminderType,
            'subject' => $this->booking->subject->name,
            'other_party' => $otherParty,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'session_time' => $this->booking->start_time->format('h:i A'),
            'message' => "Your {$this->booking->subject->name} session starts {$timeLabel}.",
        ];
    }

    /**
     * Get human-readable time label
     */
    protected function getTimeLabel(): string
    {
        return match ($this->reminderType) {
            '24h' => 'tomorrow',
            '1h' => 'in 1 hour',
            '15m' => 'in 15 minutes',
            default => 'soon',
        };
    }
}

