import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import ContactSupportButton from './ContactSupportButton';

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

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: number | null;
    onSelect: (conversation: Conversation) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    userRole: 'student' | 'teacher' | 'guardian' | 'admin';
    baseUrl: string;
    onSupportClick?: () => void;
}

export default function ConversationList({
    conversations,
    selectedId,
    onSelect,
    searchQuery,
    onSearchChange,
    userRole,
    baseUrl,
    onSupportClick,
}: ConversationListProps) {
    const filteredConversations = conversations.filter((conv) =>
        conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSearchPlaceholder = () => {
        switch (userRole) {
            case 'teacher':
                return 'Find a student by name';
            case 'student':
            case 'guardian':
                return 'Find a teacher by name';
            default:
                return 'Search conversations';
        }
    };

    const getMessagePreview = (conv: Conversation) => {
        if (!conv.latest_message) return 'No messages yet';
        
        if (conv.latest_message.type === 'image') {
            return conv.latest_message.is_mine ? 'You sent an image' : 'Sent an image';
        }
        if (conv.latest_message.type === 'file') {
            return conv.latest_message.is_mine ? 'You sent a file' : 'Sent a file';
        }
        if (conv.latest_message.type === 'audio') {
            return conv.latest_message.is_mine ? 'You sent a voice message' : 'Sent a voice message';
        }
        
        return conv.latest_message.content || 'No messages yet';
    };

    return (
        <div className="bg-white flex flex-col h-full rounded-[21px] shadow-[0.6px_0px_0px_0px_rgba(0,0,0,0.08)] w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 overflow-hidden">
            {/* Header */}
            <div className="border-b border-black/8 px-4 py-4 lg:py-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="font-['Nunito'] font-semibold text-[16px] lg:text-[13px] text-black">
                        Messages
                    </span>
                    <Icon icon="mdi:chevron-down" className="w-[14px] h-[14px] lg:w-[10px] lg:h-[10px] text-black" />
                    <div className="bg-[#edf2f7] px-[8px] lg:px-[6px] py-[3px] lg:py-[2px] rounded-[15px]">
                        <span className="font-['Inter'] font-semibold text-[11px] lg:text-[8px] text-black">
                            {conversations.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 lg:py-2 flex-shrink-0">
                <div className="bg-[#f3f4f6] flex items-center gap-[8px] lg:gap-[6px] px-[15px] py-[12px] lg:py-[7px] rounded-full">
                    <Icon icon="iconamoon:search-thin" className="w-[16px] h-[16px] lg:w-[11px] lg:h-[11px] text-[#374151]/40 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder={getSearchPlaceholder()}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-transparent flex-1 font-['Inter'] text-[14px] lg:text-[10px] text-[#374151] placeholder:text-[#374151]/40 outline-none min-w-0"
                    />
                </div>
            </div>

            {/* Conversation List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-[10px] py-0">
                <div className="flex flex-col gap-[10px] lg:gap-[5px]">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Icon icon="mdi:message-text-outline" className="w-12 h-12 lg:w-8 lg:h-8 text-gray-300 mb-2" />
                            <p className="text-gray-400 text-[13px] lg:text-[9px]">No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => onSelect(conversation)}
                                className={cn(
                                    "w-full flex gap-[12px] lg:gap-[10px] items-start p-[14px] lg:p-[8px] rounded-[12px] lg:rounded-[8px] transition-colors text-left",
                                    selectedId === conversation.id
                                        ? "bg-[#dffaf7]"
                                        : "hover:bg-gray-50"
                                )}
                            >
                                {/* Avatar with online indicator */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-[44px] h-[44px] lg:w-[31px] lg:h-[31px] rounded-full bg-gray-200 overflow-hidden">
                                        {conversation.other_user.avatar ? (
                                            <img
                                                src={conversation.other_user.avatar}
                                                alt={conversation.other_user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9] text-[#338078] font-medium text-[16px] lg:text-[11px]">
                                                {conversation.other_user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {/* Online indicator - positioned absolute to avatar */}
                                    <div className={cn(
                                        "absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] lg:w-[8px] lg:h-[8px] rounded-full border-2 border-white",
                                        conversation.other_user.is_online ? "bg-[#34c759]" : "bg-gray-300"
                                    )} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col gap-[6px] lg:gap-[5px]">
                                    <div className="flex items-start justify-between gap-[8px]">
                                        <span className="font-['Nunito'] font-semibold text-[15px] lg:text-[10px] text-black truncate flex-1">
                                            {conversation.other_user.name}
                                        </span>
                                        <span className="font-['Nunito'] font-medium text-[12px] lg:text-[9px] text-[#6b7280] flex-shrink-0">
                                            {conversation.last_message_at || ''}
                                        </span>
                                    </div>
                                    <p className="font-['Nunito'] font-light text-[13px] lg:text-[9px] text-[#6b7280] truncate">
                                        {getMessagePreview(conversation)}
                                    </p>
                                    
                                    {/* Tags */}
                                    <div className="flex items-center gap-[6px] lg:gap-[5px] flex-wrap">
                                        {conversation.booking && (
                                            <span className="bg-[#feebc8] px-[10px] lg:px-[5px] py-[3px] lg:py-[1px] rounded-[12px] font-['Nunito'] font-light text-[11px] lg:text-[7px] text-[#dd6b20]">
                                                {conversation.booking.subject}
                                            </span>
                                        )}
                                        {conversation.is_admin_conversation && (
                                            <span className="bg-[#e8f5e9] px-[10px] lg:px-[5px] py-[3px] lg:py-[1px] rounded-[12px] font-['Nunito'] font-light text-[11px] lg:text-[7px] text-[#338078]">
                                                Support
                                            </span>
                                        )}
                                        {conversation.unread_count > 0 && (
                                            <span className="bg-[#338078] px-[10px] lg:px-[5px] py-[3px] lg:py-[1px] rounded-full font-['Inter'] font-semibold text-[11px] lg:text-[7px] text-white ml-auto">
                                                {conversation.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Contact Support Button - for non-admin users */}
            {userRole !== 'admin' && (
                <div className="px-4 py-4 lg:py-3 border-t border-gray-100 flex-shrink-0">
                    <ContactSupportButton 
                        baseUrl={baseUrl} 
                        size="md" 
                        variant="outline"
                        className="w-full"
                        onSuccess={onSupportClick}
                    />
                </div>
            )}
        </div>
    );
}
