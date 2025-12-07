import { Link, usePage, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import NotificationBell from '@/components/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import AppLogo from '@/components/app-logo';
import { useCurrency, CURRENCY_CONFIG, CurrencyCode } from '@/contexts/CurrencyContext';
import axios from 'axios';

interface GuardianHeaderProps {
    onMenuToggle?: () => void;
    showMenuButton?: boolean;
}

export default function GuardianHeader({ onMenuToggle, showMenuButton = true }: GuardianHeaderProps = {}) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const { currency, setCurrency, convert, rates, loading } = useCurrency();

    // Calculate converted balance
    // Base balance is in auth.wallet_balance (e.g. 50000) and auth.wallet_currency (e.g. NGN)
    // We want to convert TO selected 'currency' (e.g., USD)
    const walletBalance = auth.wallet_balance || 0;
    const baseCurrency = (auth.wallet_currency || 'NGN') as CurrencyCode;

    // Use converted amount if rates are available, otherwise fallback to base
    const displayAmount = loading ? walletBalance : convert(walletBalance, baseCurrency, currency);
    const displaySymbol = CURRENCY_CONFIG[currency]?.symbol || '';

    const handleCurrencyChange = (value: CurrencyCode) => {
        // Only update display currency (no backend persistence)
        // The wallet's actual currency should not be changed via this dropdown
        setCurrency(value);
    };

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
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-[#FFF9F0] rounded-full shadow-sm border border-[#FFF9F0] hover:border-[#2D7A70]/10 transition-colors cursor-pointer group"
                    style={{
                        gap: 'clamp(16px, 1.5vw, 24px)',
                        padding: 'clamp(8px, 0.5vw, 10px) clamp(20px, 1.5vw, 32px)'
                    }}
                >
                    {/* Label Group */}
                    <div className="flex items-center gap-3">
                        <Icon
                            icon="solar:wallet-outline"
                            className="text-gray-500 group-hover:text-[#2D7A70] transition-colors"
                            style={{ width: 'clamp(24px, 1.5vw, 28px)', height: 'clamp(24px, 1.5vw, 28px)' }}
                        />
                        <span
                            className="text-[#192020] font-['Nunito'] font-medium"
                            style={{ fontSize: 'clamp(16px, 1vw, 18px)' }}
                        >
                            Wallet:
                        </span>
                    </div>

                    {/* Amount Group with Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex flex-col items-start leading-none cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-[#2D7A70] text-[10px] md:text-xs font-bold uppercase tracking-wide font-['Nunito']">
                                        {currency}
                                    </span>
                                    <Icon icon="heroicons:chevron-down-20-solid" className="w-3 h-3 text-[#2D7A70]" />
                                </div>
                                <span
                                    className="font-bold text-[#192020] font-['Nunito']"
                                    style={{ fontSize: 'clamp(20px, 1.5vw, 24px)' }}
                                >
                                    {loading ? (
                                        <span className="opacity-50 text-base">Loading...</span>
                                    ) : (
                                        <>
                                            {displaySymbol}
                                            {new Intl.NumberFormat('en-US', {
                                                maximumFractionDigits: 2,
                                                minimumFractionDigits: 2
                                            }).format(displayAmount)}
                                        </>
                                    )}
                                </span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-gray-100 p-1 min-w-[120px]">
                            {Object.keys(CURRENCY_CONFIG).map((code) => (
                                <DropdownMenuItem
                                    key={code}
                                    onClick={() => handleCurrencyChange(code as CurrencyCode)}
                                    className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium ${currency === code
                                        ? 'bg-[#2D7A70]/10 text-[#2D7A70]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>{code}</span>
                                        <span className="text-gray-400 text-xs">{CURRENCY_CONFIG[code as CurrencyCode].symbol}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                        src={user.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=338078&color=fff`}
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
