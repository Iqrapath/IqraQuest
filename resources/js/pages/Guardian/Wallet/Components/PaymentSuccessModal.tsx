import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount?: string;
    message?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
    isOpen,
    onClose,
    amount,
    message = "Top up successfully"
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] sm:w-full sm:max-w-[400px] bg-white border-none shadow-xl rounded-[24px] p-6 md:p-8 flex flex-col items-center justify-center text-center">

                {/* Success Icon */}
                <div className="w-24 h-24 rounded-full bg-[#2D7A70] flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-[#2D7A70] opacity-20 rounded-full blur-xl scale-110"></div>
                    <Icon icon="heroicons:check" className="w-12 h-12 text-white stroke-[3]" />

                    {/* Decorative Squares like in design */}
                    <div className="absolute -top-4 -left-6 w-12 h-12 bg-[#E4FFFC] rounded-xl -z-10 opacity-60 rotate-12"></div>
                    <div className="absolute top-2 -right-8 w-8 h-8 bg-[#E4FFFC] rounded-lg -z-10 opacity-50 -rotate-12"></div>
                    <div className="absolute -bottom-2 -left-8 w-6 h-6 bg-[#E4FFFC] rounded-md -z-10 opacity-40 rotate-45"></div>
                </div>

                {/* Message */}
                <h2 className="text-xl text-[#111928] font-medium mb-8">
                    {amount ? `${amount} ` : ''}{message}
                </h2>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-full bg-[#39847A] text-white font-medium hover:bg-[#2d6b63] transition-all shadow-lg shadow-[#2D7A70]/20"
                >
                    Got It, JazakaAllahu Khair!
                </button>
            </DialogContent>
        </Dialog>
    );
};
