import { Icon } from '@iconify/react';
import { usePage } from '@inertiajs/react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

interface TestimonialCardProps {
    quote: string;
    name: string;
    role: string;
    image: string;
    rating: number;
    isActive: boolean;
}

function TestimonialCard({ quote, name, role, image, rating, isActive }: TestimonialCardProps) {
    return (
        <div
            className={`relative min-w-[clamp(300px,26.6vw,383px)] transition-all duration-500 ${isActive
                    ? 'z-20 scale-[1.2] opacity-100'
                    : 'z-10 scale-100 opacity-60 blur-[2px]'
                }`}
        >
            {/* Card Background */}
            <div className="relative h-[clamp(240px,22.57vw,325px)] rounded-[clamp(1rem,2vw,1.5rem)] border border-[#ededed] bg-white p-[clamp(1.5rem,2.08vw,1.875rem)] shadow-lg">
                {/* Quote Icon */}
                <div className="mb-[clamp(0.75rem,1.11vw,1rem)] flex size-[clamp(2.5rem,3.75vw,3.375rem)] items-center justify-center rounded-full bg-[#120F0F]">
                    <Icon
                        icon="mdi:format-quote-close"
                        className="h-[clamp(1.25rem,1.74vw,1.563rem)] w-[clamp(1.25rem,1.74vw,1.563rem)] text-white rotate-180"
                    />
                </div>

                {/* Rating Stars */}
                <div className="mb-[clamp(0.75rem,1.11vw,1rem)] flex gap-[clamp(0.25rem,0.35vw,0.313rem)]">
                    {[...Array(5)].map((_, i) => (
                        <Icon
                            key={i}
                            icon="mdi:star"
                            className={`h-[clamp(0.75rem,1.11vw,1rem)] w-[clamp(0.75rem,1.11vw,1rem)] ${i < rating ? 'text-[#ffc633]' : 'text-gray-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Quote Text */}
                <p className="mb-[clamp(1.5rem,2.08vw,1.875rem)] font-['Nunito'] text-[clamp(0.875rem,1.11vw,1rem)] font-normal leading-[clamp(1.25rem,1.67vw,1.5rem)] text-[#797979]">
                    {quote}
                </p>

                {/* Divider */}
                <div className="absolute bottom-[clamp(3rem,4.17vw,3.75rem)] left-[clamp(1.5rem,2.08vw,1.875rem)] right-[clamp(1.5rem,2.08vw,1.875rem)] h-[1px] bg-gray-200" />

                {/* Author Info */}
                <div className="absolute bottom-[4%] left-[clamp(1.5rem,2.08vw,1.875rem)] flex items-center gap-[clamp(0.75rem,1.11vw,1rem)]">
                    <div className="size-[clamp(2rem,2.5vw,2.25rem)] overflow-hidden rounded-full">
                        <img src={image} alt={name} className="size-full object-cover" />
                    </div>
                    <div>
                        <p className="font-['Nunito'] text-[clamp(0.75rem,0.97vw,0.875rem)] font-bold leading-normal text-[#453232]">
                            {name}
                        </p>
                        <p className="font-['Nunito'] text-[clamp(0.625rem,0.83vw,0.75rem)] font-normal leading-normal text-[#797979]">
                            {role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TestimonialsSection() {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: false,
        skipSnaps: false,
        slidesToScroll: 1,
    });

    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const testimonials = [
        {
            quote: __('The Tajweed lessons are very interactive, and I feel more confident in my recitation.'),
            name: __('Ahmed S., UK'),
            role: __('CEO Universal'),
            image: '/images/feature-student.png',
            rating: 5,
        },
        {
            quote: __('Finding a female Quran teacher for my daughter was difficult until I found this platform. Now, she enjoys her Tajweed classes.'),
            name: __('Aisha K., Canada'),
            role: __('CEO Eronaman'),
            image: '/images/feature-student.png',
            rating: 5,
        },
        {
            quote: __("I always struggled with pronunciation, but my teacher's patience and guidance helped me improve."),
            name: __('Bilal R., UAE'),
            role: __('CEO Universal'),
            image: '/images/feature-student.png',
            rating: 5,
        },
        {
            quote: __('My son completed his Hifz with an excellent tutor. The structured lessons and motivation from his teacher made all the difference!'),
            name: __('Farooq M., Saudi Arabia'),
            role: __('CEO Universal'),
            image: '/images/feature-student.png',
            rating: 5,
        },
    ];

    return (
        <div className="relative w-full overflow-hidden bg-white px-[clamp(2rem,4.38vw,4rem)] py-[clamp(4rem,6.94vw,6.25rem)]">
            {/* Background Quran Image */}
            <div className="pointer-events-none absolute bottom-0 left-[-1%] size-[400px] opacity-30">
                <img
                    src="/images/Beautiful_quran_mazid-removebg-preview 3.png"
                    alt={__("Decorative Quran")}
                    className="size-full object-cover"
                />
            </div>

            {/* Section Header */}
            <div className="relative z-10 mb-[clamp(3rem,4.17vw,3.75rem)] flex flex-col items-center text-center">
                <p className="font-['Nunito'] text-[clamp(0.875rem,1.25vw,1.125rem)] font-bold uppercase leading-normal text-[#338078]">
                    {__("Testimonial")}
                </p>
                <p className="bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text font-['Nunito'] text-[clamp(2rem,3.33vw,3rem)] font-bold leading-[clamp(3rem,4.44vw,4rem)] text-transparent">
                    {__("What Our Students Say")}
                </p>
            </div>

            {/* Mobile/Tablet: Simple Vertical List */}
            <div className="relative z-10 flex flex-col gap-[clamp(1.5rem,3vw,2rem)] py-[clamp(2rem,4vw,3rem)] lg:hidden">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="rounded-[1.5rem] border border-[#ededed] bg-white p-[clamp(1.5rem,3vw,2rem)] shadow-lg">
                        <div className="mb-[clamp(0.75rem,1.5vw,1rem)] flex size-[clamp(2.5rem,5vw,3rem)] items-center justify-center rounded-full bg-[#338078]">
                            <Icon icon="mdi:format-quote-close" className="h-[clamp(1.25rem,2.5vw,1.5rem)] w-[clamp(1.25rem,2.5vw,1.5rem)] rotate-180 text-white" />
                        </div>
                        <div className="mb-[clamp(0.75rem,1.5vw,1rem)] flex gap-[0.25rem]">
                            {[...Array(5)].map((_, i) => (
                                <Icon key={i} icon="mdi:star" className={`h-[1rem] w-[1rem] ${i < testimonial.rating ? 'text-[#ffc633]' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="mb-[clamp(1.5rem,3vw,2rem)] font-['Nunito'] text-[clamp(0.875rem,1.5vw,1rem)] font-normal leading-[1.5] text-[#797979]">
                            {testimonial.quote}
                        </p>
                        <div className="flex items-center gap-[clamp(0.75rem,1.5vw,1rem)] border-t border-gray-200 pt-[clamp(1rem,2vw,1.5rem)]">
                            <div className="size-[clamp(2.5rem,5vw,3rem)] overflow-hidden rounded-full">
                                <img src={testimonial.image} alt={testimonial.name} className="size-full object-cover" />
                            </div>
                            <div>
                                <p className="font-['Nunito'] text-[clamp(0.875rem,1.5vw,1rem)] font-bold text-[#453232]">{testimonial.name}</p>
                                <p className="font-['Nunito'] text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#797979]">{testimonial.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: Carousel with Active Card */}
            <div className="relative z-10 hidden overflow-hidden py-[clamp(2rem,4vw,3rem)] lg:block" ref={emblaRef}>
                <div className="flex items-center gap-[clamp(1.5rem,2.08vw,1.875rem)]">
                    <div className="min-w-[calc(50%-clamp(150px,13.3vw,191.5px)-clamp(0.75rem,1.04vw,0.9375rem))]" />
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            {...testimonial}
                            isActive={index === selectedIndex}
                        />
                    ))}
                    <div className="min-w-[calc(50%-clamp(150px,13.3vw,191.5px)-clamp(0.75rem,1.04vw,0.9375rem))]" />
                </div>
            </div>

            {/* Navigation Arrows - Desktop Only */}
            <div className="relative z-10 mt-[clamp(2rem,2.78vw,2.5rem)] hidden items-center justify-center gap-[clamp(4rem,6.85vw,6.166rem)] lg:flex">
                <button
                    onClick={scrollPrev}
                    className="flex size-[clamp(2.5rem,3.47vw,3.125rem)] items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    aria-label={__("Previous testimonial")}
                >
                    <Icon
                        icon="mdi:chevron-left"
                        className="h-[clamp(2rem,2.78vw,2.5rem)] w-[clamp(2rem,2.78vw,2.5rem)] text-[#202020]"
                    />
                </button>
                <button
                    onClick={scrollNext}
                    className="flex size-[clamp(2.5rem,3.47vw,3.125rem)] items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    aria-label={__("Next testimonial")}
                >
                    <Icon
                        icon="mdi:chevron-right"
                        className="h-[clamp(2rem,2.78vw,2.5rem)] w-[clamp(2rem,2.78vw,2.5rem)] text-gray-400"
                    />
                </button>
            </div>
        </div>
    );
}

