import { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import ConversationList from '@/components/Messages/ConversationList';
import ChatView from '@/components/Messages/ChatView';
import axios from 'axios';

interface Message {
    id: number;
    content: string | null;
    type: 'text' | 'image' | 'file' | 'audio' | 'system';
    sender: {
        id: number;
        name: string;
        avatar: string | null;
    };
    is_mine: boolean;
    file_url: string | null;
    file_name: string | null;
    file_type: string | null;
    file_size: string | null;
    is_read: boolean;
    created_at: string;
    created_at_human: string;
    created_at_time: string;
    created_at_date: string;
}

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

interface Props {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    messages: Message[];
}

export default function MessagesIndex({ conversations: initialConversations, selectedConversation: initialSelected, messages: initialMessages }: Props) {
    const { auth } = usePage<any>().props;
    const currentUserId = auth?.user?.id;
    
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(initialSelected);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [showMobileChat, setShowMobileChat] = useState(!!initialSelected);
    const [isOtherUserOnline, setIsOtherUserOnline] = useState<boolean>(initialSelected?.other_user.is_online ?? false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingNotifyRef = useRef<number>(0);

    const baseUrl = '/teacher/messages';

    // Subscribe to presence channel for online status
    useEffect(() => {
        if (!selectedConversation) return;

        // @ts-ignore
        const presenceChannel = window.Echo?.join(`presence.conversation.${selectedConversation.id}`);
        
        if (presenceChannel) {
            presenceChannel
                .here((users: any[]) => {
                    const otherUserPresent = users.some(u => u.id === selectedConversation.other_user.id);
                    setIsOtherUserOnline(otherUserPresent);
                })
                .joining((user: any) => {
                    if (user.id === selectedConversation.other_user.id) {
                        setIsOtherUserOnline(true);
                    }
                })
                .leaving((user: any) => {
                    if (user.id === selectedConversation.other_user.id) {
                        setIsOtherUserOnline(false);
                    }
                });
        }

        return () => {
            // @ts-ignore
            window.Echo?.leave(`presence.conversation.${selectedConversation.id}`);
        };
    }, [selectedConversation?.id, selectedConversation?.other_user.id]);

    useEffect(() => {
        if (!selectedConversation || !currentUserId) return;

        // @ts-ignore
        const channel = window.Echo?.private(`conversation.${selectedConversation.id}`);
        
        if (channel) {
            channel
                .listen('.message.sent', (data: any) => {
                    const isFromMe = data.sender?.id === currentUserId;
                    
                    if (!isFromMe) {
                        setMessages((prev) => {
                            if (prev.some(m => m.id === data.id)) return prev;
                            return [...prev, { ...data, is_mine: false }];
                        });
                        
                        setConversations((prev) =>
                            prev.map((conv) =>
                                conv.id === selectedConversation.id
                                    ? {
                                        ...conv,
                                        latest_message: {
                                            content: data.content,
                                            type: data.type,
                                            sender_name: data.sender.name,
                                            is_mine: false,
                                            created_at: 'Just now',
                                        },
                                        last_message_at: 'Just now',
                                    }
                                    : conv
                            )
                        );
                    }
                })
                .listen('.user.typing', (data: any) => {
                    if (data.user.id !== selectedConversation.other_user.id) return;
                    
                    if (!data.is_typing) {
                        setTypingUser(null);
                    } else {
                        setTypingUser(data.user.name);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
                    }
                });
        }

        return () => {
            channel?.stopListening('.message.sent');
            channel?.stopListening('.user.typing');
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [selectedConversation?.id, selectedConversation?.other_user.id, currentUserId]);

    const handleSelectConversation = useCallback((conversation: Conversation) => {
        setSelectedConversation(conversation);
        setShowMobileChat(true);
        setTypingUser(null);
        setIsOtherUserOnline(conversation.other_user.is_online);
        
        router.get(`${baseUrl}`, { conversation: conversation.id }, {
            preserveState: true,
            preserveScroll: true,
            only: ['messages', 'selectedConversation'],
            onSuccess: (page) => {
                const props = page.props as unknown as Props;
                setMessages(props.messages);
                setSelectedConversation(props.selectedConversation);
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
                    )
                );
            },
        });
    }, [baseUrl]);

    const handleSendMessage = async (content: string, file?: File) => {
        if (!selectedConversation) return;

        const formData = new FormData();
        if (content) formData.append('content', content);
        if (file) formData.append('file', file);

        try {
            const response = await axios.post(`${baseUrl}/${selectedConversation.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newMessage = response.data.message;
            setMessages((prev) => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
            });

            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === selectedConversation.id
                        ? {
                            ...conv,
                            latest_message: {
                                content: newMessage.content,
                                type: newMessage.type,
                                sender_name: 'You',
                                is_mine: true,
                                created_at: 'Just now',
                            },
                            last_message_at: 'Just now',
                        }
                        : conv
                )
            );
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    };

    const handleTyping = useCallback(() => {
        if (!selectedConversation) return;
        const now = Date.now();
        if (now - lastTypingNotifyRef.current < 1000) return;
        lastTypingNotifyRef.current = now;
        axios.post(`${baseUrl}/${selectedConversation.id}/typing`, { is_typing: true }).catch(() => {});
    }, [selectedConversation, baseUrl]);

    const handleBack = () => {
        setShowMobileChat(false);
        setTypingUser(null);
    };

    const handleClose = () => {
        setSelectedConversation(null);
        setMessages([]);
        setTypingUser(null);
    };

    return (
        <>
            <Head title="Messages" />

            <div className="flex flex-col h-[calc(100vh-140px)]">
                <h1 className="font-['Nunito'] font-semibold text-[24px] text-black mb-4 flex-shrink-0">
                    Messages
                </h1>

                <div className="flex gap-4 flex-1 min-h-0">
                    <div className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} h-full`}>
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversation?.id || null}
                            onSelect={handleSelectConversation}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            userRole="teacher"
                            baseUrl={baseUrl}
                            onSupportClick={() => setShowMobileChat(true)}
                        />
                    </div>

                    <div className={`flex-1 min-w-0 h-full ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
                        <ChatView
                            conversation={selectedConversation}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onBack={handleBack}
                            onClose={handleClose}
                            typingUser={typingUser}
                            onTyping={handleTyping}
                            baseUrl={baseUrl}
                            isOtherUserOnline={isOtherUserOnline}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

MessagesIndex.layout = (page: React.ReactNode) => <TeacherLayout children={page} />;
