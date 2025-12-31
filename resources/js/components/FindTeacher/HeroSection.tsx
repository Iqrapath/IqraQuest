import React from 'react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';

interface HeroSectionProps {
    title?: string;
}

export default function HeroSection({
    title = "Learn Quran with the Right Teacher Anytime, Anywhere."
}: HeroSectionProps) {

    const handleMatchMeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info("Coming Soon!", {
            description: "Our AI-powered teacher matching is currently under development.",
        });
    };

    return (
        <div
            className="relative w-full min-h-[410px] overflow-hidden"
            style={{
                backgroundImage: "linear-gradient(108.78deg, rgba(255, 247, 226, 0.44) 0.77%, rgb(255, 255, 255) 55.52%)"
            }}
        >
            {/* Calligraphy Background Image - Right Side */}
            <div className="absolute right-[calc(50%-520px)] top-[43px] h-[324px] w-[471px] hidden lg:block">
                <img
                    src="/images/خيركم-من-تعلم- 1.png"
                    alt="Arabic Calligraphy"
                    className="h-full w-full object-cover pointer-events-none"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col gap-8 items-start px-[clamp(1.5rem,11.74vw,10.563rem)] py-[clamp(6rem,10.28vw,9.25rem)]">
                {/* Title with Gradient */}
                <h1
                    className="font-['Nunito'] text-[clamp(1.75rem,2.22vw,2rem)] font-bold leading-[1.6] max-w-[549px] bg-clip-text bg-gradient-to-l from-[#0a1a18] to-[#338078]"
                    style={{ WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(to left, #0a1a18, #338078)" }}
                >
                    {title}
                </h1>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-6 items-center">
                    {/* Browse Teachers Button */}
                    <a
                        href="#teachers"
                        className="inline-flex items-center justify-center rounded-[56px] bg-[#338078] px-6 py-3 font-['Nunito'] text-base font-medium capitalize text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                    >
                        Browse Teachers
                    </a>

                    {/* Let Us Match You Button */}
                    <button
                        onClick={handleMatchMeClick}
                        className="inline-flex items-center justify-center rounded-[56px] border-[1.5px] border-solid border-[#338078] px-6 py-3 font-['Nunito'] text-base font-medium capitalize text-[#338078] transition-all hover:bg-[#338078] hover:text-white cursor-pointer"
                    >
                        Let Us Match You
                    </button>
                </div>
            </div>
        </div>
    );
}
