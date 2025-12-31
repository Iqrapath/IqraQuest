import React from 'react';
import { Link } from '@inertiajs/react';

export default function FinalCTASection() {
    return (
        <section className="relative w-full bg-[#fff7e4] py-[clamp(2rem,6vw,5.5rem)] overflow-hidden">
            <div className="mx-auto max-w-7xl px-[clamp(1rem,11.81vw,10.625rem)]">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-[clamp(2rem,5vw,4rem)]">
                    {/* Text Content */}
                    <div className="flex flex-col gap-8 items-start max-w-[534px]">
                        <h2
                            className="font-['Nunito'] text-[clamp(2rem,3.4vw,3.063rem)] font-bold text-[#1f2a37] leading-[1.2]"
                        >
                            Start Your Quran Learning Journey Today!
                        </h2>
                        <Link
                            href="/find-teacher"
                            className="inline-flex items-center justify-center rounded-[56px] bg-[#338078] px-8 py-3.5 font-['Nunito'] font-semibold text-lg text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                        >
                            Find A Teacher
                        </Link>
                    </div>

                    {/* Image Composition */}
                    <div className="relative flex-1 flex justify-end">
                        <div className="relative w-full max-w-[518px] aspect-[1.3/1] rounded-[36px] overflow-hidden shadow-2xl">
                            <img
                                src="/images/little-boy-listening-his-teacher-through-headphones-removebg-preview (1) 1.png"
                                alt="Student learning Quran"
                                className="w-full h-full object-cover"
                            />
                            {/* Accent overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorative Calligraphy */}
            <div className="absolute top-0 left-0 opacity-[0.05] pointer-events-none -translate-x-1/2 -translate-y-1/2 scale-150">
                <img src="/images/Vector-bg.png" alt="" className="h-[500px] w-auto" />
            </div>
        </section>
    );
}
