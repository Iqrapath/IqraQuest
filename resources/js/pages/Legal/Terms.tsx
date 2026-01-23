import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

interface Props {
    content: string;
}

export default function Terms({ content }: Props) {
    return (
        <div className="min-h-screen bg-white font-[Nunito]">
            <Head title="Terms & Conditions" />
            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-[1000px] mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-[48px] font-bold text-[#101928] mb-4">Terms & Conditions</h1>
                        <p className="text-[#667085] text-[18px]">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-white rounded-[24px] border border-[#F2F4F7] p-8 md:p-12 shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.1)]">
                        <div
                            className="prose prose-lg max-w-none text-[#344054] 
                            prose-headings:text-[#101928] prose-headings:font-bold
                            prose-p:leading-[1.8] prose-li:leading-[1.8]
                            prose-strong:text-[#338078] prose-a:text-[#338078] prose-a:font-semibold"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-[#667085] mb-6">Have questions about our terms?</p>
                        <Link
                            href="/about-us"
                            className="bg-[#338078] text-white px-8 py-3 rounded-[12px] font-semibold hover:bg-[#2a6b64] transition-all inline-block"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
