<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingCancelledByTeacherNotification extends Notification implements ShouldQueue
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
        $teacherName = $this->booking->teacher->user->name;
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('h:i A') . ' - ' . $this->booking->end_time->format('h:i A');

        return (new MailMessage)
            ->subject("Session Cancelled by Teacher - {$sessionDate}")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!")
            ->line("Your upcoming session has been cancelled by the teacher.")
            ->line("**Session Details:**")
            ->line("- Teacher: {$teacherName}")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- Date: {$sessionDate}")
            ->line("- Time: {$sessionTime}")
            ->line("---")
            ->line("**Reason:** " . ($this->booking->cancellation_reason ?? 'Teacher unavailable'))
            ->line("---")
            ->line("**Refund Status:** A full refund has been processed to your wallet.")
            ->action('Find Another Teacher', url('/teachers'))
            ->line("We apologize for any inconvenience caused.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking_cancelled_by_teacher',
            'booking_id' => $this->booking->id,
            'teacher_name' => $this->booking->teacher->user->name,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'message' => "Ustadh {$this->booking->teacher->user->name} cancelled your {$this->booking->subject->name} session on {$this->booking->start_time->format('M j')}.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'booking_cancelled_by_teacher',
            'title' => 'Session Cancelled',
            'message' => "Ustadh {$this->booking->teacher->user->name} cancelled your {$this->booking->subject->name} session.",
            'booking_id' => $this->booking->id,
        ]);
    }
}
