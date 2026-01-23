import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-white font-[Nunito]">
            <Head title="Blog - IqraQuest" />
            <Navbar />

            <main className="pt-32 pb-20 px-4 text-center">
                <div className="max-w-[800px] mx-auto space-y-8">
                    <div className="inline-block px-4 py-2 bg-[#E9FBF9] text-[#338078] rounded-full text-sm font-bold tracking-wider uppercase">
                        Coming Soon
                    </div>
                    <h1 className="text-[48px] md:text-[64px] font-bold text-[#101928] leading-tight">
                        Insightful Stories & Quranic Knowledge
                    </h1>
                    <p className="text-[#667085] text-[20px] leading-relaxed max-w-[600px] mx-auto">
                        We're currently crafting high-quality content to help you on your spiritual and educational journey. Stay tuned!
                    </p>

                    <div className="pt-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-50 aspect-[4/3] rounded-[24px] animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
