<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelledByStudentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Booking $booking;
    protected array $refundInfo;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking, array $refundInfo)
    {
        $this->booking = $booking;
        $this->refundInfo = $refundInfo;
        
        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $currency = $this->booking->currency ?? 'NGN';
        $studentName = $this->booking->student->name;
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->format('h:i A') . ' - ' . $this->booking->end_time->format('h:i A');

        $mail = (new MailMessage)
            ->subject("Session Cancelled - {$sessionDate}")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!")
            ->line("A student has cancelled their upcoming session with you.")
            ->line("**Session Details:**")
            ->line("- Student: {$studentName}")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- Date: {$sessionDate}")
            ->line("- Time: {$sessionTime}");

        if ($this->booking->cancellation_reason) {
            $mail->line("**Reason:** {$this->booking->cancellation_reason}");
        }

        // Show compensation info if teacher gets any payment
        if ($this->refundInfo['fee'] > 0) {
            $feeFormatted = number_format($this->refundInfo['fee'], 2);
            $teacherEarnings = $this->refundInfo['fee'] * (1 - ($this->booking->commission_rate ?? 15) / 100);
            $earningsFormatted = number_format($teacherEarnings, 2);
            
            $mail->line("---")
                ->line("**Cancellation Compensation:**")
                ->line("Due to late cancellation, you will receive {$currency} {$earningsFormatted} (after platform commission).");
        }

        $mail->line("---")
            ->line("This time slot is now available for other students to book.")
            ->action('View Schedule', url('/teacher/dashboard'));

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking_cancelled_by_student',
            'booking_id' => $this->booking->id,
            'student_name' => $this->booking->student->name,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'session_time' => $this->booking->start_time->format('h:i A'),
            'cancellation_reason' => $this->booking->cancellation_reason,
            'compensation_amount' => $this->refundInfo['fee'],
            'message' => "{$this->booking->student->name} cancelled their {$this->booking->subject->name} session on {$this->booking->start_time->format('M j')}.",
        ];
    }
}
