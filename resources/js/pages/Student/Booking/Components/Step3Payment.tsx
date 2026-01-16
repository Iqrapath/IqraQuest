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
    slotsCount: number; // Added for math breakdown
    sessionCount: number; // Added
    totalCost: { usd: number, ngn: number }; // Added
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
    slotsCount,
    sessionCount,
    totalCost,
    onCurrencyChange,
    onPaymentMethodChange,
    onBack,
    onProceed
}: Step3Props) {
    const { convert } = useCurrency();

    // Per Session Cost (NGN)
    const sessionCostNGN = (teacher.hourly_rate / 60) * selectedDuration;
    const sessionCostUSD = convert(sessionCostNGN, 'NGN', 'USD');

    return (
        <div className="max-w-4xl px-4 sm:px-6 lg:px-8 py-0 pb-32">
            {/* Redesigned Header: Premium Teacher Profile Card */}
            <div className="bg-white rounded-[clamp(1.5rem,3vw,1.5rem)] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative p-1 bg-gradient-to-br from-[#358D83] to-teal-100 rounded-2xl">
                            <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-gray-50">
                                <img
                                    src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                                    alt={teacher.user.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <div className="space-y-1">
                            <h1 className="font-['Poppins'] font-bold text-xl text-gray-900 leading-tight">
                                {teacher.user.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-500 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="ph:timer-bold" className="w-4 h-4 text-[#358D83]" />
                                    <span className="font-medium">{selectedDuration} Min Duration</span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-gray-300" />
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="ph:calendar-bold" className="w-4 h-4 text-[#358D83]" />
                                    <span className="font-medium">{isRecurring ? `${occurrences} Weekly Lessons` : 'Single Lesson'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-50 text-[#358D83] rounded-full border border-teal-100 self-center">
                        <Icon icon="ph:shield-check-fill" className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Secure Booking</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-12 space-y-8">
                    {/* Order Summary Card - Reverted to Original Color Palette */}
                    <div className="bg-[#E0F2F1] rounded-[2rem] p-8 text-[#004D40] border border-[#B2DFDB] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Icon icon="ph:receipt-bold" className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-[#338078] opacity-80">Order Summary</h3>
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#358D83] rounded-lg text-xs font-bold text-white shadow-sm">
                                    <Icon icon="ph:sparkles-fill" />
                                    Best Rate Guaranteed
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-4 border-b border-[#B2DFDB]">
                                    <div className="space-y-0.5">
                                        <p className="text-[#338078] text-[10px] font-black uppercase tracking-widest">Base Rate</p>
                                        <p className="text-sm font-bold text-gray-800">Lesson Intensity ({selectedDuration}min)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-[#00695C]">
                                            {currency === 'USD' ? `$${sessionCostUSD.toFixed(2)}` : `₦${sessionCostNGN.toLocaleString()}`}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">per session</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1">
                                    <div className="space-y-0.5">
                                        <p className="text-gray-500 text-sm font-bold">Number of Sessions</p>
                                        {isRecurring && (
                                            <p className="text-[10px] font-bold text-[#358D83] uppercase tracking-tight">
                                                {slotsCount} Slots × {occurrences} Weekly Occurrences
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm font-black text-gray-900">x {sessionCount}</p>
                                </div>

                                <div className="pt-6 mt-6 border-t-2 border-dashed border-[#B2DFDB] flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[#358D83] text-[10px] font-black uppercase tracking-[0.3em]">Net Investment</p>
                                        <p className="text-4xl font-black text-[#004D40] tracking-tight">
                                            {currency === 'USD' ? '$' : '₦'}{(currency === 'USD' ? totalCost.usd : totalCost.ngn).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right pb-1">
                                        <p className="hidden md:block text-[10px] font-bold text-[#358D83]/60 uppercase flex items-center gap-1.5 justify-end mb-1">
                                            <Icon icon="ph:info-fill" className="text-[#358D83]" />
                                            Inclusive of all fees
                                        </p>
                                        <p className="text-[10px] font-black text-[#358D83]/30 uppercase tracking-widest italic">
                                            EST. EQUIVALENT: {currency === 'USD' ? `₦${totalCost.ngn.toLocaleString()}` : `$${totalCost.usd.toFixed(2)}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Currency Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest px-2">Preferred Currency</h4>
                            <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                                {['USD', 'NGN'].map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => onCurrencyChange(curr)}
                                        className={`
                                            flex-1 py-3 px-6 rounded-xl font-black text-xs transition-all duration-500
                                            ${currency === curr
                                                ? 'bg-white text-[#358D83] shadow-md scale-[1.02]'
                                                : 'text-gray-400 hover:text-gray-600'}
                                        `}
                                    >
                                        {curr === 'USD' ? 'US DOLLARS ($)' : 'NIARA (₦)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest px-2">Payment Source</h4>
                            <div className="space-y-3">
                                {[
                                    { id: 'wallet', label: 'Student Wallet', icon: 'ph:wallet-bold', sub: 'Instant & Secure' },
                                    // { id: 'card', label: 'Credit Card', icon: 'ph:credit-card-bold', sub: 'Paystack / Flutterwave' }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => onPaymentMethodChange(method.id)}
                                        className={`
                                            w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300
                                            ${paymentMethod === method.id
                                                ? 'bg-white border-[#358D83] shadow-lg ring-4 ring-[#358D83]/5'
                                                : 'bg-white border-gray-100 hover:border-[#358D83]/30'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl transition-colors ${paymentMethod === method.id ? 'bg-[#358D83] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                <Icon icon={method.icon} className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-sm font-black ${paymentMethod === method.id ? 'text-gray-900' : 'text-gray-600'}`}>{method.label}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{method.sub}</p>
                                            </div>
                                        </div>
                                        {paymentMethod === method.id && (
                                            <Icon icon="ph:check-circle-fill" className="w-6 h-6 text-[#358D83] animate-in zoom-in-50" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="mt-12 p-6 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Icon icon="ph:lock-keyhole-bold" className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 space-y-1">
                    <h5 className="font-black text-gray-900 text-sm">Encrypted Transaction Security</h5>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Your payment is protected by industry-standard SSL encryption. Funds are held in escrow and only released to the teacher after successful session completion.</p>
                </div>
                <div className="flex items-center gap-4 opacity-30 grayscale">
                    <Icon icon="logos:paystack-icon" className="h-6" />
                    <Icon icon="logos:flutterwave-icon" className="h-4" />
                </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-12 mt-12 border-t border-gray-50">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-black text-sm hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                    <Icon icon="ph:arrow-left-bold" className="w-4 h-4" />
                    <span>Back to Details</span>
                </button>

                <button
                    onClick={onProceed}
                    disabled={!paymentMethod || !currency}
                    className={`
                        w-full sm:w-auto overflow-hidden relative group px-12 py-4 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                        ${(paymentMethod && currency)
                            ? 'bg-[#358D83] text-white hover:bg-[#2b756d] shadow-[#358D83]/20'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}
                    `}
                >
                    <span className="relative z-10">Confirm & Pay Securely</span>
                    <Icon icon="ph:lightning-fill" className="w-4 h-4 relative z-10 transition-transform group-hover:scale-125" />

                    {paymentMethod && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                </button>
            </div>
        </div>
    );
}
