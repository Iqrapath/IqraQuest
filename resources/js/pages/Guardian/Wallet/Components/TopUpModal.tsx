
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { CurrencyCode, CURRENCY_CONFIG } from '@/contexts/CurrencyContext';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { usePage } from '@inertiajs/react';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    currency: CurrencyCode;
    onConfirm: (channel: string) => void;
    isLoading?: boolean;
    paymentData?: { accessCode: string; reference: string } | null;
    onPaymentSuccess?: () => void;
    onPaymentClose?: () => void;
    paystackPublicKey: string;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
    isOpen,
    onClose,
    amount,
    currency,
    onConfirm,
    isLoading = false,
    paymentData = null,
    onPaymentSuccess,
    onPaymentClose,
    paystackPublicKey
}) => {
    const [selectedMethod, setSelectedMethod] = React.useState<string>('card');
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || '';

    // Initialize Paystack popup when payment data is available
    React.useEffect(() => {
        if (paymentData && selectedMethod === 'card') {
            console.log('Paystack Public Key:', paystackPublicKey);
            console.log('Payment Data:', paymentData);
            console.log('User Email:', userEmail);
            console.log('Amount (original):', amount);
            console.log('Amount (in kobo):', amount * 100);


            // Using GHS (Ghanaian Cedi) as configured in Paystack account
            // Note: Amount in pesewas (smallest unit of GHS, 100 pesewas = 1 GHS)
            const paystackConfig = {
                key: paystackPublicKey,
                email: userEmail,
                amount: Math.round(amount * 100), // Amount in pesewas
                ref: paymentData.reference,
                currency: 'GHS', // Ghanaian Cedi - as configured in Paystack
                onClose: function () {
                    onPaymentClose?.();
                },
                callback: function (response: any) {
                    onPaymentSuccess?.();
                }
            };

            console.log('Paystack Config:', paystackConfig);

            const handler = (window as any).PaystackPop.setup(paystackConfig);
            handler.openIframe();
        }
    }, [paymentData, selectedMethod]);

    const handlePay = () => {
        onConfirm(selectedMethod);
    };

    const methods = [
        {
            id: 'card',
            label: 'Credit/Debit Card',
            icon: 'heroicons:credit-card',
        },
        {
            id: 'bank_transfer',
            label: 'Bank Transfer',
            icon: 'mingcute:transfer-line',
        },
        {
            id: 'paypal',
            label: 'Paypal',
            icon: 'logos:paypal',
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px] p-0 gap-0 bg-white border-none shadow-xl overflow-hidden rounded-[24px] max-h-[90vh] overflow-y-auto">
                <VisuallyHidden>
                    <DialogTitle>Payment Method Selection</DialogTitle>
                    <DialogDescription>Select a payment method and enter details to top up your wallet.</DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col md:flex-row md:min-h-[500px]">
                    {/* Left Sidebar */}
                    <div className="w-full md:w-[280px] bg-white p-4 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
                        <h2 className="text-lg font-semibold text-[#111928] mb-3 md:mb-8 font-['Nunito']">Payment Methods:</h2>
                        <div className="grid grid-cols-1 gap-2 md:gap-4 md:overflow-visible">
                            {methods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`w-full flex items-center p-3 md:p-4 rounded-xl transition-all duration-200 border text-left ${selectedMethod === method.id
                                        ? 'bg-[#E4FFFC] border-[#E4FFFC] text-[#2D7A70]'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="mr-3">
                                        <Icon icon={method.icon} className={`w-5 h-5 md:w-6 md:h-6 ${selectedMethod === method.id ? 'text-[#2D7A70]' : 'text-gray-400'}`} />
                                    </div>
                                    <span className="font-medium text-sm md:text-base">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 p-5 md:p-8 bg-white min-h-[300px]">
                        {selectedMethod === 'card' && (
                            <div className="h-full flex flex-col items-center justify-center text-center w-full max-w-[420px] mx-auto py-2 md:py-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E4FFFC] flex items-center justify-center mb-4 md:mb-6">
                                    <Icon icon="heroicons:credit-card" className="w-8 h-8 md:w-10 md:h-10 text-[#2D7A70]" />
                                </div>

                                <h3 className="text-lg md:text-xl font-semibold text-[#111928] mb-2 md:mb-3">
                                    Pay Securely with Card
                                </h3>

                                <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-xs">
                                    Click the button below to enter your card details in a secure Paystack popup with automatic formatting and validation.
                                </p>

                                <div className="w-full space-y-3 md:space-y-4">
                                    <button
                                        onClick={handlePay}
                                        disabled={isLoading}
                                        className="w-full py-3 md:py-4 px-6 rounded-full bg-[#2D7A70] text-white font-semibold hover:bg-[#24635b] transition-all shadow-lg shadow-[#2D7A70]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Icon icon="line-md:loading-loop" className="w-5 h-5 mr-2" />
                                                Initializing...
                                            </>
                                        ) : (
                                            <>
                                                Pay {CURRENCY_CONFIG[currency].symbol}{amount.toLocaleString()}
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="w-full py-2.5 md:py-3 px-6 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 text-sm md:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
                                    <Icon icon="heroicons:shield-check" className="w-5 h-5" />
                                    <span>Secured by Paystack</span>
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'bank_transfer' && (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Icon icon="mingcute:transfer-line" className="w-16 h-16 text-gray-200 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Bank Transfer</h3>
                                <p className="text-gray-500 max-w-xs">
                                    Proceed to generate a transfer account.
                                </p>
                                <button
                                    onClick={handlePay}
                                    disabled={isLoading}
                                    className="mt-8 py-3 px-8 rounded-full bg-[#2D7A70] text-white font-medium hover:bg-[#24635b] transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : 'Proceed to Transfer'}
                                </button>
                            </div>
                        )}

                        {selectedMethod === 'paypal' && (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Icon icon="logos:paypal" className="w-16 h-16 mb-4 opacity-50 grayscale" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">PayPal</h3>
                                <p className="text-gray-500 max-w-xs">
                                    You will be redirected to PayPal to complete your payment.
                                </p>
                                <button
                                    onClick={handlePay}
                                    disabled={isLoading}
                                    className="mt-8 py-3 px-8 rounded-full bg-[#003087] text-white font-medium hover:bg-[#003087]/90 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : 'Pay with PayPal'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
