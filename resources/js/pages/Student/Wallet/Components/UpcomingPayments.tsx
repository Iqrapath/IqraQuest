
import React from 'react';

export const UpcomingPayments: React.FC = () => {
    // Mock data based on Figma design
    const payments = [
        {
            id: 1,
            amountUsd: 30,
            amountNgn: 18000,
            teacher: 'Ustadh Abdullah',
            dueDate: '18th March 2025',
            status: 'Pending',
        }
    ];

    return (
        <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <h3 className="text-2xl font-medium text-gray-900 mb-8">Upcoming Payments Due</h3>

            <div className="space-y-4">
                {payments.map((payment) => (
                    <div key={payment.id} className="flex flex-col md:flex-row items-center justify-between p-2">
                        <div className="flex items-baseline space-x-2 mb-4 md:mb-0 w-full md:w-auto">
                            <span className="text-2xl font-medium text-gray-900">${payment.amountUsd}</span>
                            <span className="text-gray-400 text-lg">/ ₦{payment.amountNgn.toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-8 md:gap-16 w-full md:w-auto items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Teacher:</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{payment.teacher}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Due Date:</span>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{payment.dueDate}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Status:</span>
                                <span className="bg-[#FFF8E1] text-[#FFA000] text-xs font-medium px-4 py-1.5 rounded-full text-center inline-block w-fit">
                                    {payment.status}
                                </span>
                            </div>
                        </div>

                        <button className="mt-4 md:mt-0 bg-[#2D7A70] hover:bg-[#24635b] text-white text-sm font-medium py-2 px-8 rounded-full shadow-md shadow-[#2D7A70]/10 transition-all">
                            Pay Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
