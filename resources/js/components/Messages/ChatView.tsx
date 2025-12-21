import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import ContactSupportButton from './ContactSupportButton';

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
}

interface ChatViewProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string, file?: File) => Promise<void>;
    onBack: () => void;
    onClose?: () => void;
    typingUser: string | null;
    onTyping: () => void;
    baseUrl: string;
    isAdmin?: boolean;
    isOtherUserOnline?: boolean;
}

export default function ChatView({
    conversation,
    messages,
    onSendMessage,
    onBack,
    onClose,
    typingUser,
    onTyping,
    baseUrl,
    isAdmin = false,
    isOtherUserOnline,
}: ChatViewProps) {
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use presence-based online status if provided, otherwise fall back to server data
    const otherUserOnline = isOtherUserOnline ?? conversation?.other_user.is_online ?? false;

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing indicator with debounce
    const handleInputChange = (value: string) => {
        setNewMessage(value);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Only notify typing if there's content
        if (value.trim()) {
            onTyping();
        }
        
        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            // Typing stopped
        }, 2000);
    };

    const handleSend = async () => {
        if ((!newMessage.trim() && !selectedFile) || sending) return;
        
        const messageContent = newMessage.trim();
        const file = selectedFile;
        
        // Clear input immediately for better UX
        setNewMessage('');
        setSelectedFile(null);
        
        setSending(true);
        try {
            await onSendMessage(messageContent, file || undefined);
        } catch (error) {
            // Restore message on error
            setNewMessage(messageContent);
            if (file) setSelectedFile(file);
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { date: string; messages: Message[] }[] = [];
        let currentDate = '';
        
        messages.forEach((message) => {
            if (message.created_at_date !== currentDate) {
                currentDate = message.created_at_date;
                groups.push({ date: currentDate, messages: [message] });
            } else {
                groups[groups.length - 1].messages.push(message);
            }
        });
        
        return groups;
    };

    const getDateLabel = (dateStr: string) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';
        return dateStr;
    };

    const renderMessage = (message: Message, index: number, allMessages: Message[]) => {
        const isImage = message.type === 'image';
        const isFile = message.type === 'file';
        const isAudio = message.type === 'audio';
        
        // Check if we should show avatar (first message or different sender from previous)
        const prevMessage = index > 0 ? allMessages[index - 1] : null;
        const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id;

        return (
            <div
                key={message.id}
                className={cn(
                    "flex gap-2 sm:gap-[7px] mb-4 sm:mb-3",
                    message.is_mine ? "flex-row-reverse" : "flex-row"
                )}
            >
                {/* Avatar - only for other user's messages */}
                {!message.is_mine && (
                    <div className="w-[40px] sm:w-[34px] flex-shrink-0">
                        {showAvatar && (
                            <div className="w-[40px] h-[40px] sm:w-[34px] sm:h-[34px] rounded-full bg-gray-200 overflow-hidden">
                                {message.sender.avatar ? (
                                    <img
                                        src={message.sender.avatar}
                                        alt={message.sender.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9] text-[#338078] text-[14px] sm:text-[11px] font-medium">
                                        {message.sender.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className={cn("max-w-[75%] sm:max-w-[70%] flex flex-col", message.is_mine ? "items-end" : "items-start")}>
                    {/* Sender name and time */}
                    {showAvatar && (
                        <div className={cn(
                            "flex items-center gap-2 mb-1",
                            message.is_mine ? "flex-row-reverse" : "flex-row"
                        )}>
                            <span className="font-['Outfit'] font-medium text-[12px] sm:text-[10px] text-black">
                                {message.is_mine ? 'You' : message.sender.name}
                            </span>
                            <span className="font-['Outfit'] text-[10px] sm:text-[7px] text-[#a19791]">
                                {message.created_at_time}
                            </span>
                        </div>
                    )}

                    {/* Message bubble */}
                    <div
                        className={cn(
                            "px-4 py-3 sm:px-3 sm:py-2 max-w-full",
                            message.is_mine
                                ? "bg-[#338078] text-white rounded-[20px] rounded-tr-[4px]"
                                : "bg-[#f3f4f6] text-black rounded-[20px] rounded-tl-[4px]"
                        )}
                    >
                        {isImage && message.file_url && (
                            <img
                                src={message.file_url}
                                alt="Shared image"
                                className="max-w-full rounded-lg mb-1"
                            />
                        )}
                        
                        {isFile && message.file_url && (
                            <a
                                href={message.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "flex items-center gap-2 p-3 sm:p-2 rounded-lg mb-1",
                                    message.is_mine ? "bg-white/10" : "bg-white"
                                )}
                            >
                                <Icon
                                    icon={message.file_type?.includes('pdf') ? 'mdi:file-pdf-box' : 'mdi:file-document'}
                                    className={cn(
                                        "w-7 h-7 sm:w-6 sm:h-6",
                                        message.file_type?.includes('pdf') ? "text-red-500" : "text-blue-500"
                                    )}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-[12px] sm:text-[9px] font-medium truncate",
                                        message.is_mine ? "text-white" : "text-black"
                                    )}>
                                        {message.file_name}
                                    </p>
                                    <p className={cn(
                                        "text-[10px] sm:text-[7px]",
                                        message.is_mine ? "text-white/70" : "text-gray-500"
                                    )}>
                                        {message.file_size}
                                    </p>
                                </div>
                            </a>
                        )}
                        
                        {isAudio && message.file_url && (
                            <audio controls className="max-w-full h-10 sm:h-8">
                                <source src={message.file_url} type={message.file_type || 'audio/mpeg'} />
                            </audio>
                        )}
                        
                        {message.content && (
                            <p className="font-['Outfit'] font-light text-[14px] sm:text-[9px] whitespace-pre-wrap leading-[1.6]">
                                {message.content}
                            </p>
                        )}
                    </div>
                </div>

                {/* My avatar */}
                {message.is_mine && (
                    <div className="w-[40px] sm:w-[34px] flex-shrink-0">
                        {showAvatar && (
                            <div className="w-[40px] h-[40px] sm:w-[34px] sm:h-[34px] rounded-full bg-gray-200 overflow-hidden">
                                {message.sender.avatar ? (
                                    <img
                                        src={message.sender.avatar}
                                        alt="You"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9] text-[#338078] text-[14px] sm:text-[11px] font-medium">
                                        {message.sender.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-bl-[19px] rounded-br-[19px] p-8">
                <Icon icon="mdi:message-text-outline" className="w-16 h-16 sm:w-12 sm:h-12 text-gray-300 mb-3" />
                <p className="font-['Nunito'] text-gray-500 text-[14px] sm:text-[12px] text-center mb-4">
                    Select a conversation to start messaging
                </p>
                {!isAdmin && (
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-['Nunito'] text-gray-400 text-[12px] sm:text-[10px]">
                            Need help? Reach out to our support team
                        </p>
                        <ContactSupportButton baseUrl={baseUrl} size="md" />
                    </div>
                )}
            </div>
        );
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex-1 flex flex-col bg-white rounded-bl-[19px] rounded-br-[19px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:py-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3 sm:gap-[7px]">
                    <button
                        onClick={onBack}
                        className="p-2 sm:p-1 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5 sm:w-[15px] sm:h-[15px] text-black" />
                    </button>
                    <div className="flex items-center gap-[7px]">
                        <div className="flex flex-col gap-[5px]">
                            <p className="font-['Outfit'] text-[17px] sm:text-[15px] text-black">
                                {conversation.other_user.name}
                            </p>
                            <div className="flex items-center gap-1">
                                <div className={cn(
                                    "w-[6px] h-[6px] sm:w-[5px] sm:h-[5px] rounded-full",
                                    otherUserOnline ? "bg-[#34c759]" : "bg-gray-300"
                                )} />
                                <span className="font-['Outfit'] text-[10px] sm:text-[8px] text-[#6b7280]">
                                    {otherUserOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {conversation.booking && (
                        <div className="flex items-center gap-2 border border-[#338078] rounded-[18px] px-4 py-2.5 sm:px-3 sm:py-2">
                            <button className="flex items-center gap-1 text-[#338078] hover:opacity-80">
                                <Icon icon="fluent:call-48-regular" className="w-5 h-5 sm:w-[15px] sm:h-[15px]" />
                                <span className="font-['Nunito'] font-bold text-[10px] sm:text-[7px]">Call</span>
                            </button>
                            <div className="w-px h-3 sm:h-2 bg-[#338078]/30" />
                            <button className="flex items-center gap-1 text-[#338078] hover:opacity-80">
                                <Icon icon="mynaui:video" className="w-5 h-5 sm:w-[15px] sm:h-[15px]" />
                                <span className="font-['Nunito'] font-bold text-[10px] sm:text-[7px]">Start Class</span>
                            </button>
                        </div>
                    )}
                    
                    {/* Close button - desktop only */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close chat"
                        >
                            <Icon icon="mdi:close" className="w-[18px] h-[18px] text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages - Scrollable area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
                {messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-4">
                            <span className="font-['Outfit'] text-[11px] sm:text-[9px] text-black">
                                {getDateLabel(group.date)}
                            </span>
                        </div>
                        
                        {group.messages.map((message, index) => renderMessage(message, index, group.messages))}
                    </div>
                ))}
                
                {/* Typing indicator */}
                {typingUser && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-[24px] h-[24px] sm:w-[17px] sm:h-[17px] rounded-full bg-gray-200 overflow-hidden">
                            {conversation.other_user.avatar ? (
                                <img
                                    src={conversation.other_user.avatar}
                                    alt={conversation.other_user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9] text-[#338078] text-[10px] sm:text-[7px]">
                                    {conversation.other_user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <p className="font-['Outfit'] text-[12px] sm:text-[9px] text-[#5e5651]">
                            <span className="font-medium text-black">{typingUser}</span>
                            <span className="text-[#a19791]"> is typing...</span>
                        </p>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="px-4 py-4 sm:py-3 border-t border-gray-100 flex-shrink-0">
                {/* Selected file preview */}
                {selectedFile && (
                    <div className="flex items-center gap-2 mb-2 p-3 sm:p-2 bg-gray-100 rounded-lg">
                        <Icon
                            icon={selectedFile.type.startsWith('image/') ? 'mdi:image' : 'mdi:file'}
                            className="w-5 h-5 sm:w-4 sm:h-4 text-gray-500"
                        />
                        <span className="flex-1 text-[12px] sm:text-[9px] text-gray-700 truncate">
                            {selectedFile.name}
                        </span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="p-1.5 sm:p-1 hover:bg-gray-200 rounded"
                        >
                            <Icon icon="mdi:close" className="w-4 h-4 sm:w-3 sm:h-3 text-gray-500" />
                        </button>
                    </div>
                )}
                
                <div className="flex items-center gap-2 sm:gap-[7px]">
                    <div className="flex-1 flex items-center gap-2 sm:gap-[5px] bg-white border border-black rounded-[30px] px-4 py-3 sm:px-[15px] sm:py-[7px]">
                        <Icon icon="mdi:pencil" className="w-4 h-4 sm:w-[8px] sm:h-[8px] text-[#a19791]" />
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 font-['Outfit'] text-[14px] sm:text-[9px] text-black placeholder:text-[#a19791] outline-none"
                        />
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-[7px]">
                        <button className="p-2 sm:p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <Icon icon="mdi:microphone-outline" className="w-6 h-6 sm:w-[21px] sm:h-[21px] text-gray-500" />
                        </button>
                        <button className="p-2 sm:p-1 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                            <Icon icon="mdi:emoticon-outline" className="w-6 h-6 sm:w-[21px] sm:h-[21px] text-gray-500" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 sm:p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Icon icon="mdi:paperclip" className="w-6 h-6 sm:w-[21px] sm:h-[21px] text-gray-500" />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={(!newMessage.trim() && !selectedFile) || sending}
                            className="p-2 sm:p-1 hover:bg-[#338078]/10 rounded-full transition-colors disabled:opacity-50"
                        >
                            <Icon icon="mdi:send" className="w-6 h-6 sm:w-[21px] sm:h-[21px] text-[#338078]" />
                        </button>
                    </div>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                </div>
            </div>
        </div>
    );
}
