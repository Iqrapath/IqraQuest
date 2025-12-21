import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks/use-messages';

export default function MessageBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { 
        conversations, 
        unreadCount, 
        loading, 
        fetchConversations,
        baseUrl 
    } = useMessages();

    const handleOpen = () => {
        setIsOpen(true);
        // Fetch fresh data when opening
        fetchConversations();
    };

    const getMessagePreview = (conv: (typeof conversations)[number]) => {
        if (!conv.latest_message) return 'No messages yet';
        
        const prefix = conv.latest_message.is_mine ? 'You: ' : '';
        const content = conv.latest_message.type === 'text' 
            ? conv.latest_message.content 
            : `[${conv.latest_message.type}]`;
        
        return `${prefix}${content}`;
    };

    return (
        <div className="relative">
            {/* Message Icon */}
            <button
                onClick={handleOpen}
                className={cn(
                    'relative rounded-full p-2 transition-colors',
                    'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                    isOpen && 'bg-gray-100 dark:bg-gray-800'
                )}
            >
                <Icon icon="bitcoin-icons:message-outline" className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#338078] text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        {/* Header */}
                        <div className="border-b border-gray-200 px-3 py-2.5 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Messages
                                    </h3>
                                    {unreadCount > 0 && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#338078] px-1.5 text-[10px] font-semibold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Icon icon="mdi:close" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Icon icon="mdi:loading" className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Icon icon="mdi:message-text-outline" className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                                    <p className="text-xs text-gray-500">No conversations yet</p>
                                </div>
                            ) : (
                                conversations.slice(0, 5).map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={`${baseUrl}?conversation=${conversation.id}`}
                                        className={cn(
                                            'flex items-start gap-3 border-b border-gray-100 px-3 py-2.5 transition-colors dark:border-gray-700',
                                            conversation.unread_count > 0
                                                ? 'bg-[#338078]/5 hover:bg-[#338078]/10'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                                                {conversation.other_user.avatar ? (
                                                    <img
                                                        src={conversation.other_user.avatar}
                                                        alt={conversation.other_user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-[#e8f5e9] text-[#338078] text-sm font-medium">
                                                        {conversation.other_user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {conversation.other_user.is_online && (
                                                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                    {conversation.other_user.name}
                                                </p>
                                                {conversation.unread_count > 0 && (
                                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#338078] text-[9px] font-bold text-white">
                                                        {conversation.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                                                {getMessagePreview(conversation)}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {conversation.booking && (
                                                    <span className="text-[9px] text-[#338078] bg-[#338078]/10 px-1.5 py-0.5 rounded">
                                                        {conversation.booking.subject}
                                                    </span>
                                                )}
                                                {conversation.is_admin_conversation && (
                                                    <span className="text-[9px] text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                                                        Support
                                                    </span>
                                                )}
                                                {conversation.last_message_at && (
                                                    <span className="text-[9px] text-gray-400">
                                                        {conversation.last_message_at}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 dark:border-gray-700">
                            <Link
                                href={baseUrl}
                                className="block py-2 text-center text-xs font-medium text-[#338078] hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                onClick={() => setIsOpen(false)}
                            >
                                View all messages
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
