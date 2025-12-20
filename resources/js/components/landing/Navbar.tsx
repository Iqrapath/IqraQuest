import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { SharedData } from '@/types';
import { UserMenuContent } from '../user-menu-content';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from '@headlessui/react';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import NotificationBell from '../NotificationBell';

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#fff7e4] shadow-sm">
            {/* Desktop & Mobile Container */}
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-[clamp(1rem,3vw,3rem)] px-[clamp(1rem,5.56vw,5rem)] py-[clamp(0.75rem,1.5vw,1.25rem)]">

                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center gap-[clamp(0.25rem,0.5vw,0.45rem)] rounded-[clamp(0.75rem,2vw,1.8rem)] bg-[#fffcf4] px-[clamp(0.375rem,0.75vw,0.675rem)] py-[clamp(0.25rem,0.5vw,0.45rem)] transition-transform hover:scale-105">
                    <div className="relative">
                        <img src="/images/Logo.png" alt="IqraQuest Logo" className="size-full" />
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden shrink-0 items-center gap-[clamp(1.5rem,3vw,3rem)] lg:flex">
                    <Link href="/" className="group relative py-2">
                        <span className="whitespace-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium text-[#317b74] transition-colors group-hover:text-[#2a6b64]">
                            Home
                        </span>
                        <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#317b74]"></span>
                    </Link>
                    <Link href="find-teacher" className="group relative py-2">
                        <span className="whitespace-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium text-[#317b74] transition-colors group-hover:text-[#2a6b64]">
                            Find a Teacher
                        </span>
                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#317b74] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="howitworks" className="group relative py-2">
                        <span className="whitespace-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium text-[#317b74] transition-colors group-hover:text-[#2a6b64]">
                            How Its Works
                        </span>
                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#317b74] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#blog" className="group relative py-2">
                        <span className="whitespace-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium text-[#317b74] transition-colors group-hover:text-[#2a6b64]">
                            Blog
                        </span>
                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#317b74] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link href="#aboutus" className="group relative py-2">
                        <span className="whitespace-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium text-[#317b74] transition-colors group-hover:text-[#2a6b64]">
                            About Us
                        </span>
                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#317b74] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>

                {/* Desktop Sign In Button */}
                <div className="hidden shrink-0 lg:flex">
                    {auth.user ? (
                        /* Right Section - Icons & Profile */
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
                                        className="h-auto rounded-full p-0 hover:bg-transparent flex items-center cursor-pointer bg-transparent border-none shadow-none focus:outline-none"
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
                                                src={auth.user.avatar ? `/storage/${auth.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=338078&color=fff`}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-full bg-[#338078] text-white flex items-center justify-center w-full h-full">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left hidden lg:block">
                                            <p
                                                className="font-['Nunito'] font-bold leading-tight text-[#192020]"
                                                style={{ fontSize: 'clamp(15px, 1.5vw, 16px)' }}
                                            >
                                                {auth.user.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className="font-['Nunito'] font-light leading-[1.2] text-gray-500"
                                                    style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}
                                                >
                                                   {auth.user.role}
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
                                <DropdownMenuContent className="w-56 " align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        /* User is not authenticated, show Sign In link */
                        <Link href="/login" className="rounded-[clamp(1rem,3.89vw,3.5rem)] bg-[#338078] px-[clamp(1rem,1.67vw,1.5rem)] py-[clamp(0.5rem,0.83vw,0.75rem)] font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium capitalize text-white transition-all duration-300 hover:bg-[#2a6b64] hover:shadow-lg">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="flex items-center justify-center rounded-lg p-2 text-[#317b74] transition-colors hover:bg-[#fffcf4] lg:hidden"
                    aria-label="Toggle mobile menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <Icon
                        icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"}
                        className="h-7 w-7"
                    />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={toggleMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Menu - Full Width Dropdown (Infobip Style) */}
            <div
                className={`absolute left-0 right-0 top-full z-50 w-full transform bg-[#fff7e4] shadow-xl transition-all duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
                    }`}
            >
                <div className="mx-auto max-w-[1440px] px-[clamp(1rem,5.56vw,5rem)]">
                    {/* Mobile Menu Links - No Icons */}
                    <nav className="flex flex-col border-t border-[#317b74]/10 py-4">
                        <Link
                            href="/"
                            onClick={toggleMobileMenu}
                            className="border-b border-[#317b74]/10 py-4 font-['Nunito'] text-base font-semibold text-[#317b74] transition-colors hover:text-[#2a6b64]"
                        >
                            Home
                        </Link>
                        <Link
                            href="#find-teacher"
                            onClick={toggleMobileMenu}
                            className="border-b border-[#317b74]/10 py-4 font-['Nunito'] text-base font-medium text-[#317b74] transition-colors hover:text-[#2a6b64]"
                        >
                            Find a Teacher
                        </Link>
                        <Link
                            href="#about"
                            onClick={toggleMobileMenu}
                            className="border-b border-[#317b74]/10 py-4 font-['Nunito'] text-base font-medium text-[#317b74] transition-colors hover:text-[#2a6b64]"
                        >
                            About Us
                        </Link>
                        <Link
                            href="#features"
                            onClick={toggleMobileMenu}
                            className="border-b border-[#317b74]/10 py-4 font-['Nunito'] text-base font-medium text-[#317b74] transition-colors hover:text-[#2a6b64]"
                        >
                            Features
                        </Link>
                        <Link
                            href="#contact"
                            onClick={toggleMobileMenu}
                            className="border-b border-[#317b74]/10 py-4 font-['Nunito'] text-base font-medium text-[#317b74] transition-colors hover:text-[#2a6b64]"
                        >
                            Contact
                        </Link>

                        {/* Mobile Sign In Button */}
                        <div className="pb-2 pt-6">
                            <Link
                                href="/login"
                                onClick={toggleMobileMenu}
                                className="block rounded-[2rem] bg-[#338078] px-6 py-3 text-center font-['Nunito'] text-base font-medium text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                            >
                                Sign In
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
