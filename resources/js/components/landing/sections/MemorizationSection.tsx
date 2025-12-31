import { Link } from '@inertiajs/react';
import { toast } from 'sonner';

export default function MemorizationSection() {
    const handleComingSoon = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.info("Coming Soon! Our subscription and memorization plans are currently being finalized.");
    };
    const features = [
        { number: '01', text: "Learn at your child's pace" },
        { number: '03', text: 'Earn a certificate upon completion' },
        { number: '02', text: 'Certified Quran teachers' },
        { number: '04', text: 'Progress tracking & parent updates' },
    ];

    return (
        <div className="relative w-full overflow-hidden bg-white">
            {/* Top Section */}
            <div className="relative px-[clamp(2rem,11.81vw,10.625rem)] py-[clamp(2rem,4vw,3rem)]">
                <div className="mx-auto max-w-[1100px]">
                    {/* Section Header */}
                    <div className="mb-[clamp(2rem,2.99vw,2.688rem)] flex flex-col gap-[clamp(0.75rem,1.11vw,1rem)]">
                        <p className="bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text font-['Nunito'] text-[clamp(2rem,3.33vw,3rem)] font-bold leading-normal text-transparent">
                            Want your kids to be an Hafiz in 6months
                        </p>
                        <p className="max-w-[788px] font-['Nunito'] text-[clamp(1rem,1.39vw,1.25rem)] font-normal leading-[1.5] text-gray-700">
                            Full Quran, Half Quran, or Juz' Amma – Tailored Learning for Every Student.
                        </p>
                    </div>

                    {/* Mobile/Tablet: Vertical List */}
                    <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)] pb-30 lg:hidden">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-[clamp(0.75rem,1.5vw,1rem)] rounded-[1rem] border border-[rgba(51,128,120,0.3)] bg-[#fff8e7] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vw,1rem)]">
                                <p className="font-['Nunito'] text-[clamp(1rem,2vw,1.25rem)] font-bold text-[rgba(60,60,67,0.5)]">
                                    {feature.number}
                                </p>
                                <p className="font-['Nunito'] text-[clamp(0.875rem,1.5vw,1rem)] font-semibold text-[#338078]">
                                    {feature.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Original Rotated Cards */}
                    <div className="hidden items-center pb-30 lg:flex">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-center"
                                style={{ marginRight: '-5.474px' }}
                            >
                                <div style={{ transform: 'rotate(8deg)' }}>
                                    <div className="flex items-center gap-[clamp(1rem,1.77vw,1.589rem)] rounded-[clamp(0.75rem,1.17vw,1.05rem)] border-[0.525px] border-[rgba(51,128,120,0.3)] bg-[#fff8e7] px-[clamp(1.25rem,2.04vw,1.833rem)] py-[clamp(0.5rem,0.88vw,0.788rem)]">
                                        <div className="flex shrink-0 items-start gap-[clamp(0.25rem,0.34vw,0.306rem)]">
                                            <p className="font-['Nunito'] text-[clamp(0.75rem,1.09vw,0.978rem)] font-bold leading-[1.2] text-[rgba(60,60,67,0.5)]">
                                                {feature.number}
                                            </p>
                                        </div>
                                        <p className="font-['Nunito'] text-[clamp(0.625rem,0.88vw,0.788rem)] font-semibold leading-[1.2] text-[#338078]">
                                            {feature.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Green CTA Section */}
            <div className="relative bg-[#eeffe6]">
                <div className="flex flex-col items-center gap-[clamp(2rem,3vw,3rem)] px-[clamp(2rem,8.33vw,7.5rem)] py-[clamp(2rem,3vw,3rem)] lg:flex-row lg:gap-[clamp(1rem,1.46vw,1.313rem)] lg:py-[clamp(1.5rem,1.81vw,1.625rem)]">
                    {/* Image */}
                    <div className="relative h-[clamp(250px,50vw,500px)] w-[clamp(250px,50vw,500px)] shrink-0 lg:h-[clamp(300px,34.72vw,500px)] lg:w-[clamp(300px,34.72vw,500px)]">
                        <img
                            src="/images/ebaf7f01-a7c5-4f07-884a-ae8b40b94685-removebg-preview.png"
                            alt="Student memorizing Quran"
                            className="size-full object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex w-full flex-col gap-[clamp(1.5rem,3vw,2rem)] lg:w-[clamp(400px,43.61vw,628px)] lg:gap-[clamp(2rem,3.61vw,3.25rem)] lg:px-[clamp(0.5rem,0.83vw,0.75rem)]">
                        <div className="flex flex-col gap-[clamp(0.5rem,0.83vw,0.75rem)] leading-normal">
                            <p className="max-w-[638px] bg-gradient-to-l from-[#338078] to-[rgba(20,20,20,0.7)] bg-clip-text font-['Nunito'] text-[clamp(2rem,3.33vw,3rem)] font-bold text-transparent">
                                Enroll in Our Quran Memorization Plans Today!
                            </p>
                            <p className="max-w-[614px] font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-normal text-gray-600">
                                Full Quran, Half Quran, or Juz' Amma – Tailored Learning for Every Student.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col items-stretch gap-[clamp(1rem,2vw,1.5rem)] lg:flex-row lg:items-center lg:gap-[clamp(0.5rem,0.56vw,0.5rem)]">
                            <Link
                                href="#memorization-plans"
                                onClick={handleComingSoon}
                                className="rounded-full bg-[#338078] px-[20px] py-[10px] text-center font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold capitalize text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                            >
                                View Memorization Plans
                            </Link>
                            <div className="flex flex-col items-center gap-[clamp(0.5rem,1vw,0.75rem)] lg:flex-row lg:gap-0">
                                <div className="px-[clamp(1rem,1.67vw,1.5rem)] py-[clamp(0.5rem,0.83vw,0.75rem)]">
                                    <p className="font-['Nunito'] text-[clamp(0.75rem,1.18vw,1.063rem)] font-semibold leading-normal text-[#338078]">
                                        Not sure?
                                    </p>
                                </div>
                                <Link
                                    href="#match-me"
                                    onClick={handleComingSoon}
                                    className="rounded-full border-[1.5px] border-solid border-[#338078] px-[20px] py-[8px] text-center font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold capitalize text-[#338078] transition-all hover:bg-[#338078] hover:text-white"
                                >
                                    Match Me
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

