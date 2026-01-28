import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function ServerError() {
    return (
        <>
            <Head title="500 - Server Error" />
            
            <div className="min-h-screen bg-gradient-to-br from-[#fde8e8] via-white to-[#f0fdf4] flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Illustration */}
                        <div className="order-2 md:order-1">
                            <img 
                                src="/images/errors/500-Error-Internal-Server-Error.svg"
                                alt="Server Error Illustration"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>

                        {/* Content */}
                        <div className="order-1 md:order-2 text-center md:text-left">
                            <h1 className="font-['Poppins'] text-[120px] font-bold text-[#DC9497] leading-none mb-4">500</h1>
                            <h2 className="font-['Poppins'] text-[32px] md:text-[40px] font-semibold text-[#1C2A3A] mb-4">Server Error</h2>
                            <p className="font-['Nunito'] text-[18px] text-[#6B7280] mb-8">
                                Oops! Something went wrong on our end. Our team has been notified and is working to fix it.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-[#338078] hover:bg-[#2a6b64] text-white px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all shadow-lg hover:shadow-xl">
                                    <Icon icon="mdi:refresh" className="w-5 h-5" />
                                    Try Again
                                </button>
                                <Link href="/" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#338078] px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all border-2 border-[#338078]">
                                    <Icon icon="mdi:home" className="w-5 h-5" />
                                    Go to Homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
