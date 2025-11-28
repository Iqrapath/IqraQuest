import { Icon } from '@iconify/react';
import TwentyFourSevenIcon from '@/components/icons/TwentyFourSevenIcon';
import QuranBookIcon from '@/components/icons/QuranBookIcon';

export default function FeaturesBar() {
    return (
        <div className="absolute left-[180px] top-[1060px] w-[1100px]">
            {/* Background with gradient */}
            <div 
                className="h-[144px] w-full rounded-[clamp(2rem,5.4vw,4.863rem)] backdrop-blur-[41.73px]"
                style={{
                    background: 'radial-gradient( rgba(49,123,116,1) 0%, rgba(47,79,76,1) 100%)'
                }}
            >
                {/* Features Grid */}
                <div className="flex h-full items-center justify-between px-[clamp(1.5rem,2.36vw,2.125rem)]">
                    
                    {/* Feature 1: Verified Tutors */}
                    <div className="flex items-start gap-[clamp(0.5rem,0.83vw,0.75rem)]">
                        <div className="flex h-[clamp(2.5rem,3.54vw,3.188rem)] w-[clamp(2.5rem,3.54vw,3.188rem)] shrink-0 items-center justify-center">
                            <Icon 
                                icon="line-md:check-all" 
                                className="h-full w-full text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-[clamp(0.25rem,0.42vw,0.375rem)]">
                            <p className="font-['Nunito'] text-[clamp(1rem,1.39vw,1.25rem)] font-bold leading-normal text-white">
                                Verified Tutors
                            </p>
                            <p className="w-[clamp(12rem,18.44vw,16.593rem)] font-['Nunito'] text-[clamp(0.625rem,0.84vw,0.756rem)] font-normal leading-normal text-white">
                                Learn from certified and experienced Quran teachers.
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[clamp(4rem,7vw,6.297rem)] w-[1.72px] bg-white/20" />

                    {/* Feature 2: 24/7 Availability */}
                    <div className="flex items-start gap-[clamp(0.5rem,0.83vw,0.75rem)]">
                        <div className="flex h-[clamp(2.5rem,3.54vw,3.188rem)] w-[clamp(2.5rem,3.54vw,3.188rem)] shrink-0 items-center justify-center">
                            <TwentyFourSevenIcon className="h-full w-full text-white" />
                        </div>
                        <div className="flex flex-col gap-[clamp(0.25rem,0.54vw,0.486rem)]">
                            <p className="font-['Nunito'] text-[clamp(1rem,1.39vw,1.25rem)] font-bold leading-normal text-white">
                                24/7 Availability
                            </p>
                            <p className="w-[clamp(11rem,14.11vw,12.701rem)] font-['Nunito'] text-[clamp(0.625rem,0.84vw,0.756rem)] font-normal leading-normal text-white">
                                Schedule lessons at your convenience, anytime, anywhere.
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[clamp(4rem,7vw,6.297rem)] w-[1.72px] bg-white/20" />

                    {/* Feature 3: Tajweed, Hifz & More */}
                    <div className="flex items-start gap-[clamp(0.5rem,0.83vw,0.75rem)]">
                        <div className="flex h-[clamp(2.5rem,3.54vw,3.188rem)] w-[clamp(2.5rem,3.54vw,3.188rem)] shrink-0 items-center justify-center">
                            <QuranBookIcon className="h-full w-full text-white" />
                        </div>
                        <div className="flex flex-col gap-[clamp(0.25rem,0.42vw,0.375rem)]">
                            <p className="font-['Nunito'] text-[clamp(1rem,1.39vw,1.25rem)] font-bold leading-normal text-white">
                                Tajweed, Hifz & More
                            </p>
                            <p className="w-[clamp(11rem,14.38vw,12.938rem)] font-['Nunito'] text-[clamp(0.625rem,0.84vw,0.756rem)] font-normal leading-normal text-white">
                                Master Quran recitation, memorization, and Islamic studies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
