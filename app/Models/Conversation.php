<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_one_id',
        'user_two_id',
        'is_admin_conversation',
        'last_message_at',
    ];

    protected $casts = [
        'is_admin_conversation' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    // Relationships
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    // Get the other participant in the conversation
    public function getOtherUser(User $currentUser): User
    {
        return $this->user_one_id === $currentUser->id 
            ? $this->userTwo 
            : $this->userOne;
    }

    // Check if user is participant
    public function hasParticipant(User $user): bool
    {
        return $this->user_one_id === $user->id || $this->user_two_id === $user->id;
    }

    // Get unread count for a user
    public function getUnreadCountFor(User $user): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    // Mark all messages as read for a user
    public function markAsReadFor(User $user): void
    {
        $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    // Find or create conversation between two users
    public static function findOrCreateBetween(User $userOne, User $userTwo, ?int $bookingId = null, bool $isAdmin = false): self
    {
        // Ensure consistent ordering (lower ID first)
        $firstId = min($userOne->id, $userTwo->id);
        $secondId = max($userOne->id, $userTwo->id);

        return self::firstOrCreate(
            [
                'user_one_id' => $firstId,
                'user_two_id' => $secondId,
                'booking_id' => $bookingId,
            ],
            [
                'is_admin_conversation' => $isAdmin,
            ]
        );
    }

    // Get conversations for a user
    public static function forUser(User $user)
    {
        return self::where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id);
    }

    // Scope for booking-based conversations
    public function scopeWithBooking($query)
    {
        return $query->whereNotNull('booking_id');
    }

    // Scope for admin conversations
    public function scopeAdminConversations($query)
    {
        return $query->where('is_admin_conversation', true);
    }
}
