import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

export default function ContentSection() {
    return (
        <section className="relative w-full overflow-hidden bg-[#338078] py-[clamp(4rem,8vw,6rem)]">
            <div className="relative mx-auto max-w-[1440px] px-[clamp(1rem,5vw,10.625rem)]">
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">

                    {/* Left Side: Content */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="font-['Nunito'] text-[clamp(1rem,1.5vw,1.25rem)] font-bold uppercase tracking-[0.3em] text-white/70">
                                A Bit
                            </span>
                            <h2 className="font-['Nunito'] text-[clamp(2.5rem,5vw,52px)] font-bold leading-tight text-white capitalize">
                                About Us
                            </h2>
                        </div>

                        <p className="max-w-xl font-['Nunito'] text-[clamp(1.1rem,1.3vw,1.25rem)] leading-relaxed text-[#F3E5C3]">
                            We believe that learning the Quran should be accessible, affordable, and high-quality.
                            That’s why we created this platform—to connect students with expert teachers and help them achieve their learning goals.
                        </p>

                        <ul className="flex flex-col gap-5">
                            {[
                                "Flexible scheduling & reliable payment system.",
                                "Trusted by thousands of students & teachers.",
                                "Secure platform for learning & teaching."
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4">
                                    <div className="size-2.5 shrink-0 rounded-full bg-white" />
                                    <span className="font-['Nunito'] text-lg font-medium text-white/90">{text}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/find-teacher"
                            className="w-fit rounded-full bg-white px-10 py-5 font-['Nunito'] text-lg font-bold text-[#338078] transition-all hover:scale-105 hover:bg-[#F3E5C3] hover:shadow-xl"
                        >
                            Explore More
                        </Link>
                    </div>

                    {/* Right Side: Image Composition */}
                    <div className="relative h-[clamp(400px,50vw,600px)] w-full">
                        {/* Image 1: Top Right */}
                        <div className="absolute right-0 top-40 h-auto w-auto overflow-hidden rounded-[20px] shadow-2xl">
                            <img
                                src="/images/AboutImage2.png"
                                alt="IqraQuest Learning"
                                className="h-auto w-auto object-cover"
                            />
                        </div>

                        {/* Image 2: Bottom Left */}
                        <div className="absolute bottom-70 left-0  h-auto w-auto overflow-hidden rounded-[20px]">
                            <img
                                src="/images/AboutImage1.png"
                                alt="Student"
                                className="h-auto w-auto object-cover"
                            />
                        </div>

                        {/* Floating Card 1: 30,000+ Trusted */}
                        <div className="absolute -right-28 -top-16 w-auto h-auto  hidden sm:block">
                            <img
                                src="/images/AboutCard.png"
                                alt="Student"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Floating Card 2: Best Ratings */}
                        <div className="absolute top-80 left-20  w-full h-full  hidden lg:block">
                            <img
                                src="/images/Group 4303.png"
                                alt="Student"
                                className="h-auto w-auto object-cover"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
