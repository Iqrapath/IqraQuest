import { useEcho } from '@laravel/echo-react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        type: string;
        action_url?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

// Track if we've already subscribed to prevent duplicates
let isSubscribed = false;

export function useNotifications() {
    const { auth, notifications: initialNotifications, unreadNotificationsCount } = usePage().props as any;
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
    const [unreadCount, setUnreadCount] = useState(unreadNotificationsCount || 0);

    // Only subscribe if user exists
    const channelName = auth?.user?.id ? `App.Models.User.${auth.user.id}` : '';

    // Use the useEcho hook to listen for notifications
    // This will automatically handle subscription/cleanup
    useEcho(
        channelName,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (event: any) => {
            // Prevent duplicate toast notifications
            if (isSubscribed) {
                console.log('🔕 Duplicate notification prevented');
                return;
            }
            
            isSubscribed = true;
            setTimeout(() => { isSubscribed = false; }, 1000); // Reset af
            console.log('🔔 New notification received:', event);
            console.log('📊 Notification type:', event.type);
            console.log('📝 Notification data:', event);

            // Extract notification data from the event
            const notification = {
                id: event.id || Date.now().toString(),
                type: event.type || 'notification',
                data: event,
                read_at: null,
                created_at: new Date().toISOString(),
            };

            // Add to notifications list
            setNotifications((prev: Notification[]) => [notification, ...prev]);

            // Increment unread count
            setUnreadCount((prev: number) => prev + 1);

            // Show Sonner toast notification
            const notificationType = event.type;

            if (notificationType === 'application_approved') {
                toast.success(event.title, {
                    description: event.message,
                    action: event.action_url
                        ? {
                              label: 'View',
                              onClick: () => (window.location.href = event.action_url),
                          }
                        : undefined,
                    duration: 5000,
                });
            } else if (notificationType === 'application_rejected') {
                toast.error(event.title, {
                    description: event.message,
                    action: event.action_url
                        ? {
                              label: 'View Details',
                              onClick: () => (window.location.href = event.action_url),
                          }
                        : undefined,
                    duration: 7000,
                });
            } else if (notificationType === 'new_application') {
                toast.info(event.title, {
                    description: event.message,
                    action: event.action_url
                        ? {
                              label: 'Review',
                              onClick: () => (window.location.href = event.action_url),
                          }
                        : undefined,
                    duration: 5000,
                });
            } else if (notificationType === 'login') {
                // Login notification - success style
                toast.success(event.title, {
                    description: event.message,
                    duration: 3000,
                });
            } else {
                // Default notification style
                toast(event.title, {
                    description: event.message,
                    action: event.action_url
                        ? {
                              label: 'View',
                              onClick: () => (window.location.href = event.action_url),
                          }
                        : undefined,
                    duration: 5000,
                });
            }
        },
        // Dependencies - re-subscribe when channel changes
        [channelName]
    );

    const markAsRead = (notificationId: string) => {
        setNotifications((prev: Notification[]) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
            )
        );
        setUnreadCount((prev: number) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev: Notification[]) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
    };

    const requestPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        requestPermission,
    };
}
