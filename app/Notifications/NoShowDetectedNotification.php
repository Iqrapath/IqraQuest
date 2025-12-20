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
                ->line("- Scheduled: {$this->booking->start_time->format('M j, Y')} at {$this->booking->start_time->format('h:i A')}");

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
                    ->line("- Scheduled: {$this->booking->start_time->format('M j, Y')} at {$this->booking->start_time->format('h:i A')}")
                    ->line("---")
                    ->line("**Full Refund:** {$currency} {$amount} has been credited to your wallet.")
                    ->line("We sincerely apologize for this inconvenience.");
            } else {
                $mail->line("⚠️ **You missed your scheduled session.**")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Booked by: {$this->booking->student->name}")
                    ->line("- Scheduled: {$this->booking->start_time->format('M j, Y')} at {$this->booking->start_time->format('h:i A')}")
                    ->line("---")
                    ->line("**Consequence:** A full refund has been issued.")
                    ->line("Please ensure you join sessions on time to maintain your reputation.");
            }
        } elseif ($this->noShowType === 'student') {
            $teacherAmount = $this->booking->total_price * 0.5;
            $teacherEarnings = $teacherAmount * (1 - ($this->booking->commission_rate ?? 15) / 100);

            if ($this->isLearner) {
                $refundAmount = $this->booking->total_price * 0.5;
                $mail->line("⚠️ **The session was missed.**")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Teacher: {$this->booking->teacher->user->name}")
                    ->line("- Scheduled: {$this->booking->start_time->format('M j, Y')} at {$this->booking->start_time->format('h:i A')}")
                    ->line("---")
                    ->line("**No-Show Policy Applied:**")
                    ->line("- 50% refund: {$currency} " . number_format($refundAmount, 2) . " credited to your wallet")
                    ->line("- 50% paid to teacher as compensation for their time")
                    ->line("---")
                    ->line("Please ensure sessions are joined on time or cancelled in advance.");
            } else {
                $mail->line("The learner did not join the scheduled session.")
                    ->line("**Session Details:**")
                    ->line("- Subject: {$this->booking->subject->name}")
                    ->line("- Booked by: {$this->booking->student->name}")
                    ->line("- Scheduled: {$this->booking->start_time->format('M j, Y')} at {$this->booking->start_time->format('h:i A')}")
                    ->line("---")
                    ->line("**Compensation:** {$currency} " . number_format($teacherEarnings, 2) . " has been credited to your wallet (50% of session fee, after commission).")
                    ->line("Thank you for being ready for the session.");
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
                ? "Session missed. 50% refund processed."
                : "Learner didn't show up. You received 50% compensation.",
            'both' => "Neither party joined. Session cancelled.",
        };

        return [
            'type' => 'no_show_detected',
            'booking_id' => $this->booking->id,
            'no_show_type' => $this->noShowType,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'message' => $message,
        ];
    }
}

