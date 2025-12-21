import { useEcho } from '@laravel/echo-react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface Conversation {
    id: number;
    other_user: {
        id: number;
        name: string;
        avatar: string | null;
        is_online: boolean;
    };
    booking: {
        id: number;
        subject: string;
    } | null;
    is_admin_conversation: boolean;
    latest_message: {
        content: string;
        type: string;
        sender_name: string;
        is_mine: boolean;
        created_at: string;
    } | null;
    unread_count: number;
    last_message_at: string | null;
}

// Track shown message IDs to prevent duplicate toasts
const shownMessageIds = new Set<number>();

/**
 * Show a browser push notification for new messages
 */
const showPushNotification = (title: string, body: string, conversationUrl: string) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        try {
            const notification = new window.Notification(title, {
                body,
                icon: '/favicon-32x32.png',
                badge: '/favicon-32x32.png',
                tag: `message-${Date.now()}`,
                requireInteraction: false,
                silent: false,
            });

            notification.onclick = () => {
                window.focus();
                window.location.href = conversationUrl;
                notification.close();
            };

            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('Error creating message notification:', error);
        }
    }
};

export function useMessages() {
    const { auth } = usePage().props as any;
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const hasFetchedInitial = useRef(false);

    // Get the correct messages URL based on user role
    const getMessagesUrl = useCallback(() => {
        const role = auth?.user?.role;
        switch (role) {
            case 'admin': return '/admin/messages';
            case 'teacher': return '/teacher/messages';
            case 'guardian': return '/guardian/messages';
            case 'student': return '/student/messages';
            default: return '/messages';
        }
    }, [auth?.user?.role]);

    const baseUrl = getMessagesUrl();

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!auth?.user) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/recent`);
            const data = response.data;
            setConversations(data.conversations || []);
            setUnreadCount(data.total_unread || 0);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, auth?.user]);

    // Fetch initial unread count on mount
    useEffect(() => {
        if (!auth?.user || hasFetchedInitial.current) return;
        hasFetchedInitial.current = true;
        
        // Fetch the unread count initially
        axios.get(`${baseUrl}/unread-count`)
            .then(response => {
                setUnreadCount(response.data.count || 0);
            })
            .catch(() => {});
    }, [auth?.user, baseUrl]);

    // Listen for new messages via WebSocket on user's private channel
    // Using the same channel format as notifications: user.{userId}
    const channelName = auth?.user?.id ? `user.${auth.user.id}` : '';

    useEcho(
        channelName,
        '.new.message',
        (event: any) => {
            if (!event) return;
            
            // Prevent duplicate handling
            if (shownMessageIds.has(event.id)) return;
            shownMessageIds.add(event.id);

            // Update unread count
            setUnreadCount(prev => prev + 1);

            // Update conversations list if we have it
            setConversations(prev => {
                if (prev.length === 0) return prev;
                
                const existingIndex = prev.findIndex(c => c.id === event.conversation_id);
                
                if (existingIndex >= 0) {
                    // Update existing conversation
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        unread_count: updated[existingIndex].unread_count + 1,
                        latest_message: {
                            content: event.content,
                            type: event.type || 'text',
                            sender_name: event.sender_name,
                            is_mine: false,
                            created_at: 'Just now',
                        },
                        last_message_at: 'Just now',
                    };
                    // Move to top
                    const [conv] = updated.splice(existingIndex, 1);
                    return [conv, ...updated];
                }
                
                return prev;
            });

            const conversationUrl = `${baseUrl}?conversation=${event.conversation_id}`;

            // Show in-app toast notification
            toast.message(`💬 New message from ${event.sender_name}`, {
                description: event.content?.substring(0, 50) + (event.content?.length > 50 ? '...' : '') || 'New message',
                action: {
                    label: 'View',
                    onClick: () => {
                        window.location.href = conversationUrl;
                    },
                },
                duration: 5000,
            });

            // Show browser push notification
            showPushNotification(
                `Message from ${event.sender_name}`,
                event.content?.substring(0, 100) || 'New message',
                conversationUrl
            );
        },
        [channelName, baseUrl]
    );

    // Mark conversation as read
    const markConversationAsRead = useCallback(async (conversationId: number) => {
        // Optimistic update
        const conversationUnread = conversations.find(c => c.id === conversationId)?.unread_count || 0;
        
        setConversations(prev => 
            prev.map(c => 
                c.id === conversationId 
                    ? { ...c, unread_count: 0 }
                    : c
            )
        );
        setUnreadCount(prev => Math.max(0, prev - conversationUnread));

        try {
            await axios.post(`${baseUrl}/${conversationId}/read`);
        } catch (error) {
            console.error('Failed to mark conversation as read:', error);
        }
    }, [baseUrl, conversations]);

    return {
        conversations,
        unreadCount,
        loading,
        fetchConversations,
        markConversationAsRead,
        baseUrl,
    };
}
