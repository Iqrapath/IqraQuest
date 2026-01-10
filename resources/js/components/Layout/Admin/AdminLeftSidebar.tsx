import React, { useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface AdminLeftSidebarProps {
    onLogoutClick?: () => void;
}

export default function AdminLeftSidebar({ onLogoutClick }: AdminLeftSidebarProps = {}) {
    const { url, props } = usePage<any>();
    const { auth, site_logo, site_name, unreadMessagesCount, unreadNotificationsCount, pendingTeacherApplicationsCount, pendingPayoutsCount } = props;
    const userId = auth?.user?.id;

    useEffect(() => {
        if (!userId) return;

        // Listen for system notifications
        const notificationChannel = (window as any).Echo.private(`App.Models.User.${userId}`)
            .notification((notification: any) => {
                router.reload({ only: ['unreadNotificationsCount', 'pendingTeacherApplicationsCount', 'pendingPayoutsCount'] });
            });

        // Listen for new messages
        const messageChannel = (window as any).Echo.private(`user.${userId}`)
            .listen('.new.message', (data: any) => {
                router.reload({ only: ['unreadMessagesCount'] });
            });

        return () => {
            (window as any).Echo.leave(`App.Models.User.${userId}`);
            (window as any).Echo.leave(`user.${userId}`);
        };
    }, [userId]);

    const mainMenuItems = [
        { name: 'Dashboard', icon: 'solar:widget-5-outline', route: '/admin/dashboard' },
        { name: 'Teacher Management', icon: 'hugeicons:teacher', route: '/admin/teachers' },
        { name: 'Parent Management', icon: 'ri:parent-line', route: '/admin/students' },
        { name: 'Booking Management', icon: 'solar:calendar-outline', route: '/admin/bookings' },
        { name: 'Verification Requests', icon: 'uil:comment-verify', route: '/admin/verifications', badge: pendingTeacherApplicationsCount },
        { name: 'Subscription Plans', icon: 'eos-icons:subscriptions-created-outlined', route: '#', comingSoon: true },
        { name: 'Guardian Management', icon: 'fluent:guardian-28-regular', route: '#', comingSoon: true },
        { name: 'Payment Management', icon: 'streamline-plump:wallet', route: '/admin/payments', badge: pendingPayoutsCount },
    ];

    const cmsItems = [
        { name: 'CMS', icon: 'simple-icons:payloadcms', route: '#', comingSoon: true },
        { name: 'Admin Controls', icon: 'carbon:network-admin-control', route: '#', comingSoon: true },
        { name: 'Referrals System', icon: 'carbon:review', route: '#', comingSoon: true },
    ];

    const settingsItems = [
        { name: 'Settings & Security', icon: 'solar:settings-outline', route: '#', comingSoon: true },
        { name: 'Notification System', icon: 'solar:bell-outline', route: '/admin/notifications', badge: unreadNotificationsCount },
        { name: 'Messages', icon: 'mdi:message-text-outline', route: '/admin/messages', badge: unreadMessagesCount },
        { name: 'Feedback & Support', icon: 'fluent:person-support-20-regular', route: '#', comingSoon: true },
    ];

    const isActive = (route: string) => route !== '#' && url.startsWith(route);

    const handleComingSoonClick = (e: React.MouseEvent, itemName: string) => {
        e.preventDefault();
        toast.info(`${itemName} is coming soon!`, {
            description: 'We\'re working hard to bring you this feature. Stay tuned!',
            icon: '🚧',
        });
    };

    const renderMenuItem = (item: { name: string; icon: string; route: string; comingSoon?: boolean; badge?: number; badgeColor?: string }) => {
        if (item.comingSoon) {
            return (
                <button
                    key={item.name}
                    onClick={(e) => handleComingSoonClick(e, item.name)}
                    className="flex items-center px-[16px] py-[10px] rounded-[8px] transition-all duration-200 group relative hover:bg-[#F3E5C3]/10 w-full text-left"
                >
                    <div className="flex items-center gap-[12px] flex-1">
                        <Icon
                            icon={item.icon}
                            className="shrink-0 text-white/60"
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span className="font-['Poppins'] font-normal text-[13px] text-white/60 leading-tight">
                            {item.name}
                        </span>
                        <span className="ml-auto text-[9px] bg-[#F3E5C3]/20 text-[#F3E5C3] px-1.5 py-0.5 rounded-full font-medium">
                            Soon
                        </span>
                    </div>
                </button>
            );
        }

        return (
            <Link
                key={item.name}
                href={item.route}
                className={`flex items-center px-[16px] py-[10px] rounded-[8px] transition-all duration-200 group relative ${isActive(item.route)
                    ? 'bg-[#F3E5C3]/50'
                    : 'hover:bg-[#F3E5C3]/10'
                    }`}
            >
                <div className="flex items-center gap-[12px] flex-1">
                    <Icon
                        icon={item.icon}
                        className="shrink-0 text-white"
                        style={{ width: '18px', height: '18px' }}
                    />
                    <span className="font-['Poppins'] font-normal text-[13px] text-white leading-tight">
                        {item.name}
                    </span>
                    {(item.badge ?? 0) > 0 && (
                        <span
                            className="ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                            style={{ backgroundColor: item.badgeColor || '#ff4d4d' }}
                        >
                            {item.badge! > 99 ? '99+' : item.badge}
                        </span>
                    )}
                </div>
            </Link>
        );
    };

    return (
        <div
            className="relative rounded-[24px] bg-[#3d7872]"
            style={{
                width: 'clamp(200px, 15vw, 270px)',
                height: 'calc(100vh - clamp(100px, 8vh, 120px))',
                margin: 'clamp(0.5rem, 1vh, 1rem) 0 clamp(0.5rem, 1vh, 1rem) clamp(1rem, 2vw, 2rem)',
                backdropFilter: 'blur(80px)',
                WebkitBackdropFilter: 'blur(80px)',
            }}
        >
            {/* Scrollable content */}
            <div
                className="absolute inset-0 overflow-y-auto rounded-[24px]"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#8ba89f transparent',
                }}
            >
                <div className="p-[16px] flex flex-col gap-[20px] min-h-full"
                    style={{
                        paddingTop: 'clamp(1.25rem, 2vh, 1.5rem)',
                        paddingBottom: 'clamp(1.5rem, 3vh, 2rem)',
                    }}
                >
                    {/* MAIN Section */}
                    <div className="flex flex-col gap-[8px]">
                        <p className="font-['Inter'] font-semibold text-[10px] text-white/60 uppercase tracking-[1.5px] px-[16px] mb-[4px]">
                            MAIN
                        </p>
                        <div className="flex flex-col gap-[4px]">
                            {mainMenuItems.map(renderMenuItem)}
                        </div>
                    </div>

                    {/* CMS Section */}
                    <div className="flex flex-col gap-[8px] pt-[16px] border-t border-white/50">
                        <p className="font-['Inter'] font-semibold text-[10px] text-white/60 uppercase tracking-[1.5px] px-[16px] mb-[4px]">
                            CMS
                        </p>
                        <div className="flex flex-col gap-[4px]">
                            {cmsItems.map(renderMenuItem)}
                        </div>
                    </div>

                    {/* SETTINGS Section */}
                    <div className="flex flex-col gap-[8px] pt-[16px] border-t border-white/50">
                        <p className="font-['Inter'] font-semibold text-[10px] text-white/60 uppercase tracking-[1.5px] px-[16px] mb-[4px]">
                            SETTINGS
                        </p>
                        <div className="flex flex-col gap-[4px]">
                            {settingsItems.map(renderMenuItem)}
                        </div>
                    </div>

                    {/* Logout Section */}
                    <div className="pt-[16px] border-t border-white/50">
                        <button
                            onClick={onLogoutClick}
                            className="flex items-center gap-[12px] px-[16px] py-[10px] rounded-[8px] hover:bg-white/5 transition-all duration-200 w-full"
                        >
                            <Icon
                                icon="solar:logout-broken"
                                className="w-[18px] h-[18px] text-white shrink-0"
                            />
                            <span className="font-['Poppins'] font-normal text-[13px] text-white leading-tight">
                                Log out
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
