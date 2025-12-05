<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WalletCredited implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $connection = 'sync';

    public int $userId;
    public float $amount;
    public float $newBalance;
    public string $gateway;
    public string $reference;

    /**
     * Create a new event instance.
     */
    public function __construct(
        int $userId,
        float $amount,
        float $newBalance,
        string $gateway,
        string $reference
    ) {
        $this->userId = $userId;
        $this->amount = $amount;
        $this->newBalance = $newBalance;
        $this->gateway = $gateway;
        $this->reference = $reference;
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
        return 'wallet.credited';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'amount' => $this->amount,
            'newBalance' => $this->newBalance,
            'gateway' => $this->gateway,
            'reference' => $this->reference,
            'message' => "₦" . number_format($this->amount, 2) . " credited to your wallet!",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
