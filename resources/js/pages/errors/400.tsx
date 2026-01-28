import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function BadRequest() {
    return (
        <>
            <Head title="400 - Bad Request" />
            
            <div className="min-h-screen bg-gradient-to-br from-[#fffbeb] via-white to-[#fde8e8] flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Illustration */}
                        <div className="order-2 md:order-1">
                            <img 
                                src="/images/errors/400-Error-Bad-Request.svg"
                                alt="Bad Request Illustration"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>

                        {/* Content */}
                        <div className="order-1 md:order-2 text-center md:text-left">
                            <h1 className="font-['Poppins'] text-[120px] font-bold text-[#F5AD7E] leading-none mb-4">400</h1>
                            <h2 className="font-['Poppins'] text-[32px] md:text-[40px] font-semibold text-[#1C2A3A] mb-4">Bad Request</h2>
                            <p className="font-['Nunito'] text-[18px] text-[#6B7280] mb-8">
                                The request could not be understood by the server. Please check your input and try again.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 bg-[#338078] hover:bg-[#2a6b64] text-white px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all shadow-lg hover:shadow-xl">
                                    <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                                    Go Back
                                </button>
                                <Link href="/" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#338078] px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all border-2 border-[#338078]">
                                    <Icon icon="mdi:home" className="w-5 h-5" />
                                    Homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
