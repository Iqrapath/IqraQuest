import { Icon } from '@iconify/react';
import AppLogoIcon from './app-logo-icon';

interface RegistrationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    verificationMethod?: 'link' | 'otp';
}

export default function RegistrationSuccessModal({
    isOpen,
    onClose,
    verificationMethod = 'link'
}: RegistrationSuccessModalProps) {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const isOtpMode = verificationMethod === 'otp';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative flex w-full max-w-[500px] flex-col items-center gap-[24px] rounded-[32px] bg-white px-[48px] py-[88px] shadow-2xl">
                {/* Logo */}
                <div className="flex items-center">
                    <AppLogoIcon />
                </div>

                {/* Success Icon with decorative squares */}
                <div className="relative h-[143px] w-[157px]">
                    {/* Decorative squares */}
                    <div className="absolute left-[8.93%] right-[58.32%] top-0 bottom-[64.06%] rounded-[10px] bg-[#a2fff6] opacity-50" />
                    <div className="absolute left-[81.34%] right-0 top-[22.92%] bottom-[56.61%] rounded-[10px] bg-[#a2fff6] opacity-50" />
                    <div className="absolute left-0 right-[79.96%] top-[52.21%] bottom-[25.81%] rounded-[8px] bg-[#ebfffd] opacity-50" />
                    <div className="absolute left-[72.63%] right-[4.12%] top-[74.48%] bottom-0 rounded-[8px] bg-[#ebfffd] opacity-50" />

                    {/* Check mark circle */}
                    <div className="absolute left-1/2 top-1/2 flex h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#338078]">
                        <Icon icon="mdi:check" className="h-[60px] w-[60px] text-white" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex w-full flex-col items-center gap-[12px] text-center">
                    <h2 className="font-['Nunito'] text-[32px] font-semibold leading-[1.5] text-[#111928]">
                        Thank you for signing up!
                    </h2>
                    <div className="font-['Nunito'] text-[16px] font-medium leading-[1.5] text-gray-500">
                        {isOtpMode ? (
                            <>
                                <p className="mb-0">
                                    A 6-digit verification code has been sent to your email address.
                                </p>
                                <p>You will be redirected to the verification page shortly...</p>
                            </>
                        ) : (
                            <>
                                <p className="mb-0">
                                    A message with a confirmation link has been sent to your email address.
                                </p>
                                <p>Kindly open the link to activate your account.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
