<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DisputeRaisedNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isAdmin = $notifiable->role === 'admin';
        $subject = $isAdmin 
            ? "New Dispute Raised - Booking #{$this->booking->id}"
            : "Dispute Raised for Your Session - IqraQuest";

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting("Assalamu Alaikum, {$notifiable->name}!");

        if ($isAdmin) {
            $mail->line("A new dispute has been raised that requires your attention.")
                ->line("**Booking Details:**")
                ->line("- Booking ID: #{$this->booking->id}")
                ->line("- Student: {$this->booking->student->name}")
                ->line("- Teacher: {$this->booking->teacher->user->name}")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Date: {$this->booking->start_time->format('M j, Y')}")
                ->line("- Amount: {$this->booking->currency} " . number_format($this->booking->total_price, 2))
                ->line("**Dispute Reason:**")
                ->line($this->booking->dispute_reason)
                ->action('Review Dispute', url('/admin/disputes'));
        } else {
            $mail->line("A student has raised a dispute for one of your sessions.")
                ->line("**Session Details:**")
                ->line("- Student: {$this->booking->student->name}")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Date: {$this->booking->start_time->format('M j, Y')}")
                ->line("**Dispute Reason:**")
                ->line($this->booking->dispute_reason)
                ->line("Our team will review this dispute and contact you if needed. Funds will remain held until the dispute is resolved.");
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'dispute_raised',
            'booking_id' => $this->booking->id,
            'student_name' => $this->booking->student->name,
            'teacher_name' => $this->booking->teacher->user->name,
            'subject' => $this->booking->subject->name,
            'reason' => $this->booking->dispute_reason,
            'amount' => $this->booking->total_price,
            'currency' => $this->booking->currency,
            'message' => "Dispute raised for booking #{$this->booking->id}",
        ];
    }
}
