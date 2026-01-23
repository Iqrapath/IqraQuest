import { useState } from 'react';
import { Icon } from '@iconify/react';
import { usePage } from '@inertiajs/react';

interface FAQItemProps {
    number: string;
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

function FAQItem({ number, question, answer, isOpen, onToggle }: FAQItemProps) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    return (
        <div className="w-full">
            <div
                className={`w-full rounded-[clamp(1rem,2.22vw,2rem)] border border-[rgba(51,128,120,0.3)] px-[clamp(1rem,3.88vw,3.493rem)] py-[clamp(1.5rem,3.36vw,3.027rem)] transition-all ${isOpen ? 'bg-[#fff8e7]' : 'bg-white'
                    }`}
            >
                <div className="flex items-start gap-[clamp(1rem,3.36vw,3.027rem)]">
                    {/* Number */}
                    <div className="flex shrink-0 items-start gap-[clamp(0.375rem,0.65vw,0.583rem)]">
                        <p className="font-['Nunito'] text-[clamp(1rem,2.07vw,1.863rem)] font-bold leading-[1.2] text-[rgba(60,60,67,0.5)]">
                            {number}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-[clamp(0.75rem,1.55vw,1.397rem)]">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-[clamp(0.5rem,1.03vw,0.931rem)]">
                            <p className="flex-1 font-['Nunito'] text-[clamp(0.875rem,1.67vw,1.5rem)] font-semibold leading-[1.3] text-[#338078]">
                                {question}
                            </p>

                            {/* Toggle Button */}
                            <button
                                onClick={onToggle}
                                className={`flex size-[clamp(2rem,3.1vw,2.794rem)] shrink-0 items-center justify-center rounded-[clamp(0.5rem,1.67vw,1.5rem)] transition-colors ${isOpen ? 'bg-[#338078]' : 'bg-[#f3f5f6]'
                                    }`}
                                aria-label={isOpen ? __('Collapse') : __('Expand')}
                            >
                                <Icon
                                    icon={isOpen ? 'mdi:close' : 'mdi:plus'}
                                    className={`h-[clamp(1rem,0.9vw,0.815rem)] w-[clamp(1rem,0.9vw,0.815rem)] ${isOpen ? 'text-white' : 'text-[#338078]'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Answer */}
                        {isOpen && (
                            <div className="flex flex-col gap-[clamp(0.75rem,1.03vw,0.931rem)] pt-[clamp(0.5rem,1vw,1rem)]">
                                <div
                                    className="font-['Nunito'] text-[clamp(0.875rem,1.67vw,1.5rem)] font-normal leading-[1.5] text-[rgba(60,60,67,0.85)] prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: answer }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="my-[clamp(0.75rem,0.1vw,0.087rem)] h-[0.001px] w-full bg-[rgba(205,214,218,0.25)]" />
        </div>
    );
}

export default function FAQSection({ faqs }: { faqs: any[] }) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    const [openIndex, setOpenIndex] = useState<number>(0);

    return (
        <div className="relative w-full overflow-hidden bg-white px-[clamp(1rem,11.5vw,10.356rem)] py-[clamp(2rem,4.14vw,3.725rem)]">
            {/* Background Calligraphy */}
            <div
                className="absolute left-[calc(93.75%-99.5px)] top-[100px] -translate-x-1/2 opacity-10"
                style={{ transform: 'translateX(-50%) rotate(27.855deg)' }}
            >
                <img
                    src="/images/Arabic_Calligraphy_Asy_Syifa-removebg-preview 1.png"
                    alt={__("Decorative Calligraphy")}
                    className="h-[596px] w-[441px]"
                />
            </div>

            <div className="relative mx-auto flex max-w-[1104.24px] flex-col gap-[clamp(1rem,1.67vw,1.5rem)]">
                {/* Section Header */}
                <div className="flex flex-col gap-[clamp(0.5rem,0.69vw,0.625rem)] px-[clamp(0rem,11.81vw,10.625rem)] py-[clamp(0.5rem,0.69vw,0.625rem)]">
                    <div className="flex flex-col items-start gap-[clamp(0.5rem,2vw,1.5rem)] font-['Nunito'] font-bold leading-normal lg:flex-row lg:items-end lg:gap-[clamp(2rem,3.4vw,3.063rem)]">
                        <p className="max-w-[298px] bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text text-[clamp(1.75rem,3.33vw,3rem)] text-transparent">
                            {__("Have Questions?")}
                        </p>
                        <p className="bg-gradient-to-r from-[#338078] to-[#0a1a18] bg-clip-text text-[clamp(1.25rem,2.22vw,2rem)] text-transparent lg:text-center">
                            {__("We've Got Answers!")}
                        </p>
                    </div>
                </div>

                {/* FAQ List */}
                <div className="flex flex-col items-center px-[clamp(0rem,11.5vw,10.356rem)] py-[clamp(1.5rem,4.14vw,3.725rem)]">
                    <div className="w-full max-w-[1098.88px]">
                        {faqs.length > 0 ? (
                            faqs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    number={(index + 1).toString().padStart(2, '0')}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openIndex === index}
                                    onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3f5f6]">
                                    <Icon icon="ph:question-light" className="h-10 w-10 text-[#338078]" />
                                </div>
                                <h3 className="mb-2 font-['Nunito'] text-xl font-bold text-[#338078]">
                                    {__("No Questions Yet")}
                                </h3>
                                <p className="max-w-md font-['Nunito'] text-gray-500">
                                    {__("We haven't added any frequently asked questions yet. If you have a question, please feel free to reach out to our support team.")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
