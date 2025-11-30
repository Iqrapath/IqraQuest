import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'unread';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.read_at)
        : notifications;

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'relative rounded-full p-2 transition-colors',
                    'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                    isOpen && 'bg-gray-100 dark:bg-gray-800'
                )}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
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
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Notifications
                                </h3>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="rounded p-1 text-xs text-primary hover:bg-primary/10"
                                            title="Mark all as read"
                                        >
                                            <CheckCheck className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Compact Tabs */}
                            {notifications.length > 0 && (
                                <div className="mt-2 flex gap-1">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={cn(
                                            'flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors',
                                            filter === 'all'
                                                ? 'bg-primary text-white'
                                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                        )}
                                    >
                                        All ({notifications.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('unread')}
                                        className={cn(
                                            'flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors',
                                            filter === 'unread'
                                                ? 'bg-primary text-white'
                                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                        )}
                                    >
                                        Unread ({unreadCount})
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Bell className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                                    <p className="text-xs text-gray-500">
                                        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                                    </p>
                                </div>
                            ) : (
                                filteredNotifications.slice(0, 10).map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={() => markAsRead(notification.id)}
                                        onClose={() => setIsOpen(false)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href="/notifications"
                                    className="block py-2 text-center text-xs font-medium text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    View all
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onClose,
}: {
    notification: any;
    onMarkAsRead: () => void;
    onClose: () => void;
}) {
    const isUnread = !notification.read_at;
    const notificationType = notification.data.type;

    const getTypeIcon = () => {
        switch (notificationType) {
            case 'login': return '👋';
            case 'application_approved': return '✅';
            case 'application_rejected': return '❌';
            case 'new_application': return '📝';
            case 'application_received': return '📬';
            case 'welcome': return '🌟';
            default: return '🔔';
        }
    };

    const content = (
        <div className="flex gap-2.5">
            {/* Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base">
                {getTypeIcon()}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {notification.data.title}
                    </p>
                    {isUnread && (
                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                    {notification.data.message}
                </p>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                    {isUnread && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onMarkAsRead();
                            }}
                            className="ml-auto flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                        >
                            <Check className="h-3 w-3" />
                            Read
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const containerClasses = cn(
        'border-b border-gray-100 px-3 py-2.5 transition-colors dark:border-gray-700',
        isUnread
            ? 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
    );

    if (notification.data.action_url) {
        return (
            <Link
                href={notification.data.action_url}
                className={containerClasses}
                onClick={() => {
                    onMarkAsRead();
                    onClose();
                }}
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={containerClasses} onClick={onMarkAsRead}>
            {content}
        </div>
    );
}
