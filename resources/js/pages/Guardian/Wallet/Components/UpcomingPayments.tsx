import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface UpcomingPaymentsProps {
    payments?: any[];
}

declare const route: any;

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ payments = [] }) => {
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    const handlePayNow = (bookingId: number) => {
        setIsProcessing(bookingId);
        // Using guardian payment route as defined in routes/guardian.php
        router.post(`/guardian/bookings/${bookingId}/pay-now`, {}, {
            onSuccess: () => {
                toast.success('Payment successful!');
                setIsProcessing(null);
            },
            onError: (errors: any) => {
                toast.error(errors.error || 'Payment failed. Please try again.');
                setIsProcessing(null);
            },
            onFinish: () => {
                setIsProcessing(null);
            }
        });
    };

    if (payments.length === 0) {
        return (
            <div className="bg-white rounded-[30px] p-8 shadow-sm">
                <h3 className="text-2xl font-medium text-gray-900 mb-8">Upcoming Payments Due</h3>
                <div className="text-center py-8 text-gray-400 font-light">
                    No upcoming payments due.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <h3 className="text-2xl font-medium text-gray-900 mb-8">Upcoming Payments Due</h3>

            <div className="space-y-4">
                {payments.map((payment) => (
                    <div key={payment.id} className="flex flex-col md:flex-row items-center justify-between p-2 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-baseline space-x-2 mb-4 md:mb-0 w-full md:w-auto">
                            <span className="text-2xl font-medium text-gray-900">${payment.total_price}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-8 md:gap-16 w-full md:w-auto items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Teacher:</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{payment.teacher?.name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Date:</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{payment.formatted_date}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Status:</span>
                                <span className="bg-[#FFF8E1] text-[#FFA000] text-xs font-medium px-4 py-1.5 rounded-full text-center inline-block w-fit">
                                    Awaiting Payment
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePayNow(payment.id)}
                            disabled={isProcessing === payment.id}
                            className="mt-4 md:mt-0 bg-[#2D7A70] hover:bg-[#24635b] disabled:bg-gray-300 text-white text-sm font-medium py-2 px-8 rounded-full shadow-md shadow-[#2D7A70]/10 transition-all"
                        >
                            {isProcessing === payment.id ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
