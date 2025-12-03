import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

interface StudentOnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export default function StudentOnboardingModal({ isOpen, onComplete, onSkip }: StudentOnboardingModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleGetStarted = () => {
        setIsProcessing(true);
        router.post('/onboarding/complete', {}, {
            onFinish: () => {
                setIsProcessing(false);
                onComplete();
            }
        });
    };

    const handleSkip = () => {
        setIsProcessing(true);
        router.post('/onboarding/skip', {}, {
            onFinish: () => {
                setIsProcessing(false);
                onSkip();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex w-full max-w-[600px] flex-col gap-[32px] rounded-[24px] bg-white p-[48px] shadow-2xl">
                {/* Header with Logo */}
                <div className="flex items-center gap-[7px]">
                    <AppLogoIcon className="h-[25px] w-[35px] fill-current text-[#338078]" />
                    <p className="font-['Nunito'] text-[22px] font-extrabold text-[#338078]">
                        IqraQuest
                    </p>
                </div>

                {/* Welcome Icon */}
                <div className="flex items-center justify-center">
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#E8F5F4]">
                        <Icon icon="mdi:book-open-page-variant" className="h-[50px] w-[50px] text-[#338078]" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-[16px] text-center">
                    <h2 className="font-['Nunito'] text-[28px] font-bold text-[#111928]">
                        Welcome to Your Learning Journey! 🎓
                    </h2>
                    <p className="font-['Nunito'] text-[16px] font-normal leading-[1.6] text-gray-600">
                        You're all set to start learning! Here's what you can do:
                    </p>
                </div>

                {/* Quick Guide */}
                <div className="flex flex-col gap-[16px]">
                    <div className="flex items-start gap-[12px]">
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#E8F5F4]">
                            <Icon icon="mdi:magnify" className="h-[18px] w-[18px] text-[#338078]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-['Nunito'] text-[15px] font-semibold text-[#111928]">Browse Teachers</h3>
                            <p className="font-['Nunito'] text-[14px] text-gray-500">Find qualified Quran teachers for Hifz, Tajweed, and more</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-[12px]">
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#E8F5F4]">
                            <Icon icon="mdi:calendar-clock" className="h-[18px] w-[18px] text-[#338078]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-['Nunito'] text-[15px] font-semibold text-[#111928]">Book Sessions</h3>
                            <p className="font-['Nunito'] text-[14px] text-gray-500">Schedule lessons at times that work for you</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-[12px]">
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#E8F5F4]">
                            <Icon icon="mdi:chart-line" className="h-[18px] w-[18px] text-[#338078]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-['Nunito'] text-[15px] font-semibold text-[#111928]">Track Progress</h3>
                            <p className="font-['Nunito'] text-[14px] text-gray-500">Monitor your learning journey and achievements</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-[12px]">
                    <button
                        onClick={handleSkip}
                        disabled={isProcessing}
                        className="flex-1 rounded-[56px] border border-[#d0d5dd] bg-white px-[24px] py-[12px] font-['Nunito'] text-[15px] font-semibold text-[#344054] transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Skip for Now
                    </button>
                    <button
                        onClick={handleGetStarted}
                        disabled={isProcessing}
                        className="flex-1 rounded-[56px] bg-[#338078] px-[24px] py-[12px] font-['Nunito'] text-[15px] font-semibold text-white transition-colors hover:bg-[#2a6b64] disabled:opacity-50"
                    >
                        {isProcessing ? 'Loading...' : 'Get Started'}
                    </button>
                </div>
            </div>
        </div>
    );
}
