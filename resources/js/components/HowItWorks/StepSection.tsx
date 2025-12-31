import React from 'react';
import { Link } from '@inertiajs/react';

interface Step {
    id: string;
    number: string;
    title: string;
    description: string;
    icon: string;
    image: string;
    bgColor: string;
}

interface StepSectionProps {
    type: 'student' | 'teacher';
    title: string;
    steps: Step[];
    ctaText: string;
    ctaHref: string;
}

export default function StepSection({ type, title, steps, ctaText, ctaHref }: StepSectionProps) {
    return (
        <section className="relative w-full py-[clamp(2rem,4vw,4rem)] px-[clamp(1rem,11.81vw,10.625rem)] overflow-hidden">
            <div className="mx-auto max-w-[1440px]">
                {/* Section Header */}
                <div className="flex flex-col items-center gap-4 mb-[clamp(2.5rem,4.5vw,4rem)]">
                    <h2
                        className="font-['Nunito'] text-[clamp(2rem,3.61vw,3.25rem)] font-bold bg-clip-text"
                        style={{
                            WebkitTextFillColor: "transparent",
                            backgroundImage: "linear-gradient(to left, #0a1a18, #338078)"
                        }}
                    >
                        {title}
                    </h2>
                </div>

                {/* Steps Container */}
                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-[54px]">
                    {/* Background Decorative Patterns (Simplified representation of Figma lines) */}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-dashed border-t-2 border-dashed border-[#338078]/20 -translate-y-1/2 hidden lg:block -z-10" />

                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className="relative flex flex-col items-center gap-6 w-full lg:w-[361px] bg-white/60 backdrop-blur-sm rounded-[36px] p-8 border border-[#338078]/10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                        >
                            {/* Number Badge */}
                            <div className="absolute -top-4 -left-4 font-['Nunito'] text-[clamp(3rem,5vw,4.5rem)] font-bold text-[#338078]/10 z-0 select-none">
                                {step.number}
                            </div>

                            {/* Icon Background */}
                            <div
                                className="relative z-10 size-[80px] rounded-[18px] flex items-center justify-center shadow-inner"
                                style={{ backgroundColor: step.bgColor }}
                            >
                                <img src={step.icon} alt="" className="size-[40px] object-contain" />
                            </div>

                            {/* Text Content */}
                            <div className="relative z-10 flex flex-col gap-2 text-center">
                                <h3 className="font-['Nunito'] font-bold text-[clamp(1.25rem,1.67vw,1.5rem)] text-[#0a1a18]">
                                    {step.title}
                                </h3>
                                <p className="font-['Nunito'] text-base text-gray-500 leading-relaxed h-[60px]">
                                    {step.description}
                                </p>
                            </div>

                            {/* Step Image */}
                            <div className="relative z-10 w-full aspect-[1.5/1] overflow-hidden rounded-[20px] bg-gray-50 mt-4 border border-gray-100/50 shadow-sm">
                                <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section CTA */}
                <div className="flex justify-center mt-[clamp(2.5rem,4.5vw,4rem)]">
                    <Link
                        href={ctaHref}
                        className="inline-flex items-center justify-center rounded-[56px] bg-[#338078] px-8 py-3.5 font-['Nunito'] font-semibold text-lg text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                    >
                        {ctaText}
                    </Link>
                </div>
            </div>

            {/* Background Branding Calligraphy (Subtle) */}
            <div className="absolute bottom-0 right-0 opacity-[0.03] scale-150 rotate-12 -z-20 pointer-events-none">
                <img src="/images/Vector-bg.png" alt="" className="h-[600px] w-auto" />
            </div>
        </section>
    );
}
