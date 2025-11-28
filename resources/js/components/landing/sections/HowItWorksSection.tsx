import { Icon } from '@iconify/react';

export default function HowItWorksSection() {
    const steps = [
        {
            number: '01',
            title: 'Sign Up',
            description: 'Create your free account in minutes.',
            marginTop: 'mt-[115.04px]',
            marginLeft: 'ml-[172px]',
        },
        {
            number: '02',
            title: 'Find a Teacher',
            description: 'Browse our certified tutors & choose the best fit.',
            marginTop: 'mt-[185.04px]',
            marginLeft: 'ml-[450.13px]',
        },
        {
            number: '03',
            title: 'Book a Class',
            description: 'Select a time that suits you.',
            marginTop: 'mt-[115.04px]',
            marginLeft: 'ml-[747.93px]',
        },
        {
            number: '04',
            title: 'Start Learning',
            description: 'Enjoy interactive Quran lessons online.',
            marginTop: 'mt-[185.04px]',
            marginLeft: 'ml-[997.36px]',
        },
    ];

    return (
        <div className="relative flex w-full flex-col items-center gap-[clamp(2rem,3.33vw,3rem)] mb-30 mt-30">
            {/* Section Header */}
            <div className="flex w-[1096px] items-center justify-center gap-[clamp(2rem,2.92vw,2.625rem)]">
                <div className="w-[270px]">
                    <p className="bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text font-['Nunito'] text-[clamp(2rem,3.33vw,3rem)] font-bold leading-normal text-transparent">
                        How <br /> it Works
                    </p>
                </div>
                <p className="w-[788px] font-['Nunito'] text-[clamp(1rem,1.39vw,1.25rem)] font-normal leading-[clamp(1.5rem,2.08vw,1.875rem)] text-gray-700">
                    Finding the perfect Quran tutor has never been easier. Our platform is designed to match students with certified and experienced teachers, ensuring a personalized and effective learning experience.
                </p>
            </div>

            {/* Steps Container */}
            <div className="relative h-[583px] w-full bg-gradient-to-tr from-[#FFFBF9] via-[#EFFDFB] to-[#E4FFFC]">
                {/* Background wave */}
                {/* <div className="absolute inset-0">
                    <div className="h-[583px] ">
                    </div>
                </div> */}

                {/* Steps */}
                {steps.map((step, index) => (
                    <div 
                        key={index}
                        className={`absolute flex flex-col items-center gap-[clamp(1.5rem,2.73vw,2.458rem)] ${step.marginTop} ${step.marginLeft}`}
                    >
                        {/* Number Circle */}
                        <div className="flex size-[clamp(8rem,11.27vw,10.146rem)] items-center justify-center rounded-full bg-[rgba(184,184,184,0.32)] p-[clamp(0.75rem,1.08vw,0.973rem)]">
                            <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-[#317B74] to-[#F3E5C3]">
                                <p className="font-['Nunito'] text-[clamp(2rem,3.64vw,3.279rem)] font-bold leading-normal text-[#343045]">
                                    {step.number}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex items-start gap-[clamp(0.375rem,0.68vw,0.614rem)]">
                            <div className="flex size-[clamp(2.5rem,3.81vw,3.433rem)] shrink-0 items-center justify-center">
                                <Icon 
                                    icon="codicon:arrow-small-right" 
                                    className="h-full w-full text-[#317b74]"
                                />
                            </div>
                            <div className="flex flex-col gap-[clamp(0.75rem,1.11vw,1rem)] leading-normal">
                                <p className="font-['Nunito'] text-[clamp(1rem,1.37vw,1.23rem)] font-bold text-black">
                                    {step.title}
                                </p>
                                <p className="w-[clamp(8rem,12.11vw,10.914rem)] font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-light text-[#1f2a37]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Connecting Arrows */}
                <div className="absolute left-[377.5px] top-[221.97px] h-[57.526px] w-[118px]">
                    <img 
                        src="/images/Vector 12.png" 
                        alt="" 
                        className="block size-full max-w-none"
                    />
                </div>
                <div className="absolute left-[658.5px] top-[224.97px] h-[57.526px] w-[118px] scale-y-[-100%]">
                    <img 
                        src="/images/Vector 12.png" 
                        alt="" 
                        className="block size-full max-w-none"
                    />
                </div>
                <div className="absolute left-[938.5px] top-[224.97px] h-[57.526px] w-[118px]">
                    <img 
                        src="/images/Vector 12.png" 
                        alt="" 
                        className="block size-full max-w-none"
                    />
                </div>
            </div>
        </div>
    );
}
