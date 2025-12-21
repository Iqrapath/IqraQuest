<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable, RespectsNotificationPreferences;

    protected Booking $booking;
    protected string $recipientType; // 'student' or 'teacher'

    public function __construct(Booking $booking, string $recipientType)
    {
        $this->booking = $booking;
        $this->recipientType = $recipientType;
    }

    public function via(object $notifiable): array
    {
        return $this->getChannels($notifiable, 'session');
    }

    public function toMail(object $notifiable): MailMessage
    {
        $sessionDate = $this->booking->start_time->format('l, M j, Y');
        $sessionTime = $this->booking->start_time->format('h:i A') . ' - ' . $this->booking->end_time->format('h:i A');
        $currency = $this->booking->currency ?? 'NGN';

        $mail = (new MailMessage)
            ->greeting("Assalamu Alaikum, {$notifiable->name}!");

        if ($this->recipientType === 'student') {
            $mail->subject("Booking Confirmed - {$sessionDate}")
                ->line("Great news! Your booking has been approved and confirmed.")
                ->line("**Session Details:**")
                ->line("- Teacher: {$this->booking->teacher->user->name}")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Date: {$sessionDate}")
                ->line("- Time: {$sessionTime}")
                ->line("- Amount: {$currency} " . number_format($this->booking->total_price, 2))
                ->line("---")
                ->line("**Meeting Link:** Will be available on your dashboard 15 minutes before the session.")
                ->action('View My Bookings', url('/student/dashboard'))
                ->line('JazakaAllahu Khair for learning with IqraQuest!');
        } else {
            // Teacher notification
            $mail->subject("New Confirmed Booking - {$sessionDate}")
                ->line("A booking has been confirmed for you.")
                ->line("**Session Details:**")
                ->line("- Student: {$this->booking->student->name}")
                ->line("- Subject: {$this->booking->subject->name}")
                ->line("- Date: {$sessionDate}")
                ->line("- Time: {$sessionTime}")
                ->line("- Your Earnings: {$currency} " . number_format($this->booking->calculateTeacherEarnings(), 2))
                ->line("---")
                ->line("Please ensure you are available at the scheduled time.")
                ->action('View Schedule', url('/teacher/schedule'))
                ->line('JazakaAllahu Khair for teaching with IqraQuest!');
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        if ($this->recipientType === 'student') {
            return [
                'type' => 'booking_approved',
                'booking_id' => $this->booking->id,
                'teacher_name' => $this->booking->teacher->user->name,
                'subject' => $this->booking->subject->name,
                'session_date' => $this->booking->start_time->format('M j, Y'),
                'session_time' => $this->booking->start_time->format('h:i A'),
                'message' => "Your {$this->booking->subject->name} class with {$this->booking->teacher->user->name} is confirmed!",
            ];
        }

        return [
            'type' => 'booking_approved',
            'booking_id' => $this->booking->id,
            'student_name' => $this->booking->student->name,
            'subject' => $this->booking->subject->name,
            'session_date' => $this->booking->start_time->format('M j, Y'),
            'session_time' => $this->booking->start_time->format('h:i A'),
            'message' => "New confirmed booking with {$this->booking->student->name} for {$this->booking->subject->name}.",
        ];
    }
}
