<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DisputeResolvedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Booking $booking;
    protected string $outcome; // 'teacher', 'student', 'partial'
    protected ?float $percentage;
    protected bool $isStudent;

    public function __construct(Booking $booking, string $outcome, ?float $percentage, bool $isStudent)
    {
        $this->booking = $booking;
        $this->outcome = $outcome;
        $this->percentage = $percentage;
        $this->isStudent = $isStudent;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Dispute Resolved - Booking #{$this->booking->id}")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!");

        $currency = $this->booking->currency ?? 'NGN';
        $amount = number_format($this->booking->total_price, 2);

        if ($this->outcome === 'teacher') {
            if ($this->isStudent) {
                $mail->line("Your dispute for booking #{$this->booking->id} has been reviewed and resolved.")
                    ->line("After careful review, the funds have been released to the teacher.")
                    ->line("**Resolution:** {$this->booking->dispute_resolution}");
            } else {
                $mail->line("Good news! The dispute for booking #{$this->booking->id} has been resolved in your favor.")
                    ->line("The funds ({$currency} {$amount}) have been released to your wallet.")
                    ->line("**Resolution:** {$this->booking->dispute_resolution}");
            }
        } elseif ($this->outcome === 'student') {
            if ($this->isStudent) {
                $mail->line("Good news! Your dispute for booking #{$this->booking->id} has been resolved in your favor.")
                    ->line("A full refund of {$currency} {$amount} has been credited to your wallet.")
                    ->line("**Resolution:** {$this->booking->dispute_resolution}");
            } else {
                $mail->line("The dispute for booking #{$this->booking->id} has been reviewed and resolved.")
                    ->line("After careful review, the funds have been refunded to the student.")
                    ->line("**Resolution:** {$this->booking->dispute_resolution}");
            }
        } else {
            // Partial
            $teacherAmount = ($this->booking->total_price * $this->percentage) / 100;
            $studentAmount = $this->booking->total_price - $teacherAmount;

            if ($this->isStudent) {
                $mail->line("Your dispute for booking #{$this->booking->id} has been resolved with a partial refund.")
                    ->line("**Refund Amount:** {$currency} " . number_format($studentAmount, 2))
                    ->line("**Resolution:** {$this->booking->dispute_resolution}");
            } else {
                $mail->line("The dispute for booking #{$this->booking->id} has been resolved with a partial payment.")
                    ->line("**Amount Released:** {$currency} " . number_format($teacherAmount, 2))
                    ->line("**Resolution:** {$this->booking->dispute_resolution}");
            }
        }

        $mail->line("If you have any questions, please contact our support team.");

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'dispute_resolved',
            'booking_id' => $this->booking->id,
            'outcome' => $this->outcome,
            'percentage' => $this->percentage,
            'resolution' => $this->booking->dispute_resolution,
            'message' => "Dispute for booking #{$this->booking->id} has been resolved.",
        ];
    }
}
