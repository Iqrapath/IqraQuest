import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function ErrorPreview() {
    const errorPages = [
        // Client Errors (4xx)
        { code: '400', title: 'Bad Request', color: 'bg-[#F5AD7E]', icon: 'mdi:alert-circle-outline', category: 'Client Errors' },
        { code: '401', title: 'Unauthorized', color: 'bg-[#DC9497]', icon: 'mdi:account-lock-outline', category: 'Client Errors' },
        { code: '403', title: 'Access Forbidden', color: 'bg-[#DC9497]', icon: 'mdi:lock-outline', category: 'Client Errors' },
        { code: '404', title: 'Page Not Found', color: 'bg-[#4D9B91]', icon: 'mdi:compass-off-outline', category: 'Client Errors' },
        { code: '405', title: 'Method Not Allowed', color: 'bg-[#4D9B91]', icon: 'mdi:block-helper', category: 'Client Errors' },
        { code: '408', title: 'Request Timeout', color: 'bg-[#F5AD7E]', icon: 'mdi:timer-off-outline', category: 'Client Errors' },
        { code: '419', title: 'Page Expired', color: 'bg-[#F5AD7E]', icon: 'mdi:clock-alert-outline', category: 'Client Errors' },
        { code: '429', title: 'Too Many Requests', color: 'bg-[#DC9497]', icon: 'mdi:speedometer', category: 'Client Errors' },
        
        // Server Errors (5xx)
        { code: '500', title: 'Server Error', color: 'bg-[#DC9497]', icon: 'mdi:server-off', category: 'Server Errors' },
        { code: '502', title: 'Bad Gateway', color: 'bg-[#DC9497]', icon: 'mdi:server-network-off', category: 'Server Errors' },
        { code: '503', title: 'Service Unavailable', color: 'bg-[#ACA1CD]', icon: 'mdi:tools', category: 'Server Errors' },
        { code: '504', title: 'Gateway Timeout', color: 'bg-[#F5AD7E]', icon: 'mdi:clock-alert', category: 'Server Errors' },
    ];

    const clientErrors = errorPages.filter(e => e.category === 'Client Errors');
    const serverErrors = errorPages.filter(e => e.category === 'Server Errors');

    return (
        <>
            <Head title="Error Pages Preview" />
            
            <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#fdf4ff] py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-['Poppins'] text-[48px] font-bold text-[#1C2A3A] mb-4">
                            IqraQuest Error Pages
                        </h1>
                        <p className="font-['Nunito'] text-[18px] text-[#6B7280]">
                            Preview all custom error page designs
                        </p>
                    </div>

                    {/* Error Page Grid */}
                    <div className="space-y-12">
                        {/* Client Errors Section */}
                        <div>
                            <div className="mb-6">
                                <h2 className="font-['Poppins'] text-[32px] font-bold text-[#1C2A3A] mb-2">
                                    Client Errors (4xx)
                                </h2>
                                <p className="font-['Nunito'] text-[16px] text-[#6B7280]">
                                    Errors caused by client requests or authentication issues
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {clientErrors.map((error) => (
                                    <Link
                                        key={error.code}
                                        href={`/preview/error/${error.code}`}
                                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-[#4D9B91] p-6 transition-all hover:shadow-xl"
                                    >
                                        <div className={`w-16 h-16 rounded-full ${error.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <Icon icon={error.icon} className={`w-8 h-8 ${error.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        
                                        <h2 className="font-['Poppins'] text-[48px] font-bold text-[#1C2A3A] leading-none mb-2">
                                            {error.code}
                                        </h2>
                                        
                                        <h3 className="font-['Poppins'] text-[16px] font-semibold text-[#1C2A3A] mb-3">
                                            {error.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 text-[#4D9B91] font-['Nunito'] font-medium text-[14px]">
                                            <span>View Page</span>
                                            <Icon icon="mdi:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Server Errors Section */}
                        <div>
                            <div className="mb-6">
                                <h2 className="font-['Poppins'] text-[32px] font-bold text-[#1C2A3A] mb-2">
                                    Server Errors (5xx)
                                </h2>
                                <p className="font-['Nunito'] text-[16px] text-[#6B7280]">
                                    Errors caused by server-side issues or maintenance
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {serverErrors.map((error) => (
                                    <Link
                                        key={error.code}
                                        href={`/preview/error/${error.code}`}
                                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-[#4D9B91] p-6 transition-all hover:shadow-xl"
                                    >
                                        <div className={`w-16 h-16 rounded-full ${error.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <Icon icon={error.icon} className={`w-8 h-8 ${error.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        
                                        <h2 className="font-['Poppins'] text-[48px] font-bold text-[#1C2A3A] leading-none mb-2">
                                            {error.code}
                                        </h2>
                                        
                                        <h3 className="font-['Poppins'] text-[16px] font-semibold text-[#1C2A3A] mb-3">
                                            {error.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 text-[#4D9B91] font-['Nunito'] font-medium text-[14px]">
                                            <span>View Page</span>
                                            <Icon icon="mdi:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-12 bg-[#fffbeb] border border-[#F5AD7E]/20 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <Icon icon="mdi:information-outline" className="w-6 h-6 text-[#F5AD7E] flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-['Poppins'] font-semibold text-[16px] text-[#1C2A3A] mb-2">
                                    Preview Mode
                                </h3>
                                <p className="font-['Nunito'] text-[14px] text-[#6B7280] mb-3">
                                    These preview routes are only available in local development environment. 
                                    In production, these pages will automatically display when the corresponding HTTP errors occur.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-[12px] font-['Nunito'] font-medium text-[#6B7280]">
                                        <Icon icon="mdi:check-circle" className="w-4 h-4 text-[#4D9B91]" />
                                        12 Error Pages
                                    </span>
                                    <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-[12px] font-['Nunito'] font-medium text-[#6B7280]">
                                        <Icon icon="mdi:check-circle" className="w-4 h-4 text-[#4D9B91]" />
                                        Responsive Design
                                    </span>
                                    <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-[12px] font-['Nunito'] font-medium text-[#6B7280]">
                                        <Icon icon="mdi:check-circle" className="w-4 h-4 text-[#4D9B91]" />
                                        Custom SVG Illustrations
                                    </span>
                                    <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-[12px] font-['Nunito'] font-medium text-[#6B7280]">
                                        <Icon icon="mdi:check-circle" className="w-4 h-4 text-[#4D9B91]" />
                                        On-Brand Colors
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-[#4D9B91] hover:text-[#338078] font-['Nunito'] font-medium text-[16px] transition-colors"
                        >
                            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                            Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
