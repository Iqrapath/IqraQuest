<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingCancelledByGuardianNotification extends Notification implements ShouldQueue
{
    use Queueable, RespectsNotificationPreferences;

    protected Booking $booking;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return $this->getChannels($notifiable, 'session');
    }

    public function toMail(object $notifiable): MailMessage
    {
        $guardianName = $this->booking->student->name;
        $studentName = $this->booking->child ? $this->booking->child->user->name : $guardianName;
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('h:i A') . ' - ' . $this->booking->end_time->format('h:i A');

        $mail = (new MailMessage)
            ->subject("Session Cancelled - {$sessionDate}")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!")
            ->line("A guardian has cancelled their upcoming session with you.")
            ->line("**Session Details:**")
            ->line("- Guardian: {$guardianName}");

        if ($this->booking->child) {
            $mail->line("- Student: {$studentName}");
        }

        $mail->line("- Subject: {$this->booking->subject->name}")
            ->line("- Date: {$sessionDate}")
            ->line("- Time: {$sessionTime}");

        if ($this->booking->cancellation_reason) {
            $mail->line("---")
                ->line("**Reason:** {$this->booking->cancellation_reason}");
        }

        $mail->line("---")
            ->line("This time slot is now available for other students to book.")
            ->action('View Schedule', url('/teacher/dashboard'));

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking_cancelled_by_guardian',
            'booking_id' => $this->booking->id,
            'guardian_name' => $this->booking->student->name,
            'student_name' => $this->booking->child ? $this->booking->child->user->name : null,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'message' => "Guardian {$this->booking->student->name} cancelled the {$this->booking->subject->name} session on {$this->booking->start_time->format('M j')}.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'booking_cancelled_by_guardian',
            'title' => 'Session Cancelled',
            'message' => "The session for {$this->booking->subject->name} has been cancelled by the guardian.",
            'booking_id' => $this->booking->id,
        ]);
    }
}
