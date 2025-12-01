import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface AdminLeftSidebarProps {
    onLogoutClick?: () => void;
}

export default function AdminLeftSidebar({ onLogoutClick }: AdminLeftSidebarProps = {}) {
    const { url } = usePage();

    const mainMenuItems = [
        { name: 'Dashboard', icon: 'solar:widget-5-outline', route: '/admin/dashboard' },
        { name: 'Teacher Management', icon: 'hugeicons:teacher', route: '/admin/teachers' },
        { name: 'Parent Management', icon: 'ri:parent-line', route: '/admin/parents' },
        { name: 'Booking Management', icon: 'solar:calendar-outline', route: '/admin/bookings' },
        { name: 'Verification Requests', icon: 'uil:comment-verify', route: '/admin/verifications' },
        { name: 'Subscription Plan', icon: 'eos-icons:subscriptions-created-outlined', route: '/admin/subscriptions' },
        { name: 'Guardian Management', icon: 'fluent:guardian-28-regular', route: '/admin/guardians' },
        { name: 'Payment Management', icon: 'streamline-plump:wallet', route: '/admin/payments' },
    ];

    const cmsItems = [
        { name: 'CMS', icon: 'simple-icons:payloadcms', route: '/admin/cms' },
        { name: 'Admin Controls', icon: 'carbon:network-admin-control', route: '/admin/admin-controls' },
        { name: 'Referrals System', icon: 'carbon:review', route: '/admin/referrals' },
    ];

    const settingsItems = [
        { name: 'Settings & Security', icon: 'solar:settings-outline', route: '/admin/settings' },
        { name: 'Notification System', icon: 'solar:bell-outline', route: '/admin/notifications' },
        { name: 'Feedback & Support', icon: 'fluent:person-support-20-regular', route: '/admin/feedback' },
    ];

    const isActive = (route: string) => url.startsWith(route);

    const renderMenuItem = (item: { name: string; icon: string; route: string }) => (
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
            </div>
        </Link>
    );

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

                    {/* Spacer to push logout to bottom */}
                    {/* <div className="flex-1 min-h-[20px]" /> */}

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
