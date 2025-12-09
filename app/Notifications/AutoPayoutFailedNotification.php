<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AutoPayoutFailedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(
        public int $teacherId,
        public string $reason
    ) {
        //
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Auto-Payout Failed ⚠️',
            'message' => 'Automatic payout for Teacher #' . $this->teacherId . ' failed: ' . $this->reason,
            'teacher_id' => $this->teacherId,
            'reason' => $this->reason,
            'type' => 'auto_payout_failed',
            'action_url' => '/admin/payments?tab=teacher-payouts',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Auto-Payout Failed ⚠️',
            'message' => 'Automatic payout for Teacher #' . $this->teacherId . ' failed',
            'teacher_id' => $this->teacherId,
            'reason' => $this->reason,
            'type' => 'auto_payout_failed',
            'action_url' => '/admin/payments?tab=teacher-payouts',
        ]);
    }
}
