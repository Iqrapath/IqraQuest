import React from 'react';
import { Icon } from '@iconify/react';

interface PaymentMethodTabProps {
    paymentMethods: any[];
    onAddBank: () => void;
    onAddWallet: () => void;
    onAddPayPal: () => void;
    onEditMethod?: (method: any) => void;
}

export default function PaymentMethodTab({
    paymentMethods,
    onAddBank,
    onAddWallet,
    onAddPayPal,
    onEditMethod
}: PaymentMethodTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Text */}
            <div>
                <p className="text-gray-600 text-lg font-light">
                    Easily manage your payments methods through our secure system.
                </p>
            </div>

            {/* Payment Type Selector Card (Dynamic) */}
            {(() => {
                const primaryMethod = paymentMethods && paymentMethods.length > 0 ? paymentMethods[0] : null;
                let icon = "solar:transfer-horizontal-bold";
                let text = "Bank Account (Direct Withdrawal)";

                if (primaryMethod) {
                    if (primaryMethod.type === 'mobile_wallet') {
                        // Helper logic for icon
                        const provider = primaryMethod.wallet_provider?.toLowerCase();
                        const icons: Record<string, string> = {
                            'mtn': 'arcticons:mymtn-ng',
                            'airtel': 'arcticons:airtel',
                            'vodafone': 'streamline-logos:vodafone-logo-block',
                            'tigo': 'streamline-logos:tigo-logo-block',
                            'mpesa': 'streamline-logos:mpesa-logo-block',
                        };
                        icon = icons[provider] || 'solar:wallet-bold';
                        text = `Mobile Wallet (${primaryMethod.wallet_provider?.toUpperCase() || 'Mobile Money'})`;
                    } else if (primaryMethod.type === 'paypal') {
                        icon = "logos:paypal";
                        text = "PayPal";
                    }
                }

                return (
                    <div className="border border-gray-300 rounded-[30px] p-6 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            <Icon icon={icon} className="w-6 h-6 text-gray-900" />
                            <span className="text-gray-900 font-medium text-lg">{text}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full border-[6px] border-[#2D7A70] bg-white"></div>
                    </div>
                );
            })()}

            {/* Saved Methods List */}
            <div className="space-y-6">
                {paymentMethods && paymentMethods.length > 0 ? (
                    paymentMethods.map((method: any, index: number) => (
                        <div key={method.id} className="relative pl-2">
                            <div className="flex justify-between items-start md:items-center group">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[#10AF88] flex items-center justify-center shrink-0">
                                            <Icon icon="solar:check-read-bold" className="text-white w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {index + 1}. {method.type === 'mobile_wallet' ? 'Mobile Wallet' : 'Bank Account'}
                                        </h4>
                                    </div>

                                    <div className="pl-9 space-y-1">
                                        {method.type === 'bank_account' ? (
                                            <>
                                                <p className="text-gray-900 font-medium text-base">
                                                    {method.bank_name}
                                                </p>
                                                <p className="text-gray-500 text-sm font-light">
                                                    {method.bank_account_name} <span className="mx-1 text-gray-300">|</span> {method.bank_account_number}
                                                </p>
                                            </>
                                        ) : method.type === 'mobile_wallet' ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="solar:wallet-bold" className="w-5 h-5 text-gray-700" />
                                                    <p className="text-gray-900 font-medium text-base">
                                                        {method.wallet_provider?.toUpperCase()}
                                                    </p>
                                                </div>
                                                <p className="text-gray-500 text-sm font-light">
                                                    {method.wallet_account_name} <span className="mx-1 text-gray-300">|</span> {method.wallet_phone_number}
                                                </p>
                                            </>
                                        ) : method.type === 'paypal' ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="logos:paypal" className="w-5 h-5" />
                                                    <p className="text-gray-900 font-medium text-base">
                                                        PayPal
                                                    </p>
                                                </div>
                                                <p className="text-gray-500 text-sm font-light">
                                                    {method.paypal_email}
                                                </p>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onEditMethod && onEditMethod(method)}
                                    className="flex items-center text-[#2D7A70] font-medium text-sm hover:underline"
                                >
                                    Change
                                    <Icon icon="solar:alt-arrow-right-linear" className="ml-1 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 font-light">
                        No payment methods saved yet.
                    </div>
                )}
            </div>

            {/* Add New Section */}
            <div>
                <p className="text-gray-600 mb-6">Add and manage your payout methods.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bank Account */}
                    <button
                        onClick={onAddBank}
                        className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-[#338078] hover:bg-green-50 transition-all text-center group"
                    >
                        <Icon icon="solar:card-bold" className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-[#338078]" />
                        <p className="font-medium text-gray-900">Add Bank Account</p>
                        <p className="text-sm text-gray-500 mt-1">Transfer to your bank</p>
                    </button>

                    {/* Mobile Wallet */}
                    <button
                        onClick={onAddWallet}
                        className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-[#338078] hover:bg-green-50 transition-all text-center group"
                    >
                        <Icon icon="solar:wallet-bold" className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-[#338078]" />
                        <p className="font-medium text-gray-900">Add Mobile Wallet</p>
                        <p className="text-sm text-gray-500 mt-1">MTN, Airtel, Glo, 9mobile</p>
                    </button>

                    {/* PayPal */}
                    <button
                        onClick={onAddPayPal}
                        className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-[#338078] hover:bg-green-50 transition-all text-center group"
                    >
                        <Icon icon="logos:paypal" className="w-12 h-12 mx-auto mb-3" />
                        <p className="font-medium text-gray-900">Add PayPal</p>
                        <p className="text-sm text-gray-500 mt-1">International transfers</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
