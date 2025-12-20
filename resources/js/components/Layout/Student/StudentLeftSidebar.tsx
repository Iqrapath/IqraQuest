import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface StudentLeftSidebarProps {
    onLogoutClick?: () => void;
}

export default function StudentLeftSidebar({ onLogoutClick }: StudentLeftSidebarProps = {}) {
    const { url } = usePage();

    const menuItems = [
        { name: 'Dashboard', icon: 'mage:dashboard', route: '/student/dashboard' },
        { name: 'Browse Teachers', icon: 'hugeicons:teacher', route: '/student/teachers' },
        { name: 'My Bookings', icon: 'tabler:message-user', route: '/student/bookings' },
        { name: 'Payments', icon: 'stash:wallet', route: '/student/wallet' },
        { name: 'Messages', icon: 'mdi:message-text-outline', route: '/student/messages' },
        { name: 'Profile', icon: 'iconamoon:profile', route: '/student/profile' },
        { name: 'Rating & Feedback', icon: 'carbon:review', route: '/student/ratings' },
        { name: 'Settings', icon: 'solar:settings-outline', route: '/student/settings' },
        { name: 'Notification', icon: 'mdi:bell-outline', route: '/student/notifications' },
    ];

    const isActive = (route: string) => url.startsWith(route);

    return (
        <div
            className="box-border flex flex-col items-center px-0 relative"
            style={{
                width: 'clamp(200px, 15vw, 270px)',
                height: 'calc(100vh - clamp(100px, 8vh, 120px))',
                margin: 'clamp(0.5rem, 1vh, 1rem) 0 clamp(0.5rem, 1vh, 1rem) clamp(1rem, 2vw, 2rem)',
                padding: 'clamp(0.75rem, 1.5vh, 1.25rem) 0 clamp(1.5rem, 3vh, 2rem) 0',
                gap: 'clamp(0.5rem, 1vh, 0.75rem)'
            }}
        >
            {/* Background with backdrop blur */}
            <div
                className="absolute inset-0 bg-[#3d7872] rounded-[28px]"
                style={{
                    backdropFilter: 'blur(80px)',
                    WebkitBackdropFilter: 'blur(80px)'
                }}
            />

            {/* Main Section Label */}
            <div className="relative z-10 w-full px-[20px]">
                <p className="font-['Inter'] font-semibold text-[11px] text-white uppercase tracking-[1.2px] opacity-90">
                    Main
                </p>
            </div>

            {/* Menu Items */}
            <div className="relative z-10 flex flex-col w-full px-[16px]" style={{ gap: 'clamp(4px, 1vh, 8px)' }}>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.route}
                        className={`flex items-center justify-between px-[16px] py-[12px] rounded-[12px] transition-all duration-200 group relative ${isActive(item.route)
                            ? 'bg-[#8ba89f]'
                            : 'hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center" style={{ gap: 'clamp(10px, 1.2vw, 14px)' }}>
                            <Icon
                                icon={item.icon}
                                className="shrink-0 text-white"
                                style={{ width: 'clamp(18px, 1.8vw, 22px)', height: 'clamp(18px, 1.8vw, 22px)' }}
                            />
                            <span
                                className="font-['Poppins'] font-medium text-white leading-tight"
                                style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
                            >
                                {item.name}
                            </span>
                        </div>
                        {isActive(item.route) && (
                            <Icon
                                icon="mdi:chevron-right"
                                className="text-white/70 shrink-0"
                                style={{ width: 'clamp(16px, 1.5vw, 20px)', height: 'clamp(16px, 1.5vw, 20px)' }}
                            />
                        )}
                    </Link>
                ))}
            </div>

            {/* Logout Section */}
            <div className="relative z-10 w-full px-[16px] mt-auto">
                <button
                    onClick={onLogoutClick}
                    className="flex items-center gap-[14px] px-[16px] py-[12px] rounded-[12px] hover:bg-white/5 transition-all duration-200 w-full"
                >
                    <Icon
                        icon="solar:logout-broken"
                        className="w-[22px] h-[22px] text-white shrink-0"
                    />
                    <span className="font-['Poppins'] font-medium text-[15px] text-white leading-[22px]">
                        Log out
                    </span>
                </button>
            </div>
        </div>
    );
}
