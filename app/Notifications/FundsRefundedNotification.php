<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Traits\RespectsNotificationPreferences;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FundsRefundedNotification extends Notification implements ShouldQueue
{
    use Queueable, RespectsNotificationPreferences;

    protected Booking $booking;
    protected float $amount;
    protected string $reason;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(Booking $booking, float $amount, string $reason)
    {
        $this->booking = $booking;
        $this->amount = $amount;
        $this->reason = $reason;
        
        $this->delay(now()->addSeconds(5));
    }

    public function via(object $notifiable): array
    {
        return $this->getChannels($notifiable, 'payment');
    }

    public function toMail(object $notifiable): MailMessage
    {
        $currency = $this->booking->currency ?? 'NGN';
        $formattedAmount = number_format($this->amount, 2);

        return (new MailMessage)
            ->subject('Refund Processed - IqraQuest')
            ->greeting("Assalamu Alaikum, {$notifiable->name}!")
            ->line("A refund has been processed to your wallet.")
            ->line("**Booking Details:**")
            ->line("- Teacher: {$this->booking->teacher->user->name}")
            ->line("- Subject: {$this->booking->subject->name}")
            ->line("- Date: {$this->booking->start_time->format('M j, Y')}")
            ->line("**Refund Amount:** {$currency} {$formattedAmount}")
            ->line("**Reason:** {$this->reason}")
            ->action('View Wallet', url('/wallet'))
            ->line('If you have any questions, please contact our support team.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'funds_refunded',
            'booking_id' => $this->booking->id,
            'amount' => $this->amount,
            'currency' => $this->booking->currency ?? 'NGN',
            'reason' => $this->reason,
            'teacher_name' => $this->booking->teacher->user->name,
            'subject' => $this->booking->subject->name,
            'message' => "Refund of {$this->booking->currency} " . number_format($this->amount, 2) . " has been credited to your wallet.",
        ];
    }
}
