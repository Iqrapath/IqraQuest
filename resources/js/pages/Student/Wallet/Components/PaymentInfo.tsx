import React from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface PaymentInfoProps {
    onAddPaymentInfo?: () => void;
    paymentMethods?: any[];
    onEditMethod?: (method: any) => void;
}

// Helper function to get wallet provider icon
const getWalletProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
        'mtn': 'arcticons:mymtn-ng',
        'airtel': 'arcticons:airtel',
        'vodafone': 'streamline-logos:vodafone-logo-block',
        'tigo': 'streamline-logos:tigo-logo-block',
        'mpesa': 'streamline-logos:mpesa-logo-block',
    };
    return icons[provider?.toLowerCase()] || 'solar:wallet-bold';
};

export const PaymentInfo: React.FC<PaymentInfoProps> = ({ onAddPaymentInfo, paymentMethods = [], onEditMethod }) => {

    if (!paymentMethods || paymentMethods.length === 0) {
        return (
            <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                {/* Empty State Icon/Illustration placeholder */}
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                    <Icon icon="solar:card-outline" className="w-12 h-12 text-gray-300" />
                </div>

                <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No Wallet Info added yet
                </h3>

                <p className="text-gray-500 mb-8 max-w-sm">
                    Add your payment details to enable withdrawals and manage your earnings efficiently.
                </p>

                <button
                    onClick={onAddPaymentInfo}
                    className="px-8 py-3 bg-[#2D7A70] hover:bg-[#24635b] text-white font-medium rounded-full shadow-lg shadow-[#2D7A70]/20 transition-all flex items-center"
                >
                    <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                    Add Payment Info
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Your Payment Information</h3>
                <button
                    onClick={onAddPaymentInfo}
                    className="text-sm text-[#2D7A70] font-medium hover:underline"
                >
                    + Add New
                </button>
            </div>

            <div className="space-y-4">
                {paymentMethods.map((method: any, index: number) => (
                    <div key={method.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-[#2D7A70]/30 hover:shadow-md">
                        <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center space-x-3">
                                <div className="h-5 w-5 rounded-full bg-[#10AF88] flex items-center justify-center shrink-0">
                                    <Icon icon="solar:check-read-bold" className="text-white w-3.5 h-3.5" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-base">
                                    {index + 1}. {method.type === 'mobile_wallet' ? 'Mobile Wallet' : 'Bank Transfer'}
                                </h4>
                            </div>

                            <div className="pl-8 space-y-1">
                                {method.type === 'bank_account' ? (
                                    <>
                                        <p className="text-gray-900 font-semibold text-[15px]">
                                            {method.bank_name}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {method.bank_account_name} &nbsp;<span className="text-gray-300">|</span>&nbsp; {method.bank_account_number}
                                        </p>
                                    </>
                                ) : method.type === 'mobile_wallet' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Icon icon={getWalletProviderIcon(method.wallet_provider)} className="w-5 h-5 text-gray-700" />
                                            <p className="text-gray-900 font-semibold text-[15px]">
                                                {method.wallet_provider?.toUpperCase()}
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            {method.wallet_account_name} &nbsp;<span className="text-gray-300">|</span>&nbsp; {method.wallet_phone_number}
                                        </p>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        <button
                            onClick={() => onEditMethod?.(method)}
                            className="flex items-center text-[#338078] font-bold text-sm hover:underline pl-8 md:pl-0 self-end md:self-center"
                        >
                            Change
                            <Icon icon="solar:alt-arrow-right-linear" className="ml-1 w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
