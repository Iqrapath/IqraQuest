import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { TopUpModal } from './TopUpModal';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';

interface InsufficientFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onFund is usually passed if parent handles logic, but here we handle it internally too
    onFund?: () => void;
    paystackPublicKey?: string;
    requiredAmount?: number; // Added requiredAmount
}

export const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
    isOpen,
    onClose,
    onFund,
    paystackPublicKey = "",
    requiredAmount = 0
}) => {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const pageProps = usePage<any>().props;
    // Try to get key from props if not passed directly, common in this app
    const pk = paystackPublicKey || pageProps.paystackPublicKey || "";

    // Payment Logic State
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState<{ accessCode: string; reference: string } | null>(null);
    const { currency, convert, rates } = useCurrency();
    const { auth } = pageProps;

    const handleFundClick = () => {
        if (onFund) {
            onFund();
        } else {
            setIsTopUpOpen(true);
        }
    };

    // Payment Handler
    const handleConfirmPayment = async (channel: string) => {
        setIsProcessing(true);
        try {
            const isPayPal = channel === 'paypal';
            const gateway = isPayPal ? 'paypal' : 'paystack';
            const numAmount = requiredAmount; // already NGN based on Index.tsx logic

            // Get Paystack configured currency from props
            const paystackCurrency = auth.payment_gateways_currencies?.paystack || 'NGN';

            // Calculate amounts based on currency
            const backendAmount = numAmount;
            const usdAmount = numAmount;

            // NOTE: requiredAmount is currently Total Cost (NGN)
            // If currency context is USD, we might need conversions. 
            // BUT Index.tsx passes 'totalCostNGN'. So we can assume it is NGN?
            // WalletBalance logic assumes input 'amount' matches 'currency' context.
            // Here 'requiredAmount' is explicitly NGN cost.
            // Let's assume we are paying in NGN (gateway default).

            // Simplified logic: Assume we are funding in NGN for Paystack
            // Backend expects amount in the currency specified.

            const payload: any = {
                amount: backendAmount,
                currency: 'NGN', // forcing NGN as we passed totalCostNGN
                gateway: gateway,
                channels: !isPayPal ? [channel] : undefined,
            };

            const response = await axios.post('/student/payment/initialize', payload);

            const data = response.data;

            if (data.status === 'success') {
                if (isPayPal && data.approval_url) {
                    window.location.href = data.approval_url;
                } else if (data.authorization_url) {
                    // Redirect to Paystack
                    window.location.href = data.authorization_url;
                } else if (data.access_code && data.reference) {
                    // Setup Popup Data
                    setPaymentData({
                        accessCode: data.access_code,
                        reference: data.reference
                    });
                } else {
                    // Fallback check
                    if (data.data && data.data.authorization_url) {
                        window.location.href = data.data.authorization_url;
                    } else {
                        throw new Error('Payment initialization failed - no redirect URL');
                    }
                }
            } else {
                throw new Error(data.message || 'Payment initialization failed');
            }
        } catch (err: any) {
            console.error('Payment Error:', err);
            const msg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
            toast.error(msg);
            setIsProcessing(false);
            // Don't close modal, let user retry
        }
    };

    const handlePaymentSuccess = async (reference?: string) => {
        setIsTopUpOpen(false);
        setPaymentData(null);

        const txRef = reference || paymentData?.reference;

        if (!txRef) {
            // Fallback reload if no reference (shouldn't happen with Paystack)
            router.reload({ only: ['auth'] });
            return;
        }

        const verifyToast = toast.loading('Verifying payment...');

        try {
            // Call backend to verify and credit wallet
            await axios.get(`/student/payment/verify/${txRef}`);

            toast.dismiss(verifyToast);
            toast.success('Payment successful! Your wallet has been credited.');

            // Refresh to update balance
            router.reload({ only: ['auth'] });

        } catch (error) {
            console.error(error);
            toast.dismiss(verifyToast);
            // Even if verify fails, reload just in case the webhook handled it
            router.reload({ only: ['auth'] });
            // Optionally show error but reloading is safer to see real state
        }
    };

    const handlePaymentClose = () => {
        setIsProcessing(false);
        setPaymentData(null);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[90vw] sm:w-full sm:max-w-[440px] bg-white border-none shadow-xl rounded-[24px] p-8 flex flex-col items-center justify-center text-center">
                    <DialogTitle className="sr-only">Insufficient Funds</DialogTitle>
                    <DialogDescription className="sr-only">
                        Your wallet balance is insufficient for this transaction. Please add funds to proceed.
                    </DialogDescription>
                    {/* Alert Icon */}
                    <div className="w-16 h-16 rounded-full border-2 border-[#FF3B30] flex items-center justify-center mb-6 relative">
                        <span className="text-[#FF3B30] text-3xl font-light">!</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl text-[#111928] font-medium mb-3">
                        Oops! Insufficient Funds
                    </h2>

                    {/* Description */}
                    <p className="text-[#6B7280] text-base leading-relaxed mb-8 max-w-[320px]">
                        You do not have enough funds in your account to pay for this class. Please fund your wallet and try again.
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-4 w-full">
                        <button
                            onClick={handleFundClick}
                            className="flex-1 py-3 px-6 rounded-full bg-[#39847A] text-white font-medium hover:bg-[#2d6b63] transition-all shadow-lg shadow-[#2D7A70]/20 whitespace-nowrap"
                        >
                            Fund Account
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-6 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                </DialogContent>
            </Dialog>

            {/* Top Up Modal */}
            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                amount={requiredAmount}
                currency="NGN"
                paystackPublicKey={pk}
                onConfirm={handleConfirmPayment}
                isLoading={isProcessing}
                paymentData={paymentData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentClose={handlePaymentClose}
            />
        </>
    );
};
