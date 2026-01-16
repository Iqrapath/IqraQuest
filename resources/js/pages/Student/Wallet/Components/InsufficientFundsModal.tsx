import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { TopUpModal } from './TopUpModal';
import { usePage, router } from '@inertiajs/react';
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
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-[480px] bg-[#F8FEFD] border border-[#E0F2F1] shadow-[0_20px_50px_rgba(0,77,64,0.1)] rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Icon icon="ph:wallet-bold" className="w-32 h-32 text-[#004D40]" />
                    </div>

                    <DialogTitle className="sr-only">Insufficient Funds</DialogTitle>
                    <DialogDescription className="sr-only">
                        Your wallet balance is insufficient for this transaction. Please add funds to proceed.
                    </DialogDescription>

                    {/* Alert Icon - Keeping Red as requested */}
                    <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center mb-8 relative group transition-transform hover:scale-110">
                        <div className="absolute inset-0 bg-red-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                        <Icon icon="ph:warning-circle-bold" className="w-10 h-10 text-[#FF3B30] relative z-10" />
                    </div>

                    {/* Title */}
                    <div className="space-y-2 mb-6">
                        <h2 className="text-2xl md:text-3xl font-black text-[#004D40] tracking-tight">
                            Low Wallet Balance
                        </h2>
                        <div className="h-1 w-12 bg-[#358D83] rounded-full mx-auto opacity-30" />
                    </div>

                    {/* Description */}
                    <p className="text-[#358D83] text-sm md:text-base font-medium leading-relaxed mb-10 max-w-[340px] opacity-80">
                        We've saved your booking selection, but your current balance is insufficient. Top up now to secure your chosen slots before they're gone!
                    </p>

                    {/* Buttons - Stack on small screens */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                        <button
                            onClick={handleFundClick}
                            className="flex-1 w-full sm:flex-1 py-4 px-8 rounded-2xl bg-[#358D83] text-white font-black text-xs md:text-sm uppercase tracking-widest hover:bg-[#2b756d] transition-all shadow-xl shadow-[#358D83]/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {/* <Icon icon="ph:plus-circle-bold" className="w-5 h-5" /> */}
                            <span>Top Up Now</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="sm:flex-1 py-4 px-8 rounded-2xl border-2 border-[#E0F2F1] text-[#004D40] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-[#E0F2F1]/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <span>Later</span>
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
