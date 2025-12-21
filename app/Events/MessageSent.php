<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;
    public User $sender;

    public function __construct(Message $message)
    {
        $this->message = $message;
        $this->sender = $message->sender;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'avatar' => $this->sender->avatar,
            ],
            'content' => $this->message->content,
            'type' => $this->message->type,
            'file_url' => $this->message->file_url,
            'file_name' => $this->message->file_name,
            'file_type' => $this->message->file_type,
            'file_size' => $this->message->formatted_file_size,
            'created_at' => $this->message->created_at->toIso8601String(),
            'created_at_human' => $this->message->created_at->diffForHumans(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
