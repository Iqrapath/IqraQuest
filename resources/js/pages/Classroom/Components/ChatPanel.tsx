import { useState, useRef, useEffect, useCallback } from 'react';
import { useDataChannel, useLocalParticipant, useParticipants, useRoomContext } from '@livekit/components-react';
import { DataPacket_Kind } from 'livekit-client';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ChatMessage {
    id: string;
    sender: string;
    senderIdentity: string;
    message: string;
    timestamp: Date;
    isLocal: boolean;
}

interface ChatPanelProps {
    onClose: () => void;
}

// Simple notification sound using Web Audio API
const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
        // Audio not supported or blocked
    }
};

export default function ChatPanel({ onClose }: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants();
    const room = useRoomContext();

    const { message } = useDataChannel('chat');

    // Check if user is scrolled to bottom
    const isScrolledToBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return true;
        return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    }, []);

    // Handle incoming messages
    useEffect(() => {
        if (message) {
            try {
                const decoder = new TextDecoder();
                const text = decoder.decode(message.payload);
                const data = JSON.parse(text);
                
                console.log('[Chat] Received message:', data.type, 'from:', data.senderIdentity, 'me:', localParticipant.identity);

                if (data.type === 'CHAT_MESSAGE') {
                    const isFromMe = data.senderIdentity === localParticipant.identity;
                    
                    // Skip if it's our own message (we already added it locally)
                    if (isFromMe) {
                        console.log('[Chat] Skipping own message');
                        return;
                    }
                    
                    const newMessage: ChatMessage = {
                        id: `${Date.now()}-${Math.random()}`,
                        sender: data.sender,
                        senderIdentity: data.senderIdentity,
                        message: data.message,
                        timestamp: new Date(data.timestamp),
                        isLocal: false,
                    };
                    
                    console.log('[Chat] Adding message from:', data.sender);
                    setMessages(prev => [...prev, newMessage]);
                    
                    // Play sound for incoming messages
                    if (soundEnabled) {
                        playNotificationSound();
                    }
                    
                    // Update unread count if not scrolled to bottom
                    if (!isScrolledToBottom()) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            } catch (error) {
                console.error("[Chat] Failed to parse message:", error);
            }
        }
    }, [message, localParticipant.identity, soundEnabled, isScrolledToBottom]);

    // Auto-scroll to bottom when new messages arrive (if already at bottom)
    useEffect(() => {
        if (isScrolledToBottom()) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setUnreadCount(0);
        }
    }, [messages, isScrolledToBottom]);

    // Clear unread count when scrolled to bottom
    const handleScroll = useCallback(() => {
        if (isScrolledToBottom()) {
            setUnreadCount(0);
        }
    }, [isScrolledToBottom]);

    // Scroll to bottom and clear unread
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadCount(0);
    };

    const sendMessage = () => {
        if (!inputValue.trim()) return;
        
        // Check if room is connected
        if (room.state !== 'connected') {
            console.log('[Chat] Room not connected, cannot send message');
            return;
        }

        const chatMessage = {
            type: 'CHAT_MESSAGE',
            topic: 'chat',
            sender: localParticipant.name || localParticipant.identity,
            senderIdentity: localParticipant.identity,
            message: inputValue.trim(),
            timestamp: new Date().toISOString(),
        };

        console.log('[Chat] Sending message:', chatMessage.message, 'as:', chatMessage.sender);

        // Send to all participants using room.localParticipant.publishData for reliable broadcast
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(chatMessage));
            room.localParticipant.publishData(data, { reliable: true, topic: 'chat' });
            console.log('[Chat] Message sent successfully via publishData');
        } catch (err) {
            console.error('[Chat] Failed to send:', err);
        }

        // Add to local messages immediately
        const newMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            sender: localParticipant.name || localParticipant.identity,
            senderIdentity: localParticipant.identity,
            message: inputValue.trim(),
            timestamp: new Date(),
            isLocal: true,
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getAvatarColor = (identity: string) => {
        const colors = [
            { bg: 'bg-pale-green', text: 'text-primary' },
            { bg: 'bg-light-purple/30', text: 'text-purple' },
            { bg: 'bg-pale-blue/30', text: 'text-blue' },
            { bg: 'bg-orange/20', text: 'text-orange' },
        ];
        const hash = identity.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pale-blue/30 flex items-center justify-center">
                        <Icon icon="mdi:chat" className="w-5 h-5 text-blue" />
                    </div>
                    <div>
                        <h3 className="text-body-s-semibold text-foreground">Chat</h3>
                        <p className="text-body-xs-regular text-muted-foreground">{participants.length} participants</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Sound toggle */}
                    <button 
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            soundEnabled ? "hover:bg-gray-100 text-primary" : "bg-gray-100 text-gray-400"
                        )}
                        title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
                    >
                        <Icon icon={soundEnabled ? "mdi:bell" : "mdi:bell-off"} className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
            >
                {/* Unread messages indicator */}
                {unreadCount > 0 && (
                    <button
                        onClick={scrollToBottom}
                        className="sticky top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full shadow-lg text-body-xs-semibold animate-bounce"
                    >
                        <Icon icon="mdi:arrow-down" className="w-4 h-4" />
                        {unreadCount} new message{unreadCount > 1 ? 's' : ''}
                    </button>
                )}
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Icon icon="mdi:chat-outline" className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-body-s-medium text-foreground">No messages yet</p>
                        <p className="text-body-xs-regular text-muted-foreground mt-1">
                            Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const avatarStyle = getAvatarColor(msg.senderIdentity);
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3",
                                    msg.isLocal && "flex-row-reverse"
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    avatarStyle.bg
                                )}>
                                    <span className={cn("text-xs font-semibold", avatarStyle.text)}>
                                        {msg.sender.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Message */}
                                <div className={cn(
                                    "max-w-[75%]",
                                    msg.isLocal && "text-right"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-body-xs-semibold",
                                            msg.isLocal ? "text-primary" : "text-foreground"
                                        )}>
                                            {msg.isLocal ? 'You' : msg.sender}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-body-s-regular",
                                        msg.isLocal 
                                            ? "bg-primary text-white rounded-tr-md" 
                                            : "bg-gray-100 text-foreground rounded-tl-md"
                                    )}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-body-s-regular text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            inputValue.trim()
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        <Icon icon="mdi:send" className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

