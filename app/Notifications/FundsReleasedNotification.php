<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FundsReleasedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Booking $booking;
    protected float $amount;

    public function __construct(Booking $booking, float $amount)
    {
        $this->booking = $booking;
        $this->amount = $amount;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $currency = $this->booking->currency ?? 'NGN';
        $formattedAmount = number_format($this->amount, 2);

        return (new MailMessage)
            ->subject('Payment Released - IqraQuest')
            ->greeting("Assalamu Alaikum, {$notifiable->name}!")
            ->line("Great news! Your earnings from the session have been released to your wallet.")
            ->line("**Session Details:**")
            ->line("- Student: {$this->booking->student->name}")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- Date: {$this->booking->start_time->format('M j, Y')}")
            ->line("- Time: {$this->booking->start_time->format('h:i A')} - {$this->booking->end_time->format('h:i A')}")
            ->line("**Amount Credited:** {$currency} {$formattedAmount}")
            ->action('View Wallet', url('/teacher/wallet'))
            ->line('Thank you for teaching with IqraQuest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'funds_released',
            'booking_id' => $this->booking->id,
            'amount' => $this->amount,
            'currency' => $this->booking->currency ?? 'NGN',
            'student_name' => $this->booking->student->name,
            'subject' => $this->booking->subject->name,
            'message' => "Your earnings of {$this->booking->currency} " . number_format($this->amount, 2) . " have been released to your wallet.",
        ];
    }
}
