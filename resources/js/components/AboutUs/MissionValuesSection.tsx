import React from 'react';

export default function MissionValuesSection() {
    const values = [
        {
            number: "01",
            title: "Excellence",
            description: "Ensuring top-quality learning experiences."
        },
        {
            number: "02",
            title: "Integrity",
            description: "Verified teachers & secure transactions."
        },
        {
            number: "03",
            title: "Flexibility",
            description: "Learn at your own pace."
        },
        {
            number: "04",
            title: "Community",
            description: "Building a strong teacher-student network."
        }
    ];

    return (
        <section className="relative overflow-hidden bg-white py-[clamp(4rem,10vw,8rem)]">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-40">
                {/* Large Background Logo/Calligraphy Placeholder */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-[url('/images/Logo.png')] bg-contain bg-no-repeat bg-center opacity-[0.03]" />

                {/* Decorative Waves */}
                <svg className="absolute bottom-0 left-0 w-full h-[300px]" viewBox="0 0 1440 300" fill="none">
                    <path d="M0 150Q360 100 720 150T1440 150" stroke="#338078" strokeWidth="1" strokeOpacity="0.1" />
                    <path d="M0 170Q360 120 720 170T1440 170" stroke="#338078" strokeWidth="1" strokeOpacity="0.05" />
                    <path d="M0 190Q360 140 720 190T1440 190" stroke="#338078" strokeWidth="1" strokeOpacity="0.02" />
                </svg>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-[clamp(1rem,5vw,10.625rem)]">
                {/* Mission Header */}
                <div className="mb-20">
                    <h2 className="mb-6 font-['Nunito'] text-[clamp(2.5rem,5vw,48px)] font-bold leading-tight">
                        <span className="bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text text-transparent">
                            Our Mission & Values
                        </span>
                    </h2>
                    <p className="font-['Nunito'] text-[clamp(1.25rem,2vw,24px)] font-medium leading-relaxed">
                        <span className="bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text text-transparent">
                            To make quality Quran education accessible to everyone, everywhere.
                        </span>
                    </p>
                </div>

                {/* Staggered Values Banners */}
                <div className="flex flex-col gap-12 lg:gap-8">
                    {values.map((v, i) => (
                        <div
                            key={i}
                            className={`flex w-full ${i % 2 === 0 ? 'justify-start' : 'justify-end lg:pr-[10%]'
                                } ${i === 1 ? 'lg:pl-[15%]' : ''} ${i === 2 ? 'lg:pl-[5%]' : ''} ${i === 3 ? 'lg:pl-[25%]' : ''}`}
                        >
                            <div
                                className={`relative flex items-center gap-8 rounded-[32px] bg-[#fff8e7] border border-[#338078]/20 px-12 py-8 shadow-sm transition-transform hover:scale-[1.02] duration-300
                                ${i === 0 ? 'rotate-[2deg] lg:w-[816px]' : ''}
                                ${i === 1 ? 'rotate-[-2deg] lg:w-[850px]' : ''}
                                ${i === 2 ? 'rotate-[1deg] lg:w-[680px]' : ''}
                                ${i === 3 ? 'rotate-[-1deg] lg:w-[820px]' : ''}
                                w-full max-w-full`}
                            >
                                <span className="font-['Nunito'] text-3xl font-bold text-[#3C3C43]/50 shrink-0">
                                    {v.number}
                                </span>

                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-['Nunito'] text-2xl font-bold text-[#338078]">
                                        {v.title} –
                                    </h3>
                                    <p className="font-['Nunito'] text-lg text-[#6B7280]">
                                        {v.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
