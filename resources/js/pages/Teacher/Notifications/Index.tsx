import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface NotificationData {
    title: string;
    message: string;
    type: string;
    action_url?: string;
    booking_id?: number;
    [key: string]: any;
}

interface Notification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    created_at_human: string;
}

interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    paginatedNotifications: PaginatedNotifications;
    paymentTypes: string[];
    unreadCount: number;
}

type TabType = 'general' | 'payment';

export default function NotificationsIndex({ paginatedNotifications, paymentTypes, unreadCount }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Filter notifications based on active tab
    const filteredNotifications = paginatedNotifications.data.filter((notification) => {
        const isPaymentType = paymentTypes.includes(notification.type) || 
            notification.data.type?.includes('payment') ||
            notification.data.type?.includes('funds') ||
            notification.data.type?.includes('wallet') ||
            notification.data.type?.includes('payout');
        
        return activeTab === 'payment' ? isPaymentType : !isPaymentType;
    });

    const handleMarkAsRead = (id: string) => {
        setProcessingId(id);
        router.post(`/teacher/notifications/${id}/read`, {}, {
            preserveScroll: true,
            only: ['paginatedNotifications', 'unreadCount'],
            onFinish: () => setProcessingId(null),
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/teacher/notifications/mark-all-read', {}, {
            preserveScroll: true,
            only: ['paginatedNotifications', 'unreadCount'],
        });
    };

    const handleDelete = (id: string) => {
        setProcessingId(id);
        router.delete(`/teacher/notifications/${id}`, {
            preserveScroll: true,
            only: ['paginatedNotifications', 'unreadCount'],
            onFinish: () => setProcessingId(null),
        });
    };

    const handleAcceptBooking = (bookingId: number, notificationId: string) => {
        setProcessingId(notificationId);
        router.post(`/teacher/requests/${bookingId}/accept`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setProcessingId(null);
                // Mark notification as read after accepting
                handleMarkAsRead(notificationId);
            },
        });
    };

    const handleDeclineBooking = (bookingId: number, notificationId: string) => {
        setProcessingId(notificationId);
        router.post(`/teacher/requests/${bookingId}/reject`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setProcessingId(null);
                // Mark notification as read after declining
                handleMarkAsRead(notificationId);
            },
        });
    };

    const getNotificationIcon = (notification: Notification) => {
        const type = notification.data.type || notification.type;
        
        // Admin broadcast notifications
        if (type.includes('announcement') || type.includes('system_notification') || type.includes('admin_message')) {
            return { icon: 'mdi:bullhorn-outline', color: 'text-[#338078]', bg: 'bg-[#e8f5f3]' };
        }
        
        // Message/Chat notifications
        if (type.includes('message') || type.includes('chat')) {
            return { icon: 'mdi:message-text-outline', color: 'text-blue-500', bg: 'bg-blue-50' };
        }
        
        // Warning/Admin notifications
        if (type.includes('warning') || type.includes('admin') || type.includes('notice') || type.includes('verification')) {
            return { icon: 'mdi:alert-outline', color: 'text-amber-500', bg: 'bg-amber-50' };
        }
        
        // Payment/Wallet notifications
        if (type.includes('payment') || type.includes('funds') || type.includes('wallet') || type.includes('payout')) {
            return { icon: 'mdi:credit-card-outline', color: 'text-green-500', bg: 'bg-green-50' };
        }
        
        // Booking/Request notifications
        if (type.includes('booking') || type.includes('request') || type.includes('session') || type.includes('class')) {
            return { icon: 'mdi:calendar-check-outline', color: 'text-teal-500', bg: 'bg-teal-50' };
        }
        
        // Reschedule notifications
        if (type.includes('reschedule')) {
            return { icon: 'mdi:calendar-clock', color: 'text-purple-500', bg: 'bg-purple-50' };
        }
        
        // Dispute notifications
        if (type.includes('dispute')) {
            return { icon: 'mdi:alert-circle-outline', color: 'text-red-500', bg: 'bg-red-50' };
        }
        
        // Login notifications
        if (type.includes('login')) {
            return { icon: 'mdi:account-check-outline', color: 'text-teal-500', bg: 'bg-teal-50' };
        }
        
        // Default
        return { icon: 'mdi:bell-outline', color: 'text-gray-500', bg: 'bg-gray-50' };
    };

    const isBookingRequest = (notification: Notification) => {
        const type = notification.data.type || notification.type;
        return type.includes('booking_requested') || type.includes('BookingRequested');
    };

    const isMessageNotification = (notification: Notification) => {
        const type = notification.data.type || notification.type;
        return type.includes('message');
    };

    return (
        <>
            <Head title="Notifications" />

            <div className="max-w-3xl px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-['Nunito'] font-semibold text-[24px] text-black">
                        Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-[#338078] hover:text-[#2a6b64] font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[13px] shadow-[0px_0px_58px_0px_rgba(51,128,120,0.12)] p-3 mb-6">
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={cn(
                                "px-6 py-2 rounded-[11px] font-['Nunito'] text-[16px] transition-all",
                                activeTab === 'general'
                                    ? 'bg-[#338078] text-white font-medium'
                                    : 'text-gray-500 hover:bg-gray-50 font-light'
                            )}
                        >
                            General Alerts
                        </button>
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={cn(
                                "px-6 py-2 rounded-[11px] font-['Nunito'] text-[16px] transition-all",
                                activeTab === 'payment'
                                    ? 'bg-[#338078] text-white font-medium'
                                    : 'text-gray-500 hover:bg-gray-50 font-light'
                            )}
                        >
                            Payment & Wallet Updates
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-[22px] shadow-[0px_0px_11px_0px_rgba(51,128,120,0.05)] p-5">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Icon icon="mdi:bell-off-outline" className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-['Nunito'] text-gray-500 text-sm">
                                No {activeTab === 'payment' ? 'payment' : 'general'} notifications yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => {
                                const iconConfig = getNotificationIcon(notification);
                                const isUnread = !notification.read_at;
                                const showBookingActions = isBookingRequest(notification) && notification.data.booking_id;
                                const showMessageActions = isMessageNotification(notification);
                                const isProcessing = processingId === notification.id;

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "relative border border-black/15 rounded-[12px] p-4 transition-all",
                                            isUnread && "bg-blue-50/30",
                                            isProcessing && "opacity-50"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                iconConfig.bg
                                            )}>
                                                <Icon 
                                                    icon={iconConfig.icon} 
                                                    className={cn("w-5 h-5", iconConfig.color)} 
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-['Nunito'] font-medium text-[13px] text-black">
                                                            {notification.data.title}
                                                        </p>
                                                        <p className="font-['Nunito'] font-light text-[10px] text-black/60 mt-0.5">
                                                            {notification.data.message}
                                                        </p>
                                                    </div>

                                                    {/* Unread indicator */}
                                                    {isUnread && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="font-['Nunito'] font-light text-[10px] text-black/60">
                                                        {notification.created_at_human}
                                                    </p>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        {!notification.read_at && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="text-[10px] text-[#338078] hover:underline"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="text-[10px] text-red-500 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons for Booking Requests - Teachers can Accept/Decline */}
                                            {showBookingActions && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button 
                                                        onClick={() => handleAcceptBooking(notification.data.booking_id!, notification.id)}
                                                        disabled={isProcessing}
                                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#338078] text-white text-xs font-medium hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                                                    >
                                                        <Icon icon="mdi:check" className="w-4 h-4" />
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeclineBooking(notification.data.booking_id!, notification.id)}
                                                        disabled={isProcessing}
                                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        <Icon icon="mdi:close" className="w-4 h-4" />
                                                        Decline
                                                    </button>
                                                </div>
                                            )}

                                            {/* Reply Button for Message Notifications */}
                                            {showMessageActions && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e8f5f3] text-[#338078] text-xs font-medium hover:bg-[#d4eeea] transition-colors">
                                                        <Icon icon="mdi:message-reply-outline" className="w-4 h-4" />
                                                        Reply
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Click to navigate if action_url exists */}
                                        {notification.data.action_url && !showBookingActions && (
                                            <button
                                                onClick={() => {
                                                    handleMarkAsRead(notification.id);
                                                    router.visit(notification.data.action_url!);
                                                }}
                                                className="absolute inset-0 rounded-[12px]"
                                                style={{ zIndex: -1 }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {paginatedNotifications.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => router.get(`/teacher/notifications?page=${paginatedNotifications.current_page - 1}`)}
                                disabled={paginatedNotifications.current_page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {paginatedNotifications.current_page} of {paginatedNotifications.last_page}
                            </span>
                            <button
                                onClick={() => router.get(`/teacher/notifications?page=${paginatedNotifications.current_page + 1}`)}
                                disabled={paginatedNotifications.current_page === paginatedNotifications.last_page}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

NotificationsIndex.layout = (page: React.ReactNode) => <TeacherLayout children={page} />;
