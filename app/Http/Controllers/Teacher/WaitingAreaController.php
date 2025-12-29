<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WaitingAreaController extends Controller
{
    /**
     * Show the waiting area for pending/rejected teachers
     */
    public function index(): Response
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        Log::info('Teacher Waiting Area: Rendering page', [
            'user_id' => $user->id,
            'teacher_id' => $teacher?->id,
            'teacher_status' => $teacher?->status,
            'onboarding_step' => $teacher?->onboarding_step,
            'is_pending' => $teacher?->isPending(),
            'is_rejected' => $teacher?->isRejected(),
            'referrer' => request()->headers->get('referer'),
        ]);

        // Fetch admin conversation if exists
        $adminConversation = \App\Models\Conversation::where('is_admin_conversation', true)
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->with(['messages' => function ($query) {
                $query->with('sender:id,name,avatar')->orderBy('created_at', 'asc');
            }, 'userOne', 'userTwo'])
            ->first();

        // Format conversation for the view if it exists
        $formattedConversation = null;
        if ($adminConversation) {
            $otherUser = $adminConversation->user_one_id === $user->id 
                ? $adminConversation->userTwo 
                : $adminConversation->userOne;

            $formattedConversation = [
                'id' => $adminConversation->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'avatar' => $otherUser->avatar_url,
                ],
                'messages' => $adminConversation->messages->map(function ($msg) use ($user) {
                    return [
                        'id' => $msg->id,
                        'content' => $msg->content,
                        'is_mine' => $msg->sender_id === $user->id,
                        'created_at_human' => $msg->created_at->diffForHumans(),
                        'sender' => [
                            'name' => $msg->sender->name,
                            'avatar' => $msg->sender->avatar_url,
                        ]
                    ];
                }),
            ];
        }

        return Inertia::render('Teacher/WaitingArea', [
            'teacher' => $teacher->load(['approver', 'rejecter']),
            'status' => $teacher->status,
            'isPending' => $teacher->isPending(),
            'isRejected' => $teacher->isRejected(),
            'rejectionReason' => $teacher->rejection_reason,
            'rejectedAt' => $teacher->rejected_at,
            'conversation' => $formattedConversation,
        ]);
    }

    /**
     * Send a message to admin support
     */
    public function sendMessage(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $user = auth()->user();
        
        // Find existing admin conversation or create new one with first admin found
        // In a real app, you might want to assign to specific support user or generic admin
        $adminUser = \App\Models\User::where('role', \App\Enums\UserRole::ADMIN)->first();
        
        if (!$adminUser) {
            return back()->with('error', 'Support is currently unavailable.');
        }

        $conversation = \App\Models\Conversation::findOrCreateBetween(
            $user,
            $adminUser,
            null,
            true
        );

        $message = \App\Models\Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $request->message,
            'type' => 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Broadcast events for real-time updates
        broadcast(new \App\Events\MessageSent($message->load('sender')))->toOthers();
        broadcast(new \App\Events\NewMessageReceived($message->load('sender'), $adminUser));

        // Send email notification to Admin
        $replyUrl = config('app.url') . '/admin/verifications/' . $user->teacher->id;
        $adminUser->notify(new \App\Notifications\AdminNewMessageNotification(
            $user->name,
            $request->message,
            $replyUrl
        ));

        return back()->with('success', 'Message sent to support.');
    }
}
