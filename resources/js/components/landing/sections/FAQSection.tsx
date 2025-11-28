import { useState } from 'react';
import { Icon } from '@iconify/react';

interface FAQItemProps {
    number: string;
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

function FAQItem({ number, question, answer, isOpen, onToggle }: FAQItemProps) {
    return (
        <div className="w-full">
            <div 
                className={`w-full rounded-[clamp(1.5rem,2.22vw,2rem)] border border-[rgba(51,128,120,0.3)] px-[clamp(2rem,3.88vw,3.493rem)] py-[clamp(2rem,3.36vw,3.027rem)] transition-all ${
                    isOpen ? 'bg-[#fff8e7]' : 'bg-white'
                }`}
            >
                <div className="flex items-start gap-[clamp(2rem,3.36vw,3.027rem)]">
                    {/* Number */}
                    <div className="flex shrink-0 items-start gap-[clamp(0.375rem,0.65vw,0.583rem)]">
                        <p className="font-['Nunito'] text-[clamp(1.25rem,2.07vw,1.863rem)] font-bold leading-[1.2] text-[rgba(60,60,67,0.5)]">
                            {number}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-[clamp(1rem,1.55vw,1.397rem)]">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-[clamp(0.75rem,1.03vw,0.931rem)]">
                            <p className="flex-1 font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-semibold leading-[1.2] text-[#338078]">
                                {question}
                            </p>
                            
                            {/* Toggle Button */}
                            <button
                                onClick={onToggle}
                                className={`flex size-[clamp(2rem,3.1vw,2.794rem)] shrink-0 items-center justify-center rounded-[clamp(1rem,1.67vw,1.5rem)] transition-colors ${
                                    isOpen ? 'bg-[#338078]' : 'bg-[#f3f5f6]'
                                }`}
                                aria-label={isOpen ? 'Collapse' : 'Expand'}
                            >
                                <Icon 
                                    icon={isOpen ? 'mdi:close' : 'mdi:plus'} 
                                    className={`h-[clamp(0.75rem,0.9vw,0.815rem)] w-[clamp(0.75rem,0.9vw,0.815rem)] ${
                                        isOpen ? 'text-white' : 'text-[#338078]'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Answer */}
                        {isOpen && (
                            <div className="flex flex-col gap-[clamp(0.75rem,1.03vw,0.931rem)]">
                                <p className="font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-normal leading-[1.2] text-[rgba(60,60,67,0.85)]">
                                    {answer}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="my-[clamp(0.5rem,0.1vw,0.087rem)] h-[0.001px] w-full bg-[rgba(205,214,218,0.25)]" />
        </div>
    );
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number>(0);

    const faqs = [
        {
            number: '01',
            question: 'How do I book a teacher?',
            answer: 'Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla.',
        },
        {
            number: '02',
            question: 'Are the teachers certified?',
            answer: 'Yes, all our teachers are certified and have extensive experience in teaching Quran with proper Tajweed and Islamic knowledge.',
        },
        {
            number: '03',
            question: 'Can I choose the class timing?',
            answer: 'Absolutely! You have full flexibility to choose class timings that work best for your schedule. Our teachers are available 24/7.',
        },
        {
            number: '04',
            question: 'Do you offer free trial classes?',
            answer: 'Yes, we offer a free trial class so you can experience our teaching methodology and find the perfect teacher for your needs.',
        },
    ];

    return (
        <div className="relative w-full overflow-hidden bg-white px-[clamp(2rem,11.5vw,10.356rem)] py-[clamp(3rem,4.14vw,3.725rem)]">
            {/* Background Calligraphy */}
            <div 
                className="absolute left-[calc(93.75%-99.5px)] top-[100px] -translate-x-1/2 opacity-10"
                style={{ transform: 'translateX(-50%) rotate(27.855deg)' }}
            >
                <img 
                    src="/images/Arabic_Calligraphy_Asy_Syifa-removebg-preview 1.png" 
                    alt="" 
                    className="h-[596px] w-[441px]"
                />
            </div>

            <div className="relative mx-auto flex max-w-[1104.24px] flex-col gap-[clamp(1rem,1.67vw,1.5rem)]">
                {/* Section Header */}
                <div className="flex flex-col gap-[clamp(0.5rem,0.69vw,0.625rem)] px-[clamp(2rem,11.81vw,10.625rem)] py-[clamp(0.5rem,0.69vw,0.625rem)]">
                    <div className="flex items-end gap-[clamp(2rem,3.4vw,3.063rem)] font-['Nunito'] font-bold leading-normal">
                        <p className="w-[298px] bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text text-[clamp(2rem,3.33vw,3rem)] text-transparent">
                            Have Questions?
                        </p>
                        <p className="bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text text-center text-[clamp(1.5rem,2.22vw,2rem)] text-transparent">
                            We've Got Answers!
                        </p>
                    </div>
                </div>

                {/* FAQ List */}
                <div className="flex flex-col items-center px-[clamp(2rem,11.5vw,10.356rem)] py-[clamp(2rem,4.14vw,3.725rem)]">
                    <div className="w-[1098.88px]">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                {...faq}
                                isOpen={openIndex === index}
                                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
