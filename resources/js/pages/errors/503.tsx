import { Head } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function ServiceUnavailable() {
    return (
        <>
            <Head title="503 - Service Unavailable" />
            
            <div className="min-h-screen bg-gradient-to-br from-[#ACA1CD]/10 via-white to-[#f0fdf4] flex items-center justify-center px-4 py-8">
                <div className="max-w-4xl w-full">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Illustration */}
                        <div className="order-2 md:order-1">
                            <img 
                                src="/images/errors/503-Error-Service-Unavailable.svg"
                                alt="Service Unavailable Illustration"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>

                        {/* Content */}
                        <div className="order-1 md:order-2 text-center md:text-left">
                            <h1 className="font-['Poppins'] text-[120px] font-bold text-[#ACA1CD] leading-none mb-4">503</h1>
                            <h2 className="font-['Poppins'] text-[32px] md:text-[40px] font-semibold text-[#1C2A3A] mb-4">Under Maintenance</h2>
                            <p className="font-['Nunito'] text-[18px] text-[#6B7280] mb-6">
                                We're currently performing scheduled maintenance to improve your experience. We'll be back shortly!
                            </p>

                            <div className="mb-8 inline-flex items-center gap-2 bg-[#f0fdf4] px-6 py-3 rounded-full border border-[#4D9B91]/20">
                                <div className="w-2 h-2 rounded-full bg-[#4D9B91] animate-pulse"></div>
                                <span className="font-['Nunito'] text-[14px] text-[#4D9B91] font-medium">Maintenance in progress</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-[#338078] hover:bg-[#2a6b64] text-white px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all shadow-lg hover:shadow-xl">
                                    <Icon icon="mdi:refresh" className="w-5 h-5" />
                                    Check Again
                                </button>
                                <a href="https://twitter.com/iqraquest" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#338078] px-8 py-3 rounded-full font-['Nunito'] font-semibold text-[16px] transition-all border-2 border-[#338078]">
                                    <Icon icon="mdi:twitter" className="w-5 h-5" />
                                    Status Updates
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
