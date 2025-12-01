import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import NotificationBell from '@/components/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import AppLogo from '@/components/app-logo';

interface GuardianHeaderProps {
    onMenuToggle?: () => void;
    showMenuButton?: boolean;
}

export default function GuardianHeader({ onMenuToggle, showMenuButton = true }: GuardianHeaderProps = {}) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const getInitials = useInitials();

    // Example earnings - In production this would come from props or API
    const earnings = 60000;

    return (
        <div className="relative w-full h-[70px] bg-gradient-to-r from-[#fffcf4] to-[#fffcf4] z-20">
            {/* Shadow Overlay */}
            <div className="absolute inset-0 shadow-[0px_4px_16px_-7px_rgba(0,0,0,0.08)]">
                {/* Background pattern/image overlay - optional */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50/30 pointer-events-none" />
            </div>

            {/* Content Container - Responsive three section layout */}
            <div className="relative h-full px-4 sm:px-6 md:px-8 lg:px-[clamp(2rem,5vw,4rem)] flex items-center justify-between lg:justify-start">
                {/* Mobile Menu Button - Only visible on mobile */}
                {showMenuButton && onMenuToggle && (
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2.5 bg-white/80 border border-[#338078]/20 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-lg shadow-md mr-3"
                        style={{
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                    >
                        <Icon icon="mdi:menu" className="w-5 h-5 text-[#338078]" />
                    </button>
                )}

                {/* Logo Section - Left */}
                <Link
                    href="/"
                    className="bg-[#fffcf4] flex items-center shrink-0 lg:ml-[clamp(8rem,2vw,12rem)] cursor-pointer"
                >
                    <AppLogo />
                </Link>

                {/* Earnings Display - Centered on desktop, hidden on mobile */}
                <div
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-gray-50/50 rounded-full"
                    style={{
                        gap: 'clamp(6px, 0.5vw, 8px)',
                        padding: 'clamp(6px, 0.5vw, 8px) clamp(12px, 1vw, 16px)'
                    }}
                >
                    <Icon
                        icon="mdi:wallet-outline"
                        className="text-gray-600"
                        style={{ width: 'clamp(18px, 1.25vw, 20px)', height: 'clamp(18px, 1.25vw, 20px)' }}
                    />
                    <div className="flex flex-col">
                        <span
                            className="text-gray-500 font-['Nunito'] uppercase"
                            style={{ fontSize: 'clamp(9px, 0.65vw, 10px)' }}
                        >
                            Earnings:
                        </span>
                        <span
                            className="font-bold text-[#192020] font-['Nunito']"
                            style={{ fontSize: 'clamp(14px, 1vw, 16px)' }}
                        >
                            ₦{earnings.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Right Section - Icons & Profile */}
                <div
                    className="ml-auto flex items-center lg:mr-[clamp(4rem,2vw,6rem)]"
                    style={{ gap: 'clamp(0.5rem, 2vw, 2rem)' }}
                >
                    {/* Icons Group - Hidden on small mobile */}
                    <div
                        className="hidden sm:flex items-center"
                        style={{ gap: 'clamp(12px, 1vw, 16px)' }}
                    >
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Message Icon */}
                        <button className="text-[#525252] hover:text-[#338078] transition-colors">
                            <Icon
                                icon="mdi:message-text-outline"
                                style={{ width: 'clamp(20px, 1.5vw, 24px)', height: 'clamp(20px, 1.5vw, 24px)' }}
                            />
                        </button>
                    </div>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-auto rounded-full p-0 hover:bg-transparent flex items-center cursor-pointer"
                                style={{ gap: 'clamp(8px, 0.75vw, 12px)' }}
                            >
                                <Avatar
                                    className="overflow-hidden rounded-full border-2 border-white shadow-sm"
                                    style={{
                                        width: 'clamp(35px, 3.5vw, 40px)',
                                        height: 'clamp(35px, 3.5vw, 40px)'
                                    }}
                                >
                                    <AvatarImage
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=338078&color=fff`}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="rounded-full bg-[#338078] text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden lg:block">
                                    <p
                                        className="font-['Nunito'] font-bold leading-tight text-[#192020]"
                                        style={{ fontSize: 'clamp(15px, 1.5vw, 16px)' }}
                                    >
                                        {user.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p
                                            className="font-['Nunito'] font-light leading-[1.2] text-gray-500"
                                            style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}
                                        >
                                            Guardian
                                        </p>
                                        <Icon
                                            icon="nrk:arrow-dropdown"
                                            className="text-[#a0a3bd]"
                                            style={{ width: 'clamp(18px, 3vw, 24px)', height: 'clamp(18px, 3vw, 24px)' }}
                                        />
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
