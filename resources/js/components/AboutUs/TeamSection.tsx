import React from 'react';

export default function TeamSection() {
    const team = [
        {
            name: "Ahmed Yusuf",
            role: "Founder & CEO",
            bio: "With a vision to make quality Quran education accessible worldwide, Ahmed founded this platform to connect students with the best teachers.",
            image: "/images/AhmedYusuf.png" // Placeholder, assuming assets will be mapped
        },
        {
            name: "Fatima Ibrahim",
            role: "Head of Education",
            bio: "A highly experienced Quran teacher and curriculum developer, Fatima ensures that the platform offers the highest educational standards.",
            image: "/images/FatimaIbrahim.png"
        },
        {
            name: "Omar Khalid",
            role: "Chief Operating Officer (COO)",
            bio: "A highly experienced Quran teacher and curriculum developer, Omar ensures that the platform offers the highest educational standards.",
            image: "/images/OmarKhalid.png"
        },
        {
            name: "Aisha Suleiman",
            role: "Head of Student Success",
            bio: "Dedicated to helping students achieve their learning goals, Aisha leads the student support team, ensuring personalized guidance, smooth onboarding, and ongoing.",
            image: "/images/AishaSuleiman.png"
        }
    ];

    return (
        <section className="relative overflow-hidden bg-white py-[clamp(4rem,10vw,8rem)]">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                {/* Main Background Image - Matches TeachersSection.tsx implementation */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Rectangle 203.png"
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Decorative Calligraphy - Left */}
                <div className="absolute left-[-5%] top-[10%] w-[clamp(300px,40vw,570px)] h-auto rotate-[13.7deg] opacity-[0.05]">
                    <img
                        src="/images/Arabic_Calligraphy_Asy_Syifa-removebg-preview 1.png"
                        alt=""
                        className="w-full h-auto"
                    />
                </div>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-[clamp(1rem,5vw,10.625rem)]">
                {/* Header */}
                <div className="mb-20 text-center">
                    <h2 className="mb-6 font-['Nunito'] text-[clamp(2.5rem,5vw,52px)] font-bold text-[#192020]">
                        Meet Our Team
                    </h2>
                    <p className="mx-auto max-w-4xl font-['Nunito'] text-[clamp(1.1rem,1.5vw,1.375rem)] leading-relaxed text-[#338078]">
                        At the heart of our platform is a passionate team dedicated to making Quran learning accessible, flexible, and effective for students worldwide.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {team.map((member, i) => (
                        <div
                            key={i}
                            className="group relative flex flex-col rounded-[32px] bg-white p-4 shadow-[0_15px_45px_0_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_25px_60px_0_rgba(51,128,120,0.12)] hover:-translate-y-2"
                        >
                            {/* Member Image Container */}
                            <div className="relative mb-8 w-full overflow-hidden rounded-[24px] aspect-[1.12]">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback if specific member images aren't uploaded yet
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=338078&color=fff&size=512`;
                                    }}
                                />
                            </div>

                            {/* Member Details */}
                            <div className="flex flex-col gap-2 px-2 pb-4">
                                <h3 className="font-['Nunito'] text-[clamp(1.25rem,1.5vw,1.5rem)] font-bold text-[#192020] transition-colors group-hover:text-[#338078]">
                                    {member.name}
                                </h3>
                                <p className="font-['Nunito'] text-sm font-semibold text-[#338078]">
                                    {member.role}
                                </p>
                                <p className="mt-2 font-['Nunito'] text-[13.7px] leading-relaxed text-[#6B7280]">
                                    {member.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
