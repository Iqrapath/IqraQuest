import React from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function TeacherStepSection() {
    const steps = [
        {
            number: "01",
            title: "Sign Up & Get Verified",
            description: "Teach from anywhere and set your own hours while sharing your knowledge.",
            icon: "ph:user-plus-bold",
            iconBg: "#d4ccff",
            image: "/images/Frame 2147484144.png",
            align: "start"
        },
        {
            number: "02",
            title: "Set Your Schedule",
            description: "Grow your teaching career with student reviews and flexible availability.",
            icon: "ph:clock-bold",
            iconBg: "#ccf2ff",
            image: "/images/Frame 2147484145.png",
            align: "center"
        },
        {
            number: "03",
            title: "Start Teaching & Get Paid",
            description: "Earn securely with multiple payout options and a global student base.",
            icon: "ph:wallet-bold",
            iconBg: "#ffccf2",
            image: "/images/muslim-lady-wear-headphone-using-digital-tablet-talk-colleagues-about-sale-report-conference-video-call-while-working-from-home-kitchen-removebg-preview 1.png",
            align: "end"
        }
    ];

    return (
        <section className="relative w-full overflow-hidden bg-white py-[clamp(4rem,10vw,8rem)] px-[clamp(1rem,11.81vw,10.625rem)]">
            {/* Background Decorative Elements */}
            <div className="absolute top-[10%] left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <img
                    src="/images/Arabic_Calligraphy_Asy_Syifa-removebg-preview 1.png"
                    alt=""
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[clamp(400px,60vw,800px)] opacity-[0.03] rotate-[15deg] scale-x-[-1]"
                />
                <div className="absolute top-[30%] left-[-5%] w-[500px] h-[500px] bg-[#338078]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-[#ffeec7]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1440px]">
                {/* Heading */}
                <div className="mb-[clamp(3rem,8vw,6rem)] text-center">
                    <h2
                        className="bg-gradient-to-l from-[#338078] to-[#ffeec7] bg-clip-text font-['Nunito'] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-transparent drop-shadow-[0_20px_15px_rgba(0,0,0,0.05)]"
                    >
                        For Teacher
                    </h2>
                </div>

                {/* Staggered Steps Container */}
                <div className="relative flex flex-col gap-24 lg:gap-0 min-h-[clamp(600px,80vh,1100px)]">

                    {/* SVG Connecting Lines (Visible on Desktop) - Mirrored Path */}
                    <svg className="absolute inset-0 w-full h-full hidden lg:block -z-10" preserveAspectRatio="none">
                        <path
                            d="M 1200 250 C 1000 250, 1000 550, 720 550 C 440 550, 440 850, 200 850"
                            fill="none"
                            stroke="#338078"
                            strokeWidth="2"
                            strokeDasharray="8 8"
                            opacity="0.2"
                        />
                        {/* Nodes */}
                        <circle cx="950" cy="400" r="6" fill="#338078" opacity="0.4" />
                        <circle cx="450" cy="700" r="6" fill="#338078" opacity="0.4" />
                    </svg>

                    {[...steps].map((step, idx) => {
                        // Reverse the visual alignment to mirror the student section:
                        // Student: Start(Left), Center, End(Right)
                        // Teacher: End(Right), Center, Start(Left)
                        const visualAlign = step.align === 'start' ? 'justify-end lg:items-end' :
                            step.align === 'center' ? 'justify-center lg:items-center -mt-16 lg:mt-[-50px]' :
                                'justify-start lg:items-start -mt-16 lg:mt-[-50px]';

                        return (
                            <div
                                key={idx}
                                className={`flex flex-col lg:flex-row w-full ${visualAlign}`}
                            >
                                <div className="group relative w-full max-w-[360px] transform transition-all duration-500 hover:-translate-y-4">
                                    {/* Large Shadow Number */}
                                    <span className="absolute -top-12 -left-8 font-['Nunito'] text-[clamp(4.5rem,10vw,8rem)] font-extrabold text-[#338078]/5 select-none transition-colors group-hover:text-[#338078]/10">
                                        {step.number}
                                    </span>

                                    {/* Card Container */}
                                    <div className="relative z-10 overflow-hidden bg-white/80 backdrop-blur-md rounded-[40px] border border-white/50 shadow-[0_32px_64px_-16px_rgba(51,128,120,0.12)] p-10">
                                        {/* Icon Box */}
                                        <div
                                            className="mb-8 flex size-20 items-center justify-center rounded-[24px] shadow-lg transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: step.iconBg }}
                                        >
                                            <Icon icon={step.icon} className="size-10 text-gray-800/80" />
                                        </div>

                                        {/* Text content */}
                                        <div className="mb-8 flex flex-col gap-4">
                                            <h3 className="font-['Nunito'] text-2xl font-bold text-gray-900 leading-tight">
                                                {step.title}
                                            </h3>
                                            <p className="font-['Nunito'] text-lg text-gray-600 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Illustration/Image */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-gray-50 shadow-inner">
                                            <img
                                                src={step.image}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Final CTA for Section */}
                <div className="mt-20 flex justify-center">
                    <Link
                        href="/register/teacher"
                        className="group relative flex h-16 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#338078] px-10 font-['Nunito'] text-lg font-bold text-white transition-all hover:bg-[#2a6b64] hover:shadow-[0_20px_40px_-12px_rgba(51,128,120,0.4)]"
                    >
                        <span>Start Teaching Today</span>
                        <Icon icon="ph:chalkboard-teacher-bold" className="size-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
