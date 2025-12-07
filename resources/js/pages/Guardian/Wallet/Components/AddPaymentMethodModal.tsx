import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from '@iconify/react';

interface AddPaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMethod?: (methodId: string) => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
    isOpen,
    onClose,
    onSelectMethod
}) => {

    const paymentOptions = [
        {
            id: 'bank-account',
            title: 'Bank Account (Direct Withdrawal)',
            description: 'Withdraw your earnings directly to a linked bank account.',
            icon: 'solar:card-bold',
            buttonText: 'Add Bank Transfer',
            buttonColor: 'bg-[#2D7A70]',
        },
        {
            id: 'mobile-wallet',
            title: 'Mobile Wallets',
            description: 'Withdraw your earnings via Mobile Money.',
            icon: 'solar:wallet-bold',
            buttonText: 'Add Mobile Wallet',
            buttonColor: 'bg-[#2D7A70]',
        },
        {
            id: 'paypal',
            title: 'PayPal',
            description: 'Withdraw your earnings via PayPal.',
            icon: 'logos:paypal',
            buttonText: 'Add PayPal',
            buttonColor: 'bg-[#003087]',
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[700px] p-6 bg-white border-none shadow-xl rounded-[24px]">
                <DialogTitle className="sr-only">Add Payment Method</DialogTitle>
                <DialogDescription className="sr-only">Select how you'd like to pay online.</DialogDescription>

                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl md:text-2xl font-bold text-[#111928] font-['Nunito']">
                        Add your Payment Method
                    </h2>
                </div>
                <p className="text-gray-500 font-light mb-8">
                    Select how you'd like to pay online.
                </p>

                <div className="space-y-4">
                    {paymentOptions.map((option) => (
                        <div
                            key={option.id}
                            className="flex flex-col md:flex-row items-center justify-between p-5 rounded-[20px] border border-gray-200 hover:border-[#2D7A70]/30 transition-all gap-4 bg-white"
                        >
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                    <Icon icon={option.icon} className="w-8 h-8 text-gray-900" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-base font-bold text-gray-900">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-light">
                                        {option.description}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => onSelectMethod?.(option.id)}
                                className={`w-full md:w-auto px-6 py-2.5 ${option.buttonColor} hover:opacity-90 text-white text-sm font-medium rounded-full transition-all whitespace-nowrap shadow-lg shadow-gray-200`}
                            >
                                {option.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddPaymentMethodModal;
