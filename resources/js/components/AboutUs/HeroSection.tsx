import React from 'react';

export default function HeroSection() {
    return (
        <section
            className="relative overflow-hidden py-[clamp(4rem,10vw,8rem)]"
            style={{
                backgroundImage: "linear-gradient(67deg, #fffbf9 0%, rgba(239, 253, 251, 0.8) 65%, rgba(228, 255, 252, 0) 113%)"
            }}
        >
            {/* Background Decorative Elements (Keeping subtle glows for depth) */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-[#338078]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-[#ffeec7]/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1440px] px-[clamp(1rem,5vw,10.625rem)] text-center">
                <div className="flex flex-col gap-6 items-center">
                    <h1
                        className="bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text font-['Nunito'] text-[clamp(2.5rem,5vw,52px)] font-bold leading-tight text-transparent"
                    >
                        About Us
                    </h1>

                    <p
                        className="max-w-3xl bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text font-['Nunito'] text-[clamp(1.25rem,2.5vw,24px)] font-medium text-transparent text-center"
                    >
                        Connecting students with expert Quran teachers worldwide.
                    </p>
                </div>
            </div>
        </section>
    );
}
