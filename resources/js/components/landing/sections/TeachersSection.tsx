import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

interface TeacherCardProps {
    name: string;
    specialty: string;
    rating: string;
    reviews: number;
    experience: string;
    image: string;
}

function TeacherCard({ name, specialty, rating, reviews, experience, image }: TeacherCardProps) {
    return (
        <div className="relative h-[clamp(16rem,20.57vw,18.511rem)] w-[clamp(12rem,14.9vw,13.407rem)]">
            {/* Rectangle 20 - Main Background (extends beyond card) */}
            <div className="absolute inset-[-1.87%_-4.52%_-3.43%_-4.52%]">
                <img 
                    src="/images/Rectangle 20.png" 
                    alt="" 
                    className="size-full object-cover"
                />
            </div>

            {/* Card Content */}
            <div className="absolute left-0 top-[clamp(0.5rem,0.77vw,0.691rem)] flex h-[clamp(15rem,19.95vw,17.949rem)] w-full flex-col items-center gap-[clamp(0.25rem,0.29vw,0.259rem)]">
                {/* Teacher Image & Info */}
                <div className="flex w-[clamp(6.5rem,8.35vw,7.517rem)] flex-col items-center gap-[clamp(0.5rem,0.77vw,0.691rem)]">
                    <div className="h-[clamp(6rem,7.78vw,7rem)] w-[clamp(5rem,6.6vw,5.938rem)] overflow-hidden rounded-[clamp(1.5rem,2.43vw,2.188rem)]">
                        <img 
                            src={image} 
                            alt={name}
                            className="size-full object-cover object-center"
                        />
                    </div>
                    <div className="flex w-full flex-col items-center">
                        <p className="w-full min-w-full font-['Nunito'] text-[clamp(0.75rem,0.96vw,0.863rem)] font-bold leading-normal text-black">
                            {name}
                        </p>
                        <div className="overflow-hidden rounded-[clamp(1rem,1.68vw,1.514rem)] px-[clamp(0.25rem,0.38vw,0.346rem)] py-[clamp(0.125rem,0.19vw,0.173rem)]">
                            <p className="font-['Nunito'] text-[clamp(0.5rem,0.77vw,0.691rem)] font-normal leading-normal text-black">
                                {specialty}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rectangle 23 - Bottom Yellow Section */}
                <div className="relative inline-grid w-full place-items-start">
                    {/* Rectangle 23 Background */}
                    <div className="[grid-area:1_/_1] z-0 h-[clamp(7rem,8.94vw,8.044rem)] w-full">
                        <div className="absolute bottom-[3.34%] left-0 right-0 top-0">
                            <img 
                                src="/images/Rectangle 23.png" 
                                alt="" 
                                className="size-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content on top of Rectangle 23 */}
                    <div className="[grid-area:1_/_1] relative z-10 ml-[clamp(1rem,1.39vw,1.254rem)] mt-[clamp(1.5rem,2.07vw,1.86rem)] flex w-[clamp(9rem,12.16vw,10.942rem)] flex-col gap-[clamp(0.75rem,1.06vw,0.951rem)]">
                        {/* Rating & Experience */}
                        <div className="flex w-full items-center justify-between">
                            <div className="flex shrink-0 items-center rounded-[clamp(3rem,7.21vw,6.487rem)] bg-white px-[clamp(0.25rem,0.38vw,0.346rem)] py-[clamp(0.0625rem,0.1vw,0.086rem)]">
                                <Icon icon="mdi:star" className="h-[clamp(0.75rem,1.15vw,1.038rem)] w-[clamp(0.75rem,1.15vw,1.038rem)] shrink-0 text-[#ffc633]" />
                                <p className="font-['Nunito'] text-[clamp(0.45rem,0.58vw,0.519rem)] font-normal leading-normal text-[#353535]">
                                    {rating}/5 ({reviews} Reviews)
                                </p>
                            </div>
                            <p className="shrink-0 font-['Nunito'] text-[clamp(0.45rem,0.58vw,0.519rem)] font-normal leading-normal text-[#222222]">
                                {experience}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex w-full items-center justify-between">
                            <Link 
                                href="#view-profile"
                                className="flex shrink-0 items-center justify-center rounded-[clamp(1.5rem,3.89vw,3.5rem)] px-[clamp(0.75rem,1.15vw,1.038rem)] py-[clamp(0.375rem,0.58vw,0.519rem)] font-['Nunito'] text-[clamp(0.5rem,0.77vw,0.691rem)] font-medium capitalize text-[#338078] transition-colors hover:bg-white/30"
                            >
                                View profile
                            </Link>
                            <Link 
                                href="#book-now"
                                className="flex shrink-0 items-center justify-center rounded-[clamp(1.5rem,3.89vw,3.5rem)] bg-[#338078] px-[clamp(0.75rem,1.15vw,1.038rem)] py-[clamp(0.375rem,0.58vw,0.519rem)] font-['Nunito'] text-[clamp(0.5rem,0.77vw,0.691rem)] font-medium capitalize text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TeachersSection() {
    const teachers = [
        {
            name: 'Ustadh Ahmad Ali',
            specialty: 'Tajweed & Hifz',
            rating: '4.9',
            reviews: 120,
            experience: '7+ Years Exp.',
            image: '/images/feature-student.png',
        },
        {
            name: 'Ustadha Fatima',
            specialty: 'Tajweed & Hifz',
            rating: '4.9',
            reviews: 120,
            experience: '7+ Years Exp.',
            image: '/images/feature-student.png',
        },
        {
            name: 'Ustadh Ibrahim',
            specialty: 'Tajweed & Hifz',
            rating: '4.9',
            reviews: 120,
            experience: '7+ Years Exp.',
            image: '/images/feature-student.png',
        },
        {
            name: 'Ustadha Aisha',
            specialty: 'Tajweed & Hifz',
            rating: '4.9',
            reviews: 120,
            experience: '7+ Years Exp.',
            image: '/images/feature-student.png',
        },
    ];

    return (
        <div className="relative flex w-full flex-col items-center gap-[clamp(2.5rem,4.17vw,3.75rem)] overflow-hidden px-[clamp(2rem,4.38vw,4rem)] py-[clamp(3rem,5.56vw,5rem)] mb-20">
            {/* Rectangle 203 Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/Rectangle 203.png"
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Background Decorative Calligraphy */}
            <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-100 pt-30">
                <img
                    src="/images/Arabic_Calligraphy_Asy_Syifa-removebg-preview 1.png"
                    alt=""
                    className="relative "
                />
            </div>

            {/* Section Title */}
            <p className="relative z-10 bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text text-center font-['Nunito'] text-[clamp(2rem,3.33vw,3rem)] font-bold leading-normal text-transparent pb-6">
                Meet Our Certified <span className="text-[#338078]">Quran Teachers</span>
            </p>

            {/* Teachers Grid */}
            <div className="relative z-10 flex flex-wrap items-start justify-center gap-[clamp(2rem,4.58vw,4.125rem)] pb-20">
                {teachers.map((teacher, index) => (
                    <TeacherCard key={index} {...teacher} />
                ))}
            </div>
        </div>
    );
}
