import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

export default function Footer() {
    const { props } = usePage<any>();
    const { site_logo, site_name } = props;

    const handleBlogClick = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info('Blog feature coming soon! 📚', {
            description: 'We are working hard to bring you high-quality Quranic articles and insights.',
            position: 'top-center',
        });
    };

    return (
        <footer className="relative w-full overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-radial from-[#317b74] to-[#2F4F4C]"
                style={{
                    background: 'radial-gradient( rgba(49,123,116,1) 0%, rgba(47,79,76,1) 100%)'
                }}></div>

            {/* Background Quran Image */}
            <div
                className="absolute right-[0px] opacity-50 "
            // style={{ transform: 'rotate(332.37deg)' }}
            >
                <img
                    src="/images/beautiful-quran-mazid-removebg-preview-3.png"
                    alt=""
                    className="h-auto w-auto object-cover"
                />
            </div>

            {/* Content Container */}
            <div className="relative mx-auto max-w-[1440px] px-[clamp(2rem,4.38vw,3.938rem)]">

                {/* Main Content */}
                <div className="flex flex-col items-center gap-[clamp(3rem,5.56vw,5rem)] py-[clamp(3rem,5.56vw,5rem)]">

                    {/* Top Section - 4 Columns */}
                    <div className="flex w-full flex-col gap-[clamp(2rem,3vw,2.5rem)] lg:flex-row lg:gap-[clamp(0.5rem,0.9vw,0.813rem)] lg:items-start">

                        {/* Column 1: Logo & Description */}
                        <div className="flex flex-col gap-[clamp(1rem,1.67vw,1.5rem)] lg:w-[310.356px]">
                            {/* Logo */}
                            <Link
                                href="/"
                                className="flex w-fit items-center gap-3 rounded-[clamp(0.75rem,2vw,1.8rem)] bg-[#fffcf4] px-[clamp(0.375rem,0.75vw,0.675rem)] py-[clamp(0.25rem,0.5vw,0.45rem)] transition-transform hover:scale-105"
                            >
                                <div className="h-10 w-auto">
                                    <img
                                        src={site_logo || "/images/Logo.png"}
                                        alt={site_name || "Logo"}
                                        className="h-full w-auto object-contain"
                                    />
                                </div>
                                {/* {site_name && (
                                    <span className="font-['Nunito'] font-bold text-[#317b74] text-[18px]">
                                        {site_name}
                                    </span>
                                )} */}
                            </Link>

                            {/* Description */}
                            <p className="font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9]">
                                Empowering Quranic learning globally with top-rated teachers and a modern platform.
                            </p>

                            {/* Social Media Icons */}
                            <div className="flex items-center gap-[clamp(0.75rem,1.53vw,1.375rem)]">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-110"
                                    aria-label="Facebook"
                                >
                                    <Icon icon="mdi:facebook" className="h-[clamp(0.875rem,1.32vw,1.188rem)] w-[clamp(0.5rem,0.76vw,0.688rem)] text-white" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-110"
                                    aria-label="Twitter"
                                >
                                    <Icon icon="mdi:twitter" className="h-[clamp(0.75rem,1.04vw,0.938rem)] w-[clamp(0.875rem,1.32vw,1.188rem)] text-white" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-110"
                                    aria-label="Instagram"
                                >
                                    <Icon icon="mdi:instagram" className="h-[clamp(0.875rem,1.32vw,1.188rem)] w-[clamp(0.875rem,1.32vw,1.188rem)] text-white" />
                                </a>
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-110"
                                    aria-label="LinkedIn"
                                >
                                    <Icon icon="mdi:linkedin" className="h-[clamp(0.875rem,1.25vw,1.125rem)] w-[clamp(0.875rem,1.32vw,1.188rem)] text-white" />
                                </a>
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-transform hover:scale-110"
                                    aria-label="YouTube"
                                >
                                    <Icon icon="mdi:youtube" className="h-[clamp(0.75rem,1.04vw,0.938rem)] w-[clamp(1rem,1.46vw,1.313rem)] text-white" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="flex flex-col gap-[clamp(0.75rem,1.39vw,1.25rem)] lg:w-[241px]">
                            <h3 className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold leading-[clamp(1.25rem,2.22vw,2rem)] tracking-[0.1px] text-[#f3e5c3]">
                                Quick Links:
                            </h3>
                            <nav className="flex flex-col items-start gap-[clamp(0.375rem,0.69vw,0.625rem)]">
                                <Link
                                    href="/"
                                    className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9] transition-colors hover:text-white"
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/find-teacher"
                                    className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9] transition-colors hover:text-white"
                                >
                                    Find a Teacher
                                </Link>
                                <Link
                                    href="/how-it-works"
                                    className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9] transition-colors hover:text-white"
                                >
                                    How It Works
                                </Link>
                                <button
                                    onClick={handleBlogClick}
                                    className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9] transition-colors hover:text-white bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Blog
                                </button>
                                <Link
                                    href="/about-us"
                                    className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9] transition-colors hover:text-white"
                                >
                                    About Us
                                </Link>
                            </nav>
                        </div>

                        {/* Column 3: Features */}
                        <div className="flex flex-col gap-[clamp(0.75rem,1.39vw,1.25rem)] lg:w-[240px]">
                            <h3 className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold leading-[clamp(1.25rem,2.22vw,2rem)] tracking-[0.1px] text-[#f3e5c3]">
                                Features
                            </h3>
                            <nav className="flex flex-col gap-[clamp(0.375rem,0.69vw,0.625rem)]">
                                <Link
                                    href="/find-teacher"
                                    className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(1rem,1.67vw,1.5rem)] tracking-[0.2px] text-[#d9d9d9] transition-colors hover:text-white"
                                >
                                    Top-Rated Quran Teachers
                                </Link>
                            </nav>
                        </div>

                        {/* Column 4: Contact Us */}
                        <div className="flex flex-col gap-[clamp(1.5rem,2.78vw,2.5rem)]">
                            <h3 className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold leading-[clamp(1.25rem,2.22vw,2rem)] tracking-[0.1px] text-[#f3e5c3]">
                                Contacts us
                            </h3>

                            <div className="flex flex-col gap-[clamp(1rem,1.67vw,1.5rem)]">
                                {/* Email */}
                                <a
                                    href={`mailto:${usePage<any>().props.settings?.general?.support_email || "support@iqraquest.com"}`}
                                    className="flex items-center gap-[clamp(0.25rem,0.42vw,0.375rem)] transition-colors hover:text-white"
                                >
                                    <Icon icon="mdi:email-outline" className="h-[clamp(0.875rem,1.39vw,1.25rem)] w-[clamp(0.875rem,1.39vw,1.25rem)] shrink-0 text-[#d9d9d9]" />
                                    <span className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(0.875rem,1.39vw,1.25rem)] text-[#d9d9d9]">
                                        {usePage<any>().props.settings?.general?.support_email || "support@iqraquest.com"}
                                    </span>
                                </a>

                                {/* Phone */}
                                <a
                                    href={`tel:${usePage<any>().props.settings?.general?.contact_number || "+2347069731575"}`}
                                    className="flex items-center gap-[clamp(0.25rem,0.42vw,0.375rem)] transition-colors hover:text-white"
                                >
                                    <Icon icon="mdi:phone-outline" className="h-[clamp(0.875rem,1.39vw,1.25rem)] w-[clamp(0.875rem,1.39vw,1.25rem)] shrink-0 text-[#d9d9d9]" />
                                    <span className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(0.875rem,1.39vw,1.25rem)] text-[#d9d9d9]">
                                        {usePage<any>().props.settings?.general?.contact_number || "+234 706 973 1575"}
                                    </span>
                                </a>

                                {/* Address */}
                                <div className="flex items-start gap-[clamp(0.25rem,0.56vw,0.5rem)]">
                                    <Icon icon="mdi:map-marker-outline" className="mt-[clamp(0.125rem,0.4vw,0.356rem)] h-[clamp(0.875rem,1.39vw,1.25rem)] w-[clamp(0.875rem,1.39vw,1.25rem)] shrink-0 text-[#d9d9d9]" />
                                    <span className="font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-semibold leading-[clamp(0.875rem,1.39vw,1.25rem)] text-[#d9d9d9]">
                                        {usePage<any>().props.settings?.general?.office_address || "Iqrapath Headquarters, Lagos, Nigeria"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Copyright */}
                <div className="flex flex-col items-center justify-center gap-[clamp(1rem,22.15vw,20rem)] border-t border-white/10 pb-[clamp(2rem,3.89vw,3.5rem)] pt-[clamp(1.5rem,2.22vw,2rem)] lg:flex-row lg:justify-between">
                    <p className="whitespace-pre text-nowrap font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-normal leading-[clamp(1.25rem,2.08vw,1.875rem)] text-[#d9d9d9]">
                        © {new Date().getFullYear()} {site_name || "IqraQuest"}. All rights reserved.
                    </p>
                    <p className="text-center font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-normal leading-[clamp(1.25rem,2.08vw,1.875rem)] text-[#d9d9d9] lg:text-right">
                        <span>All Rights Reserved | </span>
                        <Link href="#terms" className="text-[#fad4b4] underline decoration-solid transition-colors hover:text-white">
                            Terms and Conditions
                        </Link>
                        <span> | </span>
                        <Link href="#privacy" className="text-[#fad4b4] underline decoration-solid transition-colors hover:text-white">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
