import { useEcho } from '@laravel/echo-react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

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
// Track shown notification IDs to prevent duplicate toasts
const shownNotificationIds = new Set<string>();

/**
 * Show a browser push notification
 */
const showPushNotification = (title: string, options: NotificationOptions & { action_url?: string }) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        try {
            const notification = new window.Notification(title, {
                body: options.body,
                icon: options.icon || '/favicon-32x32.png',
                badge: options.badge || '/favicon-32x32.png',
                tag: options.tag,
                requireInteraction: false,
                silent: false,
            });

            notification.onclick = () => {
                window.focus();
                if (options.action_url) {
                    window.location.href = options.action_url;
                }
                notification.close();
            };

            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }
};

/**
 * Request notification permission from user
 */
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';

    if (Notification.permission === 'granted') return 'granted';

    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Permission request error:', error);
            return 'denied';
        }
    }

    return Notification.permission;
};

/**
 * Get icon emoji based on notification type
 */
const getNotificationIcon = (type: string): string => {
    switch (type) {
        case 'login': return '👋';
        case 'application_approved': return '✅';
        case 'application_rejected': return '❌';
        case 'new_application': return '📝';
        case 'booking_confirmed': return '📅';
        case 'booking_cancelled': return '🚫';
        case 'booking_approved': return '✅';
        case 'session_reminder': return '⏰';
        case 'payment_received': return '💰';
        case 'funds_released': return '💸';
        case 'reschedule_requested': return '🔄';
        case 'reschedule_approved': return '✅';
        case 'dispute_raised': return '⚠️';
        case 'dispute_resolved': return '✅';
        default: return '🔔';
    }
};

export function useNotifications() {
    const { auth, notifications: initialNotifications, unreadNotificationsCount } = usePage().props as any;
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
    const [unreadCount, setUnreadCount] = useState(unreadNotificationsCount || 0);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
    const hasCheckedInitial = useRef(false);
    const hasRequestedPermission = useRef(false);

    // Sync state with Inertia props when they change (e.g., after page navigation or reload)
    useEffect(() => {
        if (initialNotifications && Array.isArray(initialNotifications)) {
            setNotifications(initialNotifications);
        }
    }, [initialNotifications]);

    useEffect(() => {
        setUnreadCount(unreadNotificationsCount || 0);
    }, [unreadNotificationsCount]);

    // Check current permission status on mount
    useEffect(() => {
        if (hasRequestedPermission.current || !auth?.user) return;
        hasRequestedPermission.current = true;

        if ('Notification' in window) {
            setPushPermission(Notification.permission);
        }
    }, [auth?.user]);

    // Check for recent unread login notifications on mount (handles race condition)
    useEffect(() => {
        if (hasCheckedInitial.current || !initialNotifications?.length) return;
        hasCheckedInitial.current = true;

        // Find login notifications from the last 10 seconds that haven't been shown
        const now = new Date().getTime();
        const recentLoginNotifications = initialNotifications.filter((n: Notification) => {
            if (n.read_at) return false;
            if (n.data?.type !== 'login') return false;
            if (shownNotificationIds.has(n.id)) return false;
            
            const createdAt = new Date(n.created_at).getTime();
            const ageInSeconds = (now - createdAt) / 1000;
            return ageInSeconds < 10; // Only show if created within last 10 seconds
        });

        // Show toast and push notification for recent login notifications
        recentLoginNotifications.forEach((n: Notification) => {
            shownNotificationIds.add(n.id);
            
            // In-app toast
            toast.success(n.data.title, {
                description: n.data.message,
                duration: 3000,
            });
            
            // Browser push notification
            showPushNotification(n.data.title, {
                body: n.data.message,
                tag: `notification-${n.id}`,
                action_url: n.data.action_url,
            });
        });
    }, [initialNotifications]);

    // Only subscribe if user exists
    const channelName = auth?.user?.id ? `App.Models.User.${auth.user.id}` : '';

    // Use the useEcho hook to listen for notifications
    // This will automatically handle subscription/cleanup
    useEcho(
        channelName,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (event: any) => {
            const notificationId = event.id || Date.now().toString();
            
            // Prevent duplicate notifications
            if (isSubscribed || shownNotificationIds.has(notificationId)) return;

            isSubscribed = true;
            shownNotificationIds.add(notificationId);
            setTimeout(() => { isSubscribed = false; }, 1000);

            // Extract notification data
            const notification = {
                id: notificationId,
                type: event.type || 'notification',
                data: event,
                read_at: null,
                created_at: new Date().toISOString(),
            };

            setNotifications((prev: Notification[]) => [notification, ...prev]);
            setUnreadCount((prev: number) => prev + 1);

            const notificationType = event.type;

            // Show browser push notification
            showPushNotification(`${getNotificationIcon(notificationType)} ${event.title}`, {
                body: event.message,
                tag: `notification-${notificationId}`,
                action_url: event.action_url,
            });

            // Show in-app toast based on type
            if (notificationType === 'application_approved' || notificationType === 'booking_approved' || notificationType === 'reschedule_approved') {
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
            } else if (notificationType === 'application_rejected' || notificationType === 'booking_cancelled' || notificationType === 'reschedule_rejected') {
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
            } else if (notificationType === 'new_application' || notificationType === 'booking_requested' || notificationType === 'reschedule_requested') {
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
            } else if (notificationType === 'session_reminder') {
                // Session reminder - warning style
                toast.warning(event.title, {
                    description: event.message,
                    action: event.action_url
                        ? {
                            label: 'View',
                            onClick: () => (window.location.href = event.action_url),
                        }
                        : undefined,
                    duration: 10000, // Longer duration for reminders
                });
            } else if (notificationType === 'dispute_raised' || notificationType === 'no_show_warning') {
                // Dispute/Warning - warning style
                toast.warning(event.title, {
                    description: event.message,
                    action: event.action_url
                        ? {
                            label: 'View',
                            onClick: () => (window.location.href = event.action_url),
                        }
                        : undefined,
                    duration: 7000,
                });
            } else if (notificationType === 'funds_released' || notificationType === 'payment_received' || notificationType === 'funds_refunded') {
                // Payment notifications - success style
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

    const markAsRead = async (notificationId: string) => {
        // Optimistic UI update
        setNotifications((prev: Notification[]) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
            )
        );
        setUnreadCount((prev: number) => Math.max(0, prev - 1));

        // Persist to backend
        try {
            await axios.post(`/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Optionally revert the optimistic update on error
        }
    };

    const markAllAsRead = async () => {
        // Optimistic UI update
        setNotifications((prev: Notification[]) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);

        // Persist to backend
        try {
            await axios.post('/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Optionally revert the optimistic update on error
        }
    };

    const requestPermission = async () => {
        const permission = await requestNotificationPermission();
        setPushPermission(permission);
        return permission;
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        requestPermission,
        pushPermission,
        isPushEnabled: pushPermission === 'granted',
    };
}
