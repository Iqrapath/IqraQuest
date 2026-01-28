import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Page Not Found" />
            
            <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#fdf4ff] flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Illustration */}
                        <div className="order-2 md:order-1">
                            <img 
                                src="/images/errors/404-Error-Page-Not-Found.svg"
                                alt="Page Not Found Illustration"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>

                        {/* Content */}
                        <div className="order-1 md:order-2 text-center md:text-left">
                            <h1 className="font-['Poppins'] text-[120px] font-bold text-[#4D9B91] leading-none mb-4">404</h1>
                            <h2 className="font-['Poppins'] text-[32px] md:text-[40px] font-semibold text-[#1C2A3A] mb-4">Page Not Found</h2>
                            <p className="font-['Nunito'] text-[18px] text-[#6B7280] mb-8">
                                Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link href="/" className="inline-flex items-center gap-2 bg-[#338078] hover:bg-[#2a6b64] text-white px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all shadow-lg hover:shadow-xl">
                                    <Icon icon="mdi:home" className="w-5 h-5" />
                                    Go to Homepage
                                </Link>
                                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#338078] px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all border-2 border-[#338078]">
                                    <Icon icon="mdi:view-dashboard" className="w-5 h-5" />
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
