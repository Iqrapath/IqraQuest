import React from 'react';

export default function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden">
            {/* Top Section with Main Heading */}
            <div
                className="relative px-[clamp(1rem,11.81vw,10.625rem)] pt-[clamp(4rem,8vw,8.5rem)] pb-[clamp(2rem,4vw,3.5rem)]"
                style={{
                    backgroundImage: "linear-gradient(76.56deg, #FFFBFA 0.37%, rgba(239, 253, 251, 0.8) 64.96%, rgba(228, 255, 252, 0) 113.39%)"
                }}
            >
                <div className="mx-auto max-w-[1440px]">
                    <h1 className="bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text font-['Nunito'] text-[clamp(2.5rem,5.56vw,5rem)] font-bold leading-tight text-transparent">
                        How <br /> It Works ?
                    </h1>
                </div>
            </div>

            {/* Subheading Band */}
            <div className="w-full bg-gradient-to-r from-[rgba(239,253,251,0.8)] to-[rgba(51,128,120,0.4)] py-[clamp(1rem,2vw,1.5rem)] px-[clamp(1rem,11.81vw,10.625rem)]">
                <div className="mx-auto max-w-[1440px]">
                    <h2 className="bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text font-['Nunito'] text-[clamp(1.5rem,2.22vw,2rem)] font-bold text-transparent">
                        Find the best Quran teachers or start teaching today!
                    </h2>
                </div>
            </div>

            {/* Description Solid Band */}
            <div className="w-full bg-[#338078] py-[clamp(2rem,3vw,3rem)] px-[clamp(1rem,11.81vw,10.625rem)]">
                <div className="mx-auto max-w-[1440px]">
                    <p className="max-w-[1015px] font-['Nunito'] text-[clamp(1rem,1.25vw,1.125rem)] font-normal leading-relaxed text-white/95">
                        Our platform is designed to match students with certified and experienced teachers, ensuring a personalized and effective learning experience. Whether you're a beginner, memorizing the Quran, or improving your Tajweed, our step-by-step process makes it simple to start your journey.
                    </p>
                </div>
            </div>
        </section>
    );
}
