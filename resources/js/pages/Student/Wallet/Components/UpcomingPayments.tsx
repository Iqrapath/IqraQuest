import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

interface UpcomingPaymentsProps {
    payments?: any[];
}

declare const route: any;

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ payments = [] }) => {
    const [isProcessing, setIsProcessing] = useState<number | string | null>(null);

    // Grouping Logic
    // Smarter Grouping: Merge Parent and Children into one card
    const groupedPayments = React.useMemo(() => {
        const groups: Record<string, any[]> = {};

        payments.forEach(p => {
            // Grouping Strategy:
            // Use Teacher + Subject + Time as the primary key. 
            // This naturally groups a parent and its weekly children because they share these properties.
            // We include the per-session price to ensure differently priced sessions don't mix.
            const groupKey = `${p.teacher?.id}-${p.subject?.id}-${p.total_price}-${p.formatted_time}`;

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(p);
        });

        return Object.values(groups);
    }, [payments]);

    const handlePayNow = (bookingId: number) => {
        setIsProcessing(bookingId);
        router.post(`/student/bookings/${bookingId}/pay-now`, {}, {
            onSuccess: () => {
                toast.success('Payment successful!');
                setIsProcessing(null);
            },
            onError: (errors: any) => {
                toast.error(errors.error || 'Payment failed. Please try again.');
                setIsProcessing(null);
            },
            onFinish: () => setIsProcessing(null)
        });
    };

    const handlePaySeries = (bookingIds: number[], seriesId: string) => {
        setIsProcessing(seriesId);
        router.post('/student/bookings/bulk-pay', { booking_ids: bookingIds }, {
            onSuccess: () => {
                toast.success('Series payment successful!');
                setIsProcessing(null);
            },
            onError: (errors: any) => {
                toast.error(errors.error || 'Payment failed. Please try again.');
                setIsProcessing(null);
            },
            onFinish: () => setIsProcessing(null)
        });
    };

    if (payments.length === 0) {
        return (
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-[#004D40] mb-8 tracking-tight">Upcoming Payments</h3>
                <div className="text-center py-12 bg-gray-50/50 rounded-[30px] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <Icon icon="ph:receipt-bold" className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium tracking-wide">No upcoming payments due.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-[#004D40] tracking-tight">Upcoming Payments</h3>
                <span className="bg-[#E0F2F1] text-[#004D40] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {payments.length} Sessions Pending
                </span>
            </div>

            <div className="space-y-6">
                {groupedPayments.map((group, idx) => {
                    const isSeries = group.length > 1;
                    const representative = group[0];
                    const totalPrice = group.reduce((sum, p) => sum + parseFloat(p.total_price), 0);
                    const bookingIds = group.map(p => p.id);
                    const groupId = isSeries ? `series-${representative.parent_booking_id || representative.id}` : representative.id;

                    return (
                        <div key={idx} className={`relative group p-6 rounded-[30px] transition-all border ${isSeries ? 'bg-[#F8FEFD] border-[#B2DFDB]/30 shadow-sm shadow-[#004D40]/5' : 'bg-white border-gray-100 hover:border-[#B2DFDB]/50'}`}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                {/* Left: Price & Teacher */}
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isSeries ? 'bg-[#004D40] text-white' : 'bg-[#F1F5F9] text-gray-400'}`}>
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{representative.currency}</span>
                                        <span className="text-xl font-black leading-none">{totalPrice.toFixed(0)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-black text-[#004D40] tracking-tight truncate max-w-[150px]">
                                                {representative.teacher?.name}
                                            </span>
                                            {isSeries && (
                                                <span className="bg-[#004D40]/10 text-[#004D40] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    Series
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-[#358D83] uppercase tracking-widest opacity-60">
                                            {representative.subject?.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Center: Details */}
                                <div className="flex flex-wrap items-center gap-8 w-full md:w-auto md:flex-1 md:px-8 border-t border-gray-50 md:border-t-0 pt-4 md:pt-0">
                                    <div className="flex flex-col min-w-[100px]">
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Icon icon="ph:calendar-bold" className="w-3 h-3" />
                                            {isSeries ? 'Schedule' : 'Date'}
                                        </span>
                                        <span className="text-sm font-black text-[#004D40] whitespace-nowrap">
                                            {isSeries ? `${group.length} Weekly Sessions` : representative.formatted_date}
                                        </span>
                                    </div>
                                    {!isSeries && (
                                        <div className="flex flex-col min-w-[100px]">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Icon icon="ph:clock-bold" className="w-3 h-3" />
                                                Time
                                            </span>
                                            <span className="text-sm font-black text-[#004D40] whitespace-nowrap">
                                                {representative.formatted_time}
                                            </span>
                                        </div>
                                    )}
                                    {isSeries && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Icon icon="ph:info-bold" className="w-3 h-3" />
                                                First Lesson
                                            </span>
                                            <span className="text-sm font-black text-[#004D40]">
                                                {representative.formatted_date}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Action */}
                                <div className="w-full md:w-auto">
                                    {isSeries ? (
                                        <button
                                            onClick={() => handlePaySeries(bookingIds, String(groupId))}
                                            disabled={isProcessing === groupId}
                                            className="w-full md:w-auto bg-[#004D40] hover:bg-[#002820] disabled:bg-gray-200 text-white text-xs font-black py-4 px-8 rounded-2xl shadow-xl shadow-[#004D40]/10 transition-all uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            {isProcessing === groupId ? (
                                                <Icon icon="line-md:loading-twotone-loop" className="w-5 h-5" />
                                            ) : (
                                                <Icon icon="ph:credit-card-bold" className="w-5 h-5" />
                                            )}
                                            <span>Pay Series</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePayNow(representative.id)}
                                            disabled={isProcessing === representative.id}
                                            className="w-full md:w-auto bg-[#358D83]/10 hover:bg-[#358D83] text-[#358D83] hover:text-white disabled:bg-gray-50 disabled:text-gray-300 text-xs font-black py-4 px-8 rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 border border-[#358D83]/20 hover:border-transparent"
                                        >
                                            {isProcessing === representative.id ? (
                                                <Icon icon="line-md:loading-twotone-loop" className="w-5 h-5" />
                                            ) : (
                                                <Icon icon="ph:wallet-bold" className="w-5 h-5" />
                                            )}
                                            <span>Pay Now</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Series Breakdown (Subtle Tooltip/List) */}
                            {isSeries && (
                                <div className="mt-4 pt-4 border-t border-[#B2DFDB]/20 flex flex-wrap gap-2">
                                    {group.slice(0, 4).map((p, i) => (
                                        <div key={p.id} className="text-[10px] font-bold text-[#358D83] bg-white border border-[#B2DFDB]/50 px-3 py-1 rounded-lg">
                                            Session {i + 1}: {p.formatted_date}
                                        </div>
                                    ))}
                                    {group.length > 4 && (
                                        <div className="text-[10px] font-bold text-gray-400 px-2 py-1 italic">
                                            + {group.length - 4} more sessions
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

