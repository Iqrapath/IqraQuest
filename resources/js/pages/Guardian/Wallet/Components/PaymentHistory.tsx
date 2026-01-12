
import React, { useState } from 'react';
import { FileText } from 'lucide-react'; // Using Lucide icon for the PDF report icon
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Transaction {
    id: number;
    amount: number;
    status: string;
    created_at: string;
    description: string;
    type: string;
    booking_details?: {
        subject: string;
        teacher_name: string;
    };
}

interface PaymentHistoryProps {
    transactions: {
        data: Transaction[];
    };
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ transactions }) => {
    const [isEmailing, setIsEmailing] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'long' })
        };
    };

    const getDetails = (transaction: Transaction) => {
        if (transaction.booking_details) {
            return {
                subject: transaction.booking_details.subject,
                name: transaction.booking_details.teacher_name
            };
        }

        // Fallback parsing from description if needed, or generic
        return {
            subject: transaction.type === 'credit' ? 'Wallet Top-up' : 'Transaction',
            name: transaction.description || '-'
        };
    };

    const handleEmailReport = () => {
        setIsEmailing(true);
        // @ts-ignore
        router.post('/guardian/payment/transactions/email-report', {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Report sent to your email');
                setIsEmailing(false);
            },
            onError: () => {
                toast.error('Failed to send report. Please try again.');
                setIsEmailing(false);
            }
        });
    };

    if (transactions.data.length === 0) {
        return (
            <div className="bg-white rounded-[30px] p-8 shadow-sm">
                <h3 className="text-2xl font-medium text-gray-900 mb-8">Payment History</h3>
                <div className="text-center py-8 text-gray-400 font-light">
                    No payment history yet.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-medium text-gray-900">Payment History</h3>
                <button
                    onClick={handleEmailReport}
                    disabled={isEmailing}
                    className="flex items-center text-[#2D7A70] hover:text-[#24635b] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                    {/* Red icon in design looks like a PDF/File icon */}
                    <FileText className="w-5 h-5 text-[#FF5252] mr-2" />
                    <span className="text-[#2D7A70]">{isEmailing ? 'Sending...' : 'Email Activity report'}</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-4 px-4 text-gray-400 font-normal text-sm">Date</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-normal text-sm">Subject</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-normal text-sm">Name</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-normal text-sm">Amount</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-normal text-sm">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.data.map((tx) => {
                            const { day, month } = formatDate(tx.created_at);
                            const { subject, name } = getDetails(tx);
                            const isCompleted = tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'success';

                            return (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-6 px-4">
                                        <div className="text-gray-900">
                                            <span className="text-xl font-medium">{day}</span>
                                            <span className="text-gray-300 mx-2">|</span>
                                            <span className="text-sm font-medium text-gray-500">{month}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-gray-700 font-medium text-sm">{subject}</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-gray-900 font-medium text-sm">{name}</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-gray-700 font-medium text-sm">#{Number(tx.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium ${isCompleted
                                            ? 'bg-[#E0F7FA] text-[#006064]' // Cyan-ish for Completed aligned with design
                                            : 'bg-[#FFF8E1] text-[#FFA000]'  // Yellow for Pending
                                            }`}>
                                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
