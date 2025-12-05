<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PayoutStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $connection = 'sync';

    public int $userId;
    public int $payoutId;
    public float $amount;
    public string $status;
    public string $message;

    /**
     * Create a new event instance.
     */
    public function __construct(
        int $userId,
        int $payoutId,
        float $amount,
        string $status,
        string $message
    ) {
        $this->userId = $userId;
        $this->payoutId = $payoutId;
        $this->amount = $amount;
        $this->status = $status;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'payout.status.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'payoutId' => $this->payoutId,
            'amount' => $this->amount,
            'status' => $this->status,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
