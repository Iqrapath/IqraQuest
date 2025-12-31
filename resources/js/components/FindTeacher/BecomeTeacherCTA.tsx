import React from 'react';
import { Link } from '@inertiajs/react';

export default function BecomeTeacherCTA() {
    return (
        <section className="relative w-full bg-[#fff7e4] py-[clamp(2rem,3vw,3rem)]">
            <div className="mx-auto max-w-7xl px-[clamp(1rem,11.81vw,10.625rem)]">
                <div className="flex flex-col lg:flex-row items-center gap-[clamp(2rem,4vw,4rem)]">
                    {/* Text Content */}
                    <div className="flex flex-col gap-8 items-start flex-1 max-w-[475px]">
                        {/* Title and Description */}
                        <div className="flex flex-col gap-3">
                            <h2
                                className="font-['Nunito'] font-bold text-[clamp(2rem,3.61vw,3.25rem)] leading-[1.1] bg-clip-text"
                                style={{
                                    WebkitTextFillColor: "transparent",
                                    backgroundImage: "linear-gradient(to left, #338078, rgba(20, 20, 20, 0.44))"
                                }}
                            >
                                Become an IqraQuest Teacher
                            </h2>
                            <p className="font-['Nunito'] font-normal text-base text-[#4b5563]">
                                Earn money by sharing your expertise with students. Sign up today and start teaching online with IqraQuest!
                            </p>
                        </div>

                        {/* CTA Button */}
                        <Link
                            href="/register/teacher"
                            className="inline-flex items-center justify-center rounded-[56px] bg-[#338078] px-6 py-3 font-['Nunito'] font-semibold text-[clamp(1rem,1.67vw,1.5rem)] capitalize text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                        >
                            Start Teaching Today
                        </Link>
                    </div>

                    {/* Image Section */}
                    <div className="relative flex-1 hidden lg:block">
                        <div className="relative h-[351px] w-full max-w-[520px] overflow-hidden rounded-[24px]">
                            {/* Blur overlay effects */}
                            <div className="absolute left-0 top-1/4 w-[60px] h-[162px] bg-[#fff7e4] blur-[11.5px] rotate-[6.76deg] z-10" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] h-[39px] bg-[#fff7e4] blur-[11.5px] z-10" />

                            {/* Main Image */}
                            <img
                                src="/images/young-arab-man-works-diligently-his-desk-browsing-internet-his-digital-laptop-engrossed-online-webpage-he-takes-notes-researches-embodying-professionalism-efficiency 3.png"
                                alt="Teacher working online"
                                className="h-full w-full object-cover rounded-[24px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
