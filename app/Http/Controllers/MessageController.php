<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\NewMessageReceived;
use App\Events\UserTyping;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display messages page with conversations list
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $conversations = $this->getConversationsForUser($user);
        
        // Get selected conversation if provided
        $selectedConversation = null;
        $messages = [];
        
        if ($request->has('conversation')) {
            $selectedConversation = Conversation::with(['userOne', 'userTwo', 'booking.subject'])
                ->find($request->conversation);
            
            if ($selectedConversation && $selectedConversation->hasParticipant($user)) {
                // Mark messages as read
                $selectedConversation->markAsReadFor($user);
                
                // Get messages
                $messages = $selectedConversation->messages()
                    ->with('sender:id,name,avatar')
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(fn($msg) => $this->formatMessage($msg, $user));
                
                $selectedConversation = $this->formatConversation($selectedConversation, $user);
            }
        }
        
        // Determine which page to render based on user role
        $page = match(true) {
            $user->isAdmin() => 'Admin/Messages/Index',
            $user->isTeacher() => 'Teacher/Messages/Index',
            $user->isGuardian() => 'Guardian/Messages/Index',
            default => 'Student/Messages/Index',
        };
        
        return Inertia::render($page, [
            'conversations' => $conversations,
            'selectedConversation' => $selectedConversation,
            'messages' => $messages,
        ]);
    }

    /**
     * Get messages for a specific conversation
     */
    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        // Verify user is participant
        if (!$conversation->hasParticipant($user)) {
            abort(403, 'You are not a participant in this conversation.');
        }
        
        // Mark messages as read
        $conversation->markAsReadFor($user);
        
        // Get messages with pagination
        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        
        $formattedMessages = $messages->through(fn($msg) => $this->formatMessage($msg, $user));
        
        return response()->json([
            'conversation' => $this->formatConversation($conversation->load(['userOne', 'userTwo', 'booking.subject']), $user),
            'messages' => $formattedMessages,
        ]);
    }

    /**
     * Send a new message
     */
    public function store(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        // Verify user is participant
        if (!$conversation->hasParticipant($user)) {
            abort(403, 'You are not a participant in this conversation.');
        }
        
        $validated = $request->validate([
            'content' => 'required_without:file|nullable|string|max:5000',
            'file' => 'nullable|file|max:10240', // 10MB max
            'type' => 'nullable|in:text,image,file,audio',
        ]);
        
        $messageData = [
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['content'] ?? null,
            'type' => $validated['type'] ?? 'text',
        ];
        
        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('messages/' . $conversation->id, 'public');
            
            $messageData['file_path'] = $path;
            $messageData['file_name'] = $file->getClientOriginalName();
            $messageData['file_type'] = $file->getMimeType();
            $messageData['file_size'] = $file->getSize();
            
            // Determine type based on mime
            if (str_starts_with($file->getMimeType(), 'image/')) {
                $messageData['type'] = 'image';
            } elseif (str_starts_with($file->getMimeType(), 'audio/')) {
                $messageData['type'] = 'audio';
            } else {
                $messageData['type'] = 'file';
            }
        }
        
        $message = Message::create($messageData);
        
        // Update conversation last_message_at
        $conversation->update(['last_message_at' => now()]);
        
        // Broadcast the message to the conversation channel
        broadcast(new MessageSent($message->load('sender')))->toOthers();
        
        // Broadcast to the recipient's user channel for the message bell
        $recipient = $conversation->getOtherUser($user);
        broadcast(new NewMessageReceived($message->load('sender'), $recipient));
        
        return response()->json([
            'message' => $this->formatMessage($message->load('sender'), $user),
        ]);
    }

    /**
     * Start a conversation from a booking
     */
    public function startFromBooking(Request $request, Booking $booking)
    {
        $user = $request->user();
        
        // Verify user has access to this booking
        $isStudent = $booking->user_id === $user->id;
        $isTeacher = $booking->teacher && $booking->teacher->user_id === $user->id;
        
        if (!$isStudent && !$isTeacher && !$user->isAdmin()) {
            abort(403, 'You do not have access to this booking.');
        }
        
        // Determine the other participant
        $otherUser = $isStudent 
            ? $booking->teacher->user 
            : $booking->student;
        
        // Find or create conversation
        $conversation = Conversation::findOrCreateBetween($user, $otherUser, $booking->id);
        
        return redirect()->route($this->getMessagesRoute($user), ['conversation' => $conversation->id]);
    }

    /**
     * Start a conversation with admin (support)
     */
    public function startWithAdmin(Request $request)
    {
        $user = $request->user();
        
        // Find an admin user
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            return back()->with('error', 'Support is currently unavailable.');
        }
        
        // Find or create admin conversation
        $conversation = Conversation::findOrCreateBetween($user, $admin, null, true);
        
        return redirect()->route($this->getMessagesRoute($user), ['conversation' => $conversation->id]);
    }

    /**
     * Start a conversation with a specific user (admin only)
     */
    public function startWithUser(Request $request, User $user)
    {
        $admin = $request->user();
        
        // Only admins can use this
        if (!$admin->isAdmin()) {
            abort(403);
        }
        
        // Find or create conversation between admin and user
        $conversation = Conversation::findOrCreateBetween($admin, $user, null, true);
        
        return redirect()->route('admin.messages.index', ['conversation' => $conversation->id]);
    }

    /**
     * Broadcast typing indicator
     */
    public function typing(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        if (!$conversation->hasParticipant($user)) {
            abort(403);
        }
        
        $isTyping = $request->boolean('is_typing', true);
        
        broadcast(new UserTyping($conversation->id, $user, $isTyping))->toOthers();
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        if (!$conversation->hasParticipant($user)) {
            abort(403);
        }
        
        $conversation->markAsReadFor($user);
        
        return response()->json(['success' => true]);
    }

    /**
     * Get unread message count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Message::whereHas('conversation', function ($q) use ($user) {
            $q->where('user_one_id', $user->id)
              ->orWhere('user_two_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->whereNull('read_at')
        ->count();
        
        return response()->json(['count' => $count]);
    }

    /**
     * Get recent conversations for the message bell dropdown
     */
    public function recent(Request $request)
    {
        $user = $request->user();
        $conversations = $this->getConversationsForUser($user);
        
        // Return only the first 5 conversations
        return response()->json([
            'conversations' => array_slice($conversations, 0, 5),
            'total_unread' => collect($conversations)->sum('unread_count'),
        ]);
    }

    /**
     * Get conversations for a user
     */
    private function getConversationsForUser(User $user): array
    {
        $conversations = Conversation::forUser($user)
            ->with(['userOne:id,name,avatar', 'userTwo:id,name,avatar', 'latestMessage.sender:id,name', 'booking.subject:id,name'])
            ->orderByDesc('last_message_at')
            ->get();
        
        return $conversations->map(fn($conv) => $this->formatConversation($conv, $user))->toArray();
    }

    /**
     * Format conversation for response
     */
    private function formatConversation(Conversation $conversation, User $currentUser): array
    {
        $otherUser = $conversation->getOtherUser($currentUser);
        $latestMessage = $conversation->latestMessage;
        
        return [
            'id' => $conversation->id,
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'avatar' => $otherUser->avatar_url,
                'is_online' => false, // TODO: Implement online status
            ],
            'booking' => $conversation->booking ? [
                'id' => $conversation->booking->id,
                'subject' => $conversation->booking->subject?->name,
            ] : null,
            'is_admin_conversation' => $conversation->is_admin_conversation,
            'latest_message' => $latestMessage ? [
                'content' => $latestMessage->content,
                'type' => $latestMessage->type,
                'sender_name' => $latestMessage->sender?->name,
                'is_mine' => $latestMessage->sender_id === $currentUser->id,
                'created_at' => $latestMessage->created_at->diffForHumans(),
            ] : null,
            'unread_count' => $conversation->getUnreadCountFor($currentUser),
            'last_message_at' => $conversation->last_message_at?->diffForHumans(),
        ];
    }

    /**
     * Format message for response
     */
    private function formatMessage(Message $message, User $currentUser): array
    {
        return [
            'id' => $message->id,
            'content' => $message->content,
            'type' => $message->type,
            'sender' => [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'avatar' => $message->sender->avatar_url,
            ],
            'is_mine' => $message->sender_id === $currentUser->id,
            'file_url' => $message->file_url,
            'file_name' => $message->file_name,
            'file_type' => $message->file_type,
            'file_size' => $message->formatted_file_size,
            'is_read' => $message->isRead(),
            'created_at' => $message->created_at->toIso8601String(),
            'created_at_human' => $message->created_at->diffForHumans(),
            'created_at_time' => $message->created_at->format('g:i a'),
            'created_at_date' => $message->created_at->format('M d, Y'),
        ];
    }

    /**
     * Get the messages route based on user role
     */
    private function getMessagesRoute(User $user): string
    {
        return match(true) {
            $user->isAdmin() => 'admin.messages.index',
            $user->isTeacher() => 'teacher.messages.index',
            $user->isGuardian() => 'guardian.messages.index',
            default => 'student.messages.index',
        };
    }
}

