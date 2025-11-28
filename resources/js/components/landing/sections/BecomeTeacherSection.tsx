import { Link } from '@inertiajs/react';

export default function BecomeTeacherSection() {
    const benefits = [
        'Discover new students',
        'Expand your Business',
        'Receive payments securely',
    ];

    return (
        <div className="relative w-full overflow-hidden bg-[#338078] px-[clamp(2rem,4.38vw,3.938rem)] py-[clamp(3rem,4.31vw,3.875rem)]">
            {/* Background Blur Effects */}
            <div className="absolute left-[609px] top-[93px] h-[174px] w-[123px] bg-[#338078] backdrop-blur-[42px]" />
            <div className="absolute left-[687px] top-[345px] h-[231px] w-[77px] bg-[#338078] blur-[14.5px]" />

            <div className="relative mx-auto flex max-w-[1314px] items-center gap-[clamp(2rem,3.54vw,3.188rem)]">
                {/* Image */}
                <div className="h-[578px] w-[722px] shrink-0">
                    <img 
                        src="/images/young-arab-man-works-diligently-his-desk-browsing-internet-his-digital-laptop-engrossed-online-webpage-he-takes-notes-researches-embodying-professionalism-efficiency 2.png" 
                        alt="Become a teacher" 
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex w-[445px] flex-col gap-[clamp(2rem,3.47vw,3.125rem)]">
                    <div className="flex flex-col gap-[clamp(2rem,3.47vw,3.125rem)]">
                        {/* Text Content */}
                        <div className="flex flex-col gap-[clamp(0.5rem,0.83vw,0.75rem)] leading-normal">
                            <p className="w-[402px] bg-gradient-to-l from-[#f3e5c3] to-[#ffffff] bg-clip-text font-['Nunito'] text-[clamp(2rem,3.33vw,3rem)] font-bold text-transparent">
                                Become a Iqrapath Teacher
                            </p>
                            <p className="font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-normal leading-normal text-gray-300">
                                Earn money by sharing your expertise with students. Sign up today and start teaching online with IqraPath!
                            </p>
                        </div>

                        {/* Benefits Tags */}
                        <div className="relative flex flex-col gap-[clamp(0.75rem,1.11vw,1rem)]">
                            {benefits.map((benefit, index) => (
                                <div 
                                    key={index}
                                    className="flex w-fit items-center gap-[clamp(0.375rem,0.63vw,0.563rem)] rounded-md bg-[#508c87] px-[clamp(0.75rem,1.11vw,1rem)] py-[clamp(0.375rem,0.56vw,0.5rem)]"
                                    style={{
                                        marginLeft: index === 1 ? '46px' : index === 2 ? '111px' : '0'
                                    }}
                                >
                                    <div className="size-[clamp(0.375rem,0.63vw,0.563rem)] rounded-full bg-white" />
                                    <p className="font-['Nunito'] text-[clamp(1rem,1.39vw,1.25rem)] font-semibold leading-normal text-white">
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Link 
                        href="#become-teacher"
                        className="w-fit rounded-[clamp(1.5rem,3.89vw,3.5rem)] bg-white px-[clamp(1rem,1.67vw,1.5rem)] py-[clamp(0.5rem,0.83vw,0.75rem)] font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-medium capitalize text-[#338078] transition-all hover:bg-gray-100 hover:shadow-lg"
                    >
                        Become a Teacher
                    </Link>
                </div>
            </div>
        </div>
    );
}
