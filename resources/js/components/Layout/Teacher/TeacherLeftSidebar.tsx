import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function TeacherLeftSidebar() {
    const { url } = usePage();

    const menuItems = [
        { name: 'Dashboard', icon: 'mdi:view-dashboard-outline', route: '/teacher/dashboard' },
        { name: 'My Students', icon: 'mdi:account-group-outline', route: '/teacher/students' },
        { name: 'Messages', icon: 'mdi:message-text-outline', route: '/teacher/messages' },
        { name: 'Finance', icon: 'mdi:finance', route: '/teacher/finance' },
        { name: 'Calendar', icon: 'mdi:calendar-blank-outline', route: '/teacher/calendar' },
        { name: 'Settings', icon: 'mdi:cog-outline', route: '/teacher/settings' },
    ];

    const isActive = (route: string) => url.startsWith(route);

    return (
        <div
            className="rounded-[28px] bg-[#338078] text-white flex flex-col relative overflow-hidden shadow-xl"
            style={{
                width: 'clamp(200px, 15vw, 256px)',
                height: 'calc(100vh - clamp(120px, 10vh, 140px))',
                margin: 'clamp(1rem, 2vh, 2rem) 0 clamp(1rem, 2vh, 2rem) clamp(1rem, 2vw, 2rem)'
            }}
        >
            {/* Background Pattern/Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#338078] to-[#2a6e67] opacity-50 pointer-events-none"></div>

            {/* Main Navigation Section */}
            <div className="relative z-10 flex-1 py-8 px-4 flex flex-col gap-8">

                {/* Main Menu Group */}
                <div className="flex flex-col gap-2">
                    <p className="px-6 text-xs font-medium uppercase tracking-wider text-white/60 mb-2 font-['Inter']">
                        Main
                    </p>

                    <div className="flex flex-col gap-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.route}
                                className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-200 group ${isActive(item.route)
                                    ? 'bg-white text-[#338078] shadow-md font-bold'
                                    : 'text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon
                                    icon={item.icon}
                                    className={`w-6 h-6 ${isActive(item.route) ? 'text-[#338078]' : 'text-white'}`}
                                />
                                <span className={`text-sm font-['Poppins'] ${isActive(item.route) ? 'font-bold' : 'font-medium'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Logout Section at Bottom */}
                <div className="mt-auto">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl text-white hover:bg-white/10 transition-all duration-200"
                    >
                        <Icon icon="mdi:logout" className="w-6 h-6 text-white" />
                        <span className="text-sm font-medium font-['Poppins']">Log Out</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
