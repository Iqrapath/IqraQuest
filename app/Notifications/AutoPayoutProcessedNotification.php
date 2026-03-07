<?php

namespace App\Notifications;

use App\Models\Payout;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AutoPayoutProcessedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public Payout $payout)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Auto-Payout Processed 💰',
            'message' => 'Your automatic payout of ₦' . number_format($this->payout->amount, 2) . ' has been processed successfully.',
            'payout_id' => $this->payout->id,
            'amount' => $this->payout->amount,
            'status' => $this->payout->status,
            'type' => 'auto_payout_processed',
            'action_url' => '/teacher/earnings',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Auto-Payout Processed 💰',
            'message' => 'Your automatic payout of ₦' . number_format($this->payout->amount, 2) . ' has been processed successfully.',
            'payout_id' => $this->payout->id,
            'amount' => $this->payout->amount,
            'status' => $this->payout->status,
            'type' => 'auto_payout_processed',
            'action_url' => '/teacher/earnings',
        ]);
    }
}
