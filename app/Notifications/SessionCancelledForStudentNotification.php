<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class SessionCancelledForStudentNotification extends Notification implements ShouldQueue
{
    use Queueable, RespectsNotificationPreferences;

    protected Booking $booking;
    protected string $cancelledBy; // 'Teacher' or 'Guardian'

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking, string $cancelledBy = 'Guardian')
    {
        $this->booking = $booking;
        $this->cancelledBy = $cancelledBy;
        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return $this->getChannels($notifiable, 'session');
    }

    public function toMail(object $notifiable): MailMessage
    {
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.timezone'))->format('h:i A');

        return (new MailMessage)
            ->subject("Session Cancelled - {$sessionDate}")
            ->greeting("Salaam, {$notifiable->name}!")
            ->line("This is to let you know that your session with Ustadh {$this->booking->teacher->user->name} has been cancelled by your {$this->cancelledBy}.")
            ->line("**Session Details:**")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- Date: {$sessionDate}")
            ->line("- Time: {$sessionTime}")
            ->line("---")
            ->line("Please check with your {$this->cancelledBy} for more details or to reschedule.")
            ->action('View My Dashboard', url('/student/dashboard'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'session_cancelled_for_student',
            'booking_id' => $this->booking->id,
            'cancelled_by' => $this->cancelledBy,
            'teacher_name' => $this->booking->teacher->user->name,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j'),
            'message' => "Your {$this->booking->subject->name} session on {$this->booking->start_time->format('M j')} has been cancelled.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'session_cancelled_for_student',
            'title' => 'Class Cancelled',
            'message' => "Your class for {$this->booking->subject->name} has been cancelled.",
            'booking_id' => $this->booking->id,
        ]);
    }
}
