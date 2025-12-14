import React from 'react';
import { Icon } from '@iconify/react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Step3Props {
    teacher: any;
    selectedDuration: number; // in minutes
    currency: string; // "USD" | "NGN"
    paymentMethod: string;
    // New Props for Recurrence
    isRecurring: boolean;
    occurrences: number;
    // Handlers
    onCurrencyChange: (currency: string) => void;
    onPaymentMethodChange: (method: string) => void;
    onBack: () => void;
    onProceed: () => void;
}

export default function Step3Payment({
    teacher,
    selectedDuration,
    currency,
    paymentMethod,
    isRecurring,
    occurrences,
    onCurrencyChange,
    onPaymentMethodChange,
    onBack,
    onProceed
}: Step3Props) {
    const { convert } = useCurrency();

    // Calculate Rate per Session
    // Assumption: Teacher hourly_rate is in NGN (Backend/Seeder default)
    const hourlyRate = teacher.hourly_rate || 0;

    // Per Session Cost (NGN)
    const sessionCostNGN = (hourlyRate / 60) * selectedDuration;

    // Per Session Cost (USD) using Currency Context
    const sessionCostUSD = convert(sessionCostNGN, 'NGN', 'USD');

    // Calculate Total Cost
    const totalSessions = isRecurring ? occurrences : 1;
    const totalCostUSD = sessionCostUSD * totalSessions;
    const totalCostNGN = sessionCostNGN * totalSessions;

    return (
        <div className="">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-primary">Pricing & Payment</h1>

            {/* Session Rate Banner */}
            <div className="bg-[#E0F2F1] rounded-2xl p-6 mb-10 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <span className="text-xl font-medium text-gray-800">
                        {isRecurring ? 'Session Rate:' : 'Total Cost:'}
                    </span>
                    {isRecurring && (
                        <span className="bg-[#358D83] text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                            {occurrences} Sessions
                        </span>
                    )}
                </div>

                <div className="text-2xl font-bold text-[#00695C]">
                    <span className={currency === 'USD' ? 'text-black' : 'text-gray-500'}>${sessionCostUSD.toFixed(0)}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className={currency === 'NGN' ? 'text-black' : 'text-gray-500'}>₦{sessionCostNGN.toLocaleString()}</span>
                    <span className="text-base font-normal text-gray-600 ml-2">per session</span>
                </div>

                {/* Recurring Total Breakdown */}
                {isRecurring && (
                    <div className="mt-4 pt-4 border-t border-[#B2DFDB]">
                        <p className="text-sm text-gray-600 mb-1">Total for {occurrences} weeks:</p>
                        <div className="text-3xl font-extrabold text-[#004D40]">
                            {currency === 'USD'
                                ? `$${totalCostUSD.toFixed(0)}`
                                : `₦${totalCostNGN.toLocaleString()}`
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Currency Selection */}
            <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Choose your currency</h3>
                <div className="flex gap-6">
                    {['USD', 'NGN'].map((curr) => (
                        <label key={curr} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center transition-all
                                ${currency === curr
                                    ? 'bg-[#358D83] border-[#358D83]'
                                    : 'bg-white border-gray-300 group-hover:border-gray-400'}
                            `}>
                                {currency === curr && <Icon icon="mdi:check" className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input
                                type="radio"
                                name="currency"
                                value={curr}
                                checked={currency === curr}
                                onChange={() => onCurrencyChange(curr)}
                                className="hidden"
                            />
                            <span className={`font-medium ${currency === curr ? 'text-gray-900' : 'text-gray-600'}`}>
                                {curr}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Methods:</h3>
                <div className="space-y-6">
                    {[
                        { id: 'wallet', label: 'My Wallet' },
                        { id: 'paypal', label: 'PayPal' },
                        { id: 'card', label: 'Credit/Debit Card' },
                        { id: 'bank', label: 'Bank Transfer' }
                    ].map((method) => (
                        <label key={method.id} className="flex items-center gap-4 cursor-pointer group">
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center transition-all
                                ${paymentMethod === method.id
                                    ? 'bg-[#358D83] border-[#358D83]'
                                    : 'bg-white border-gray-300 group-hover:border-gray-400'}
                            `}>
                                {paymentMethod === method.id && <Icon icon="mdi:check" className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <input
                                type="radio"
                                name="payment_method"
                                value={method.id}
                                checked={paymentMethod === method.id}
                                onChange={() => onPaymentMethodChange(method.id)}
                                className="hidden"
                            />
                            <span className={`text-lg transition-colors ${paymentMethod === method.id ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                {method.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 mt-8">
                <button
                    onClick={onBack}
                    className="px-8 py-3 rounded-full border border-[#358D83] text-[#358D83] font-bold text-lg hover:bg-teal-50 transition-colors"
                >
                    Go Back
                </button>
                <div className="flex-1"></div>
                <button
                    onClick={onProceed}
                    disabled={!paymentMethod || !currency}
                    className={`
                        px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all
                        ${paymentMethod && currency
                            ? 'bg-[#358D83] text-white hover:bg-[#2b756d]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    Proceed To Payment
                </button>
            </div>
        </div>
    );
}
