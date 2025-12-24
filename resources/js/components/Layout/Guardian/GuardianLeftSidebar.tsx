import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface GuardianLeftSidebarProps {
    onLogoutClick?: () => void;
}

export default function GuardianLeftSidebar({ onLogoutClick }: GuardianLeftSidebarProps = {}) {
    const { url } = usePage();

    const menuItems: { name: string; icon: string; route: string; comingSoon?: boolean }[] = [
        { name: 'Dashboard', icon: 'mage:dashboard', route: '/guardian/dashboard' },
        { name: 'Browse Teachers', icon: 'hugeicons:teacher', route: '/guardian/teachers' },
        { name: 'My Bookings', icon: 'tabler:message-user', route: '/guardian/bookings' },
        // { name: 'Subscriptions', icon: 'eos-icons:subscriptions-created-outlined', route: '#', comingSoon: true },
        { name: 'Payments', icon: 'stash:wallet', route: '/guardian/wallet' },
        { name: 'Messages', icon: 'mdi:message-text-outline', route: '/guardian/messages' },
        { name: 'Profile', icon: 'iconamoon:profile', route: '/guardian/profile' },
        { name: 'Rating & Feedback', icon: 'carbon:review', route: '/guardian/ratings' },
        { name: 'Settings', icon: 'solar:settings-outline', route: '/guardian/settings' },
        { name: 'Notification', icon: 'mdi:bell-outline', route: '/guardian/notifications' },
    ];

    const isActive = (route: string) => route !== '#' && url.startsWith(route);

    const handleComingSoonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info('Subscriptions coming soon!', {
            description: 'We\'re working hard to bring you subscription plans. Stay tuned!',
            icon: '🚧',
        });
    };

    return (
        <div
            className="box-border flex flex-col items-center px-0 relative overflow-hidden"
            style={{
                width: 'clamp(200px, 15vw, 270px)',
                height: 'calc(100vh - clamp(100px, 8vh, 120px))',
                margin: 'clamp(0.5rem, 1vh, 1rem) 0 clamp(0.5rem, 1vh, 1rem) clamp(1rem, 2vw, 2rem)',
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

            {/* Content Container - scrollable if needed */}
            <div 
                className="relative z-10 flex flex-col w-full h-full overflow-y-auto overflow-x-hidden sidebar-scroll"
                style={{
                    padding: 'clamp(0.75rem, 1.5vh, 1.25rem) 0 clamp(1rem, 2vh, 1.5rem) 0',
                    gap: 'clamp(0.5rem, 1vh, 0.75rem)'
                }}
            >
                <style>{`
                    .sidebar-scroll::-webkit-scrollbar {
                        width: 4px;
                    }
                    .sidebar-scroll::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .sidebar-scroll::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 4px;
                    }
                    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.5);
                    }
                    .sidebar-scroll {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
                    }
                `}</style>
                {/* Main Section Label */}
                <div className="w-full px-[20px] shrink-0">
                    <p className="font-['Inter'] font-semibold text-[11px] text-white uppercase tracking-[1.2px] opacity-90">
                        Main
                    </p>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col w-full px-[16px] shrink-0" style={{ gap: 'clamp(4px, 1vh, 8px)' }}>
                    {menuItems.map((item) => (
                        item.comingSoon ? (
                            <button
                                key={item.name}
                                onClick={handleComingSoonClick}
                                className="flex items-center justify-between px-[16px] py-[12px] rounded-[12px] transition-all duration-200 group relative hover:bg-white/5 w-full text-left"
                            >
                                <div className="flex items-center" style={{ gap: 'clamp(10px, 1.2vw, 14px)' }}>
                                    <Icon
                                        icon={item.icon}
                                        className="shrink-0 text-white/60"
                                        style={{ width: 'clamp(18px, 1.8vw, 22px)', height: 'clamp(18px, 1.8vw, 22px)' }}
                                    />
                                    <span
                                        className="font-['Poppins'] font-medium text-white/60 leading-tight"
                                        style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
                                    >
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-[9px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full font-medium">
                                    Soon
                                </span>
                            </button>
                        ) : (
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
                        )
                    ))}
                </div>

                {/* Logout Section */}
                <div className="w-full px-[16px] shrink-0">
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

                {/* Spacer to push promo card to bottom */}
                <div className="flex-1 min-h-[8px]" />

                {/* Subscription Promo Card - Coming Soon */}
                <div className="w-full px-[12px] shrink-0">
                    <div 
                        className="rounded-[11px] px-[11px] py-[15px] flex flex-col items-start gap-[12px] cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ 
                            background: 'linear-gradient(transparent, #F3E5C3)'
                        }}
                        onClick={handleComingSoonClick}
                    >
                        {/* Quran Image */}
                        <div className="w-full flex justify-center">
                            <img 
                                src="/images/quran-stand.png" 
                                alt="Quran on stand" 
                                className="w-[70px] h-auto object-contain"
                            />
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col gap-[6px]">
                            <h3 className="font-['Poppins'] font-medium text-[13px] leading-[1.3] text-[#F5F0E1]">
                                Want your kids to be<br />
                                a <span className="text-[#FFF7E4]">Hafiz</span> in 6 months?
                            </h3>
                            <p className="font-['Poppins'] font-normal text-[9px] leading-[1.4] text-white/80 italic">
                                Full Quran, Half Quran, or Juz' Amma –<br />
                                Tailored Learning for Every Student.
                            </p>
                        </div>

                        {/* Enroll Button */}
                        <button
                            className="inline-flex items-center justify-center gap-2 px-[18px] py-[6px] bg-[#3D7872] hover:bg-[#2d5f5a] rounded-full transition-colors"
                        >
                            <span className="font-['Poppins'] font-medium text-[11px] text-[#F3E5C3]">
                                Coming Soon
                            </span>
                            <span className="text-[10px]">🚧</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
