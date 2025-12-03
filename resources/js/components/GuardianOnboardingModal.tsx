import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

interface GuardianOnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export default function GuardianOnboardingModal({ isOpen, onComplete, onSkip }: GuardianOnboardingModalProps) {
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
                <div className="flex items' center justify-center">
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#FFF4ED]">
                        <Icon icon="mdi:account-multiple" className="h-[50px] w-[50px] text-[#E8562E]" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-[16px] text-center">
                    <h2 className="font-['Nunito'] text-[28px] font-bold text-[#111928]">
                        Welcome, Guardian! 👨‍👩‍👧‍👦
                    </h2>
                    <p className="font-['Nunito'] text-[16px] font-normal leading-[1.6] text-gray-600">
                        Manage your children's Islamic education journey. Here's how to get started:
                    </p>
                </div>

                {/* Quick Guide */}
                <div className="flex flex-col gap-[16px]">
                    <div className="flex items-start gap-[12px]">
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#FFF4ED]">
                            <Icon icon="mdi:account-plus" className="h-[18px] w-[18px] text-[#E8562E]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-['Nunito'] text-[15px] font-semibold text-[#111928]">Add Your Children</h3>
                            <p className="font-['Nunito'] text-[14px] text-gray-500">Create profiles for each child to manage their learning</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-[12px]">
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#FFF4ED]">
                            <Icon icon="mdi:account-search" className="h-[18px] w-[18px] text-[#E8562E]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-['Nunito'] text-[15px] font-semibold text-[#111928]">Find Teachers</h3>
                            <p className="font-['Nunito'] text-[14px] text-gray-500">Browse qualified teachers for your children's needs</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-[12px]">
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#FFF4ED]">
                            <Icon icon="mdi:calendar-check" className="h-[18px] w-[18px] text-[#E8562E]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-['Nunito'] text-[15px] font-semibold text-[#111928]">Schedule & Monitor</h3>
                            <p className="font-['Nunito'] text-[14px] text-gray-500">Book sessions and track your children's progress</p>
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
