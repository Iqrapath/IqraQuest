import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function TooManyRequests() {
    return (
        <>
            <Head title="429 - Too Many Requests" />
            
            <div className="min-h-screen bg-gradient-to-br from-[#fde8e8] via-white to-[#fffbeb] flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Illustration */}
                        <div className="order-2 md:order-1">
                            <img 
                                src="/images/errors/429-Error-Too-Many-Requests.svg"
                                alt="Too Many Requests Illustration"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>

                        {/* Content */}
                        <div className="order-1 md:order-2 text-center md:text-left">
                            <h1 className="font-['Poppins'] text-[120px] font-bold text-[#DC9497] leading-none mb-4">429</h1>
                            <h2 className="font-['Poppins'] text-[32px] md:text-[40px] font-semibold text-[#1C2A3A] mb-4">Too Many Requests</h2>
                            <p className="font-['Nunito'] text-[18px] text-[#6B7280] mb-8">
                                You've made too many requests in a short time. Please wait a moment and try again.
                            </p>

                            <div className="mb-8 bg-[#fffbeb] border border-[#F5AD7E]/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3">
                                    <Icon icon="mdi:clock-outline" className="w-6 h-6 text-[#F5AD7E]" />
                                    <div>
                                        <p className="font-['Nunito'] text-[14px] text-[#6B7280]">
                                            Please wait a few minutes before trying again. This helps us keep the service fast for everyone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link href="/" className="inline-flex items-center gap-2 bg-[#338078] hover:bg-[#2a6b64] text-white px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all shadow-lg hover:shadow-xl">
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
