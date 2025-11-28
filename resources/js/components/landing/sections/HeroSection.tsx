import { Link } from '@inertiajs/react';

export default function HeroSection() {
    return (
        <div className="isolate relative flex flex-col items-center gap-[clamp(1.5rem,2.22vw,2rem)] px-[clamp(1rem,2vw,2rem)] pt-[clamp(3rem,6vw,6rem)]">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 h-full w-full">
                <img
                    src="/images/hero-bg.png"
                    alt="Hero Background"
                    className="h-full w-full object-cover"
                />
            </div>
            {/* Hero Text */}
            <div className="flex w-full flex-col items-center gap-[clamp(1rem,1.67vw,1.5rem)] animate-fade-in">
                <div className="flex w-full flex-col items-center top-[50px] ">
                    {/* First line with gradient text */}
                    <div className="flex w-full flex-wrap items-end justify-center gap-[clamp(0.5rem,0.83vw,0.75rem)]">
                        <p className="text-center font-['Nunito'] text-[clamp(1.5rem,3.33vw,3rem)] font-bold leading-[1.5] text-[#0f1017]">
                            Connect with
                        </p>
                        <div className="relative inline-grid place-items-start">
                            {/* Underline decoration */}
                            <div
                                className="absolute -left-[clamp(0.5rem,0.83vw,0.75rem)] top-[clamp(2px,0.22vw,3.16px)] flex h-[clamp(50px,5.76vw,82.869px)] w-[clamp(300px,38.19vw,549.945px)] items-center justify-center"
                                style={{ transform: 'rotate(358.23deg)' }}
                            >
                                <div className="h-[clamp(40px,4.58vw,65.969px)] w-[clamp(290px,38.07vw,548.169px)] rounded-full bg-gradient-to-r from-[#FFF6E0] via-[#C9DFD1] to-[#8AC5BF] opacity-60" />
                            </div>
                            {/* Gradient text */}
                            <div
                                className="flex h-[clamp(52px,6.09vw,87.718px)] w-[clamp(280px,35.55vw,511.981px)] items-center justify-center"
                                style={{ transform: 'rotate(358.23deg)' }}
                            >
                                <p
                                    className="bg-gradient-to-r from-[#338078] to-[#666666] bg-clip-text text-center font-['Nunito'] text-[clamp(1.5rem,3.33vw,3rem)] font-bold leading-[1.5] text-transparent"
                                >
                                    Expert Quran Teachers
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Second line */}
                    <p className="w-full text-center font-['Nunito'] text-[clamp(1.5rem,3.33vw,3rem)] font-bold leading-[1.5] text-[#0f1017]">
                        Anytime, Anywhere!
                    </p>
                </div>

                {/* Subtitle */}
                <p className="w-full max-w-[clamp(20rem,44.1vw,39.688rem)] text-center font-['Nunito'] text-[clamp(0.875rem,1.39vw,1.25rem)] font-medium leading-[1.5] text-gray-700">
                    Find expert Quran tutors for kids and adults. Learn at your own pace, anytime, anywhere.
                </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-start justify-center gap-[clamp(1rem,1.67vw,1.5rem)]">
                <Link
                    href="#find-teacher"
                    className="rounded-[clamp(1.5rem,3.89vw,3.5rem)] bg-[#338078] px-[clamp(1rem,1.67vw,1.5rem)] py-[clamp(0.5rem,0.83vw,0.75rem)] font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium capitalize text-white transition-all duration-300 hover:bg-[#2a6b64] hover:shadow-lg"
                >
                    Find a Teacher
                </Link>
                <Link
                    href="#become-teacher"
                    className="rounded-[clamp(1.5rem,3.89vw,3.5rem)] border-[1.5px] border-solid border-[#338078] px-[clamp(1rem,1.67vw,1.5rem)] py-[clamp(0.5rem,0.83vw,0.75rem)] font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium capitalize text-[#338078] transition-all duration-300 hover:bg-[#338078] hover:text-white"
                >
                    Become a Teacher
                </Link>
            </div>

            {/* Hero Image */}
            <div className="md:-mt-20 ">
                <img
                    src="/images/young-arab-man-works-diligently-his-desk-browsing-internet-his-digital-laptop-engrossed-online-webpage-he-takes-notes-researches-embodying-professionalism-efficiency 2.png"
                    alt="Student learning Quran online"
                    className="h-auto w-full object-cover object-center"
                />
            </div>
        </div>
    );
}
