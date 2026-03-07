<?php

namespace App\Events;

use App\Models\Teacher;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeacherUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $teacher;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Teacher $teacher, $message = null)
    {
        $this->teacher = $teacher;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->teacher->user_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'teacher.updated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->teacher->id,
            'status' => $this->teacher->status,
            'video_verification_status' => $this->teacher->video_verification_status,
            'video_verification_scheduled_at' => $this->teacher->video_verification_scheduled_at,
            'message' => $this->message,
        ];
    }
}
