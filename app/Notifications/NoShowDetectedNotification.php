<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NoShowDetectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Booking $booking;
    protected string $noShowType; // 'student' (learner/guardian), 'teacher', 'both'
    protected bool $isLearner; // true if recipient is student/guardian who booked

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking, string $noShowType, bool $isLearner)
    {
        $this->booking = $booking;
        $this->noShowType = $noShowType;
        $this->isLearner = $isLearner;

        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $currency = $this->booking->currency ?? 'NGN';
        $amount = number_format($this->booking->total_price, 2);

        $mail = (new MailMessage)
            ->subject("Session Cancelled - No-Show Detected")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!");

        if ($this->noShowType === 'both') {
            $mail->line("Unfortunately, neither party joined the scheduled session.")
                ->line("**Session Details:**")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Scheduled: {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('M j, Y')} at {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('g:i A')}");

            if ($this->isLearner) {
                $mail->line("---")
                    ->line("**Refund:** A full refund of {$currency} {$amount} has been credited to your wallet.");
            }
        } elseif ($this->noShowType === 'teacher') {
            if ($this->isLearner) {
                $mail->line("We apologize - your teacher did not join the scheduled session.")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Teacher: {$this->booking->teacher->user->name}")
                    ->line("- Scheduled: {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('M j, Y')} at {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('g:i A')}")
                    ->line("---")
                    ->line("**Full Refund:** {$currency} {$amount} has been credited to your wallet.")
                    ->line("We sincerely apologize for this inconvenience.");
            } else {
                $mail->line("⚠️ **You missed your scheduled session.**")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Booked by: {$this->booking->getStudentDisplayName()}")
                    ->line("- Scheduled: {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('M j, Y')} at {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('g:i A')}")
                    ->line("---")
                    ->line("**Consequence:** A full refund has been issued.")
                    ->line("Please ensure you join sessions on time to maintain your reputation.");
            }
        } elseif ($this->noShowType === 'student') {
            if ($this->isLearner) {
                $mail->line("⚠️ **The session was missed.**")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Teacher: {$this->booking->teacher->user->name}")
                    ->line("- Scheduled: {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('M j, Y')} at {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('g:i A')}")
                    ->line("---")
                    ->line("**No-show policy:** The session is cancelled. The full amount ({$currency} {$amount}) will be refunded to your wallet after processing completes.")
                    ->line("---")
                    ->line("Please join on time next time, or cancel in advance if you cannot attend.");
            } else {
                $mail->line("The learner did not join the scheduled session within the grace period.")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Booked by: {$this->booking->getStudentDisplayName()}")
                    ->line("- Scheduled: {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('M j, Y')} at {$this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('g:i A')}")
                    ->line("---")
                    ->line("**Outcome:** The booking is cancelled. There is **no payment** for this session when the learner does not join.")
                    ->line("Thank you for being ready to teach.");
            }
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        $message = match ($this->noShowType) {
            'teacher' => $this->isLearner
            ? "Your teacher didn't show up. Full refund processed."
            : "You missed your session. Full refund issued.",
            'student' => $this->isLearner
            ? "Session missed. Full refund will be processed."
            : "Learner didn't show up. Session cancelled; no payment.",
            'both' => "Neither party joined. Session cancelled.",
        };

        return [
            'type' => 'no_show_detected',
            'booking_id' => $this->booking->id,
            'no_show_type' => $this->noShowType,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->setTimezone($notifiable->timezone ?? config('app.display_timezone'))->format('M j, Y'),
            'message' => $message,
        ];
    }
}

