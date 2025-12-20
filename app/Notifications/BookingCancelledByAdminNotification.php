<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelledByAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Booking $booking;
    protected string $reason;
    protected string $recipientType; // 'student' or 'teacher'

    public function __construct(Booking $booking, string $reason, string $recipientType)
    {
        $this->booking = $booking;
        $this->reason = $reason;
        $this->recipientType = $recipientType;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->format('h:i A') . ' - ' . $this->booking->end_time->format('h:i A');
        $currency = $this->booking->currency ?? 'NGN';

        $mail = (new MailMessage)
            ->subject("Booking Cancelled - {$sessionDate}")
            ->greeting("Assalamu Alaikum, {$notifiable->name}!");

        if ($this->recipientType === 'student') {
            $mail->line("Your upcoming class has been cancelled by the administrator.")
                ->line("**Session Details:**")
                ->line("- Teacher: {$this->booking->teacher->user->name}")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Date: {$sessionDate}")
                ->line("- Time: {$sessionTime}")
                ->line("---")
                ->line("**Reason:** {$this->reason}");

            if ($this->booking->payment_status === 'refunded') {
                $mail->line("---")
                    ->line("**Refund Information:**")
                    ->line("A full refund of {$currency} " . number_format($this->booking->total_price, 2) . " has been processed to your wallet.");
            }

            $mail->action('View My Bookings', url('/student/dashboard'))
                ->line('We apologize for any inconvenience. Please feel free to book another session.');
        } else {
            // Teacher notification
            $mail->line("A scheduled class has been cancelled by the administrator.")
                ->line("**Session Details:**")
                ->line("- Student: {$this->booking->student->name}")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Date: {$sessionDate}")
                ->line("- Time: {$sessionTime}")
                ->line("---")
                ->line("**Reason:** {$this->reason}")
                ->line("---")
                ->line("This time slot is now available for other bookings.")
                ->action('View Schedule', url('/teacher/schedule'));
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        if ($this->recipientType === 'student') {
            return [
                'type' => 'booking_cancelled_by_admin',
                'booking_id' => $this->booking->id,
                'teacher_name' => $this->booking->teacher->user->name,
                'subject' => $this->booking->subject->name,
                'session_date' => $this->booking->start_time->format('M j, Y'),
                'session_time' => $this->booking->start_time->format('h:i A'),
                'reason' => $this->reason,
                'refunded' => $this->booking->payment_status === 'refunded',
                'message' => "Your {$this->booking->subject->name} class on {$this->booking->start_time->format('M j')} has been cancelled.",
            ];
        }

        return [
            'type' => 'booking_cancelled_by_admin',
            'booking_id' => $this->booking->id,
            'student_name' => $this->booking->student->name,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'session_time' => $this->booking->start_time->format('h:i A'),
            'reason' => $this->reason,
            'message' => "Your class with {$this->booking->student->name} on {$this->booking->start_time->format('M j')} has been cancelled.",
        ];
    }
}
