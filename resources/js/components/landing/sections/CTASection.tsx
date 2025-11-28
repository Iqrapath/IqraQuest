import { Link } from '@inertiajs/react';

export default function CTASection() {
    return (
        <div className="relative min-h-[416px] w-full overflow-hidden bg-[#fff7e4] py-[clamp(3rem,5vw,4rem)]">
            {/* Content Container */}
            <div className="flex items-center justify-center px-[clamp(2rem,15.21vw,13.688rem)]">
                <div className="flex flex-col items-center gap-[clamp(2rem,4vw,3rem)] lg:flex-row lg:gap-0">
                    {/* Text Content */}
                    <div className="flex w-full flex-col gap-[clamp(1.5rem,2.22vw,2rem)] px-[clamp(0.5rem,0.83vw,0.75rem)] lg:w-[475px]">
                        <div className="flex flex-col gap-[clamp(0.5rem,0.83vw,0.75rem)] leading-normal">
                            <p className="max-w-[588px] bg-gradient-to-l from-[#338078] to-[rgba(20,20,20,0.44)] bg-clip-text font-['Nunito'] text-[clamp(2rem,3.61vw,3.25rem)] font-bold text-transparent">
                                Start your Quran Learning Journey Today
                            </p>
                            <p className="font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-normal text-gray-600">
                                Earn money by sharing your expertise with students. Sign up today and start teaching online with IqraPath!
                            </p>
                        </div>

                        <Link 
                            href="#start-teaching"
                            className="w-fit rounded-[clamp(1.5rem,3.89vw,3.5rem)] bg-[#338078] px-[clamp(1rem,1.67vw,1.5rem)] py-[clamp(0.5rem,0.83vw,0.75rem)] font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold capitalize text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                        >
                            Start Teaching Today
                        </Link>
                    </div>

                    {/* Image with Blur Effects */}
                    <div className="relative hidden lg:block">
                        {/* Blur Effects */}
                        <div 
                            className="absolute left-0 top-[241.24px] h-[167.819px] w-[77.658px] blur-[11.5px]"
                            style={{ transform: 'rotate(6.76deg)' }}
                        >
                            <div className="h-[162px] w-[59px] bg-[#fff7e4]" />
                        </div>
                        <div 
                            className="absolute left-[36.76px] top-[376.72px] h-[39px] w-[520px] blur-[11.5px]"
                            style={{ transform: 'rotate(90deg)' }}
                        >
                            <div className="h-[520px] w-[39px] bg-[#fff7e4]" />
                        </div>

                        {/* Main Image */}
                        <div className="relative mt-20">
                            <img 
                                src="/images/muslim-lady-wear-headphone-using-digital-tablet-talk-colleagues-about-sale-report-conference-video-call-while-working-from-home-kitchen-removebg-preview 1.png" 
                                alt="Start learning today" 
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
