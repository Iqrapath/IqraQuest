import React from 'react';
import axios from 'axios';
import { Link, usePage, router } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { useCurrency, CURRENCY_CONFIG, CurrencyCode } from '@/contexts/CurrencyContext';
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TopUpModal } from './TopUpModal';

interface WalletBalanceProps {
    balance: number;
    paystackPublicKey: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ balance, paystackPublicKey }) => {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const { currency, setCurrency, convert, formatAmount, loading, rates } = useCurrency();

    const [showTopUp, setShowTopUp] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [amount, setAmount] = React.useState('');
    const [error, setError] = React.useState('');

    // Real-time validation function
    const validateAmount = (val: string, currentCurrency: CurrencyCode = currency) => {
        if (!val) return '';

        const numVal = parseFloat(val);

        // Define minimums based on currency strength
        // Weak currencies (NGN, KES, etc) -> Higher numerical minimum
        // Strong currencies (USD, GHS, EUR, GBP) -> Lower numerical minimum
        const weakCurrencies = ['NGN', 'KES', 'RWF', 'XOF', 'XAF'];
        const isWeakCurrency = weakCurrencies.includes(currentCurrency);

        const minAmount = isWeakCurrency ? 100 : 1;

        if (isNaN(numVal) || numVal <= 0) {
            return 'Please enter a valid amount';
        }
        if (numVal < minAmount) {
            return `Minimum amount is ${CURRENCY_CONFIG[currentCurrency]?.symbol || ''}${minAmount}`;
        }
        return '';
    };

    const handleCurrencyChange = (value: CurrencyCode) => {
        // Convert existing input amount if present
        if (amount && !isNaN(parseFloat(amount))) {
            const converted = convert(parseFloat(amount), currency, value);
            // Format to 2 decimal places to avoid long floats
            const newAmount = converted.toFixed(2);
            setAmount(newAmount);

            // Re-validate with new values
            const validationMsg = validateAmount(newAmount, value);
            setError(validationMsg);
        } else {
            setError('');
        }

        // Only update display currency (no backend persistence)
        // The wallet's actual currency should not be changed via this dropdown
        setCurrency(value);
    };

    const handleTopUpClick = () => {
        const validationError = validateAmount(amount);
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }
        if (!amount) {
            setError('Please enter an amount');
            toast.error('Please enter an amount to top up');
            return;
        }

        setShowModal(true);
    };

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [paymentData, setPaymentData] = React.useState<{ accessCode: string; reference: string } | null>(null);

    const handleConfirmPayment = async (channel: string) => {
        setIsProcessing(true);
        try {
            const isPayPal = channel === 'paypal';
            const gateway = isPayPal ? 'paypal' : 'paystack';
            const numAmount = parseFloat(amount);

            // Get Paystack configured currency from props
            const paystackCurrency = auth.payment_gateways_currencies?.paystack || 'NGN';

            // Calculate amounts based on currency
            let backendAmount = numAmount;
            let usdAmount = numAmount;

            if (currency === 'USD') {
                usdAmount = numAmount;
                // Convert USD to Paystack Currency for Paystack Gateway
                backendAmount = convert(numAmount, 'USD', paystackCurrency);
            } else {
                // Input is in some local currency (e.g. NGN)
                // Convert to USD for PayPal
                usdAmount = convert(numAmount, currency, 'USD');

                // Convert to Paystack Currency
                backendAmount = convert(numAmount, currency, paystackCurrency);
            }

            const payload: any = {
                amount: backendAmount,
                currency: paystackCurrency, // Tell backend the currency of the amount we are sending
                gateway: gateway,
                channels: !isPayPal ? [channel] : undefined,
            };

            if (isPayPal) {
                // PayPal service specifically looks for usd_amount
                payload.usd_amount = usdAmount;
                // We send a rate for reference, e.g. base currency to USD rate
                payload.exchange_rate = rates[paystackCurrency] || 1;
            }

            const response = await axios.post('/student/payment/initialize', payload);

            const data = response.data;

            if (data.status === 'success') {
                if (isPayPal && data.approval_url) {
                    // Redirect to PayPal
                    window.location.href = data.approval_url;
                } else if (data.authorization_url) {
                    // Redirect to Paystack
                    window.location.href = data.authorization_url;
                } else {
                    throw new Error('Payment initialization failed - no redirect URL');
                }
            } else {
                throw new Error(data.message || 'Payment initialization failed');
            }
        } catch (err: any) {
            console.error('Payment Error:', err);
            const msg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
            setError(msg);
            toast.error(msg);
            setIsProcessing(false);
            setShowModal(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowModal(false);
        setPaymentData(null);
        setAmount('');
        toast.success('Payment successful! Your wallet will be credited shortly.');
        // Refresh the page to update balance
        window.location.reload();
    };

    const handlePaymentClose = () => {
        setIsProcessing(false);
        setPaymentData(null);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmount(val);
        // Validate immediately as user types
        const validationMsg = validateAmount(val);
        setError(validationMsg);
    };

    // Get the base currency from auth (same as header)
    const baseCurrency = (auth.wallet_currency || 'NGN') as CurrencyCode;
    // Convert from the actual wallet currency to the selected display currency
    const displayAmount = convert(balance, baseCurrency, currency);

    // Check if form is valid for button state
    const isValid = amount && !validateAmount(amount);

    return (
        <div className={`bg-white rounded-[30px] p-6 md:p-8 shadow-sm relative overflow-hidden transition-all duration-300 ${showTopUp ? 'min-h-[365px]' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
                    <span className="text-gray-700 font-medium text-lg">Preferred Currency</span>
                    <Select value={currency} onValueChange={handleCurrencyChange} disabled={loading}>
                        <SelectTrigger className="w-[100px] border-gray-200 text-gray-900 focus:ring-[#2D7A70] focus:border-[#2D7A70]">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                                <SelectItem key={code} value={code}>
                                    {code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Link href="/student/wallet/transactions" className="text-[#2D7A70] hover:underline text-sm font-medium hidden md:block">
                    Check Payment History
                </Link>
                {/* Mobile only link */}
                <Link href="/student/wallet/transactions" className="text-[#2D7A70] hover:underline text-sm font-medium md:hidden w-full text-center py-2 bg-gray-50 rounded-lg">
                    Check Payment History
                </Link>
            </div>

            {/* Statistics card */}
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="flex flex-col items-center justify-center mb-2 gap-3 pl-6 pr-4 py-2 rounded-[25px] bg-gradient-to-r from-transparent to-[#c0b7e8]/30 border border-white/20 min-w-[200px] w-full max-w-[280px] md:w-auto">
                    <span className="text-gray-500 text-sm">Wallet Balance</span>
                    {loading ? (
                        <span className="text-xl text-gray-400">Loading rates...</span>
                    ) : (
                        <span className="text-4xl font-bold text-gray-900 break-all text-center">
                            {formatAmount(displayAmount)}
                        </span>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 mt-4 w-full sm:w-auto px-4 sm:px-0">
                    <button
                        onClick={() => setShowTopUp(!showTopUp)}
                        className={`w-full sm:w-auto font-medium py-3 px-8 rounded-full shadow-lg transition-all ${showTopUp
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none'
                            : 'bg-[#2D7A70] hover:bg-[#24635b] text-white shadow-[#2D7A70]/20'
                            }`}
                    >
                        {showTopUp ? 'Cancel' : 'Top Up Balance'}
                    </button>
                    <button
                        disabled
                        className="w-full sm:w-auto py-3 sm:py-0 text-[#2D7A70] font-medium hover:text-[#24635b] transition-colors cursor-not-allowed opacity-50 text-center"
                        title="Withdrawals are currently disabled"
                    >
                        Withdraw Fund
                    </button>
                </div>
            </div>

            {/* Inline Top-Up Form */}
            {showTopUp && (
                <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 bg-gradient-to-b from-transparent to-[#E4FFFC] p-6 rounded-[25px]">
                        <div className="flex-1 w-full">
                            <label className="block text-gray-700 text-sm font-medium mb-3">
                                Please input the amount you wish to fund your wallet.
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-bold">
                                    {CURRENCY_CONFIG[currency].symbol}
                                </div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-[#2D7A70] focus:border-[#2D7A70] transition-colors text-gray-900 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 text-sm uppercase">
                                    Amount
                                </div>
                            </div>
                            {error ? (
                                <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
                            ) : (
                                <p className="mt-2 text-xs text-gray-400">
                                    Note: Minimum funding amount is {CURRENCY_CONFIG[currency].symbol}{currency === 'USD' ? '10' : '1,000'}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleTopUpClick}
                            disabled={!isValid}
                            className={`w-full md:w-auto font-medium py-3 px-10 rounded-xl shadow-lg transition-all flex items-center justify-center h-[50px] shrink-0 ${isValid
                                ? 'bg-[#2D7A70] hover:bg-[#24635b] text-white shadow-[#2D7A70]/20'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            )}

            <TopUpModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                amount={parseFloat(amount) || 0}
                currency={currency}
                onConfirm={handleConfirmPayment}
                isLoading={isProcessing}
                paymentData={paymentData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentClose={handlePaymentClose}
                paystackPublicKey={paystackPublicKey}
            />
        </div>
    );
};
