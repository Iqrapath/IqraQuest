import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TeacherProfileHeader from '@/components/Teachers/TeacherProfileHeader';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Transaction {
    id: number;
    description: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
}

interface Payout {
    id: number;
    requested_at: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
    payment_method?: {
        payment_type: string;
        provider_name?: string;
    };
}

interface Props {
    teacher: any;
    earnings: {
        wallet_balance: number;
        total_earned: number;
        pending_payouts: number;
        currency: string;
    };
    transactions: {
        data: Transaction[];
    };
    payouts: {
        data: Payout[];
    };
}

const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string, text: string }> = {
        completed: { bg: 'bg-[#E7F9F3]', text: 'text-[#00A991]' },
        pending: { bg: 'bg-[#FFF9EA]', text: 'text-[#FFCC00]' },
        failed: { bg: 'bg-[#FFF2F2]', text: 'text-[#FF3B30]' },
        approved: { bg: 'bg-[#E7F9F3]', text: 'text-[#00A991]' },
        rejected: { bg: 'bg-[#FFF2F2]', text: 'text-[#FF3B30]' },
        processing: { bg: 'bg-[#F0F7FF]', text: 'text-[#0061FF]' },
    };

    const config = configs[status.toLowerCase()] || configs.pending;

    return (
        <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold capitalize font-['Nunito']`}>
            {status}
        </span>
    );
};

export default function Earnings({ teacher, earnings, transactions, payouts }: Props) {
    const handleApprovePayout = (id: number) => {
        if (confirm('Are you sure you want to approve this payout request?')) {
            router.post(`/admin/payouts/${id}/approve`, {}, {
                onSuccess: () => toast.success('Payout approved successfully'),
                onError: () => toast.error('Failed to approve payout'),
            });
        }
    };

    const handleDeclinePayout = (id: number) => {
        const reason = prompt('Please provide a reason for rejection (min 10 characters):');
        if (reason) {
            if (reason.length < 10) {
                toast.error('Rejection reason must be at least 10 characters');
                return;
            }
            router.post(`/admin/payouts/${id}/reject`, { reason }, {
                onSuccess: () => toast.success('Payout rejected'),
                onError: () => toast.error('Failed to reject payout'),
            });
        }
    };

    return (
        <>
            <Head title={`Earnings - ${teacher.user.name}`} />

            <div className="w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3.5 mb-8">
                    <Link
                        href="/admin/teachers"
                        className="text-gray-500 font-light font-['Nunito'] hover:text-gray-700 transition-colors"
                        style={{ fontSize: '14px' }}
                    >
                        Dashboard
                    </Link>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mx-1" />
                    <span className="text-[#141522] font-semibold font-['Nunito']" style={{ fontSize: '14px' }}>
                        Teacher Profile
                    </span>
                </div>

                {/* Profile Header & Earnings Summary Section */}
                <TeacherProfileHeader
                    teacher={teacher}
                    earnings={earnings}
                    isEarningsPage={true}
                />

                {/* Transaction Log */}
                <div className="mb-12 font-['Poppins']">
                    <h2 className="text-xl font-bold text-[#141522] mb-6">Transaction Log:</h2>
                    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden font-['Nunito']">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F9FB]">
                                    <tr className="text-left">
                                        <th className="px-6 py-4 w-12"><Checkbox className="rounded-sm" /></th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((transaction) => (
                                        <tr key={transaction.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4"><Checkbox className="rounded-sm" /></td>
                                            <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                                                {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {transaction.description}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                                                {earnings.currency}{Number(transaction.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={transaction.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="text-gray-400 h-8 w-8">
                                                    <Icon icon="solar:menu-dots-bold" className="w-5 h-5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No transactions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payout Requests */}
                <div className="mb-12 font-['Poppins']">
                    <h2 className="text-xl font-bold text-[#141522] mb-6">Payout Requests</h2>
                    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden font-['Nunito']">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F9FB]">
                                    <tr className="text-left">
                                        <th className="px-6 py-4 w-12"><Checkbox className="rounded-sm" /></th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Request Date</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Payment Method</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.data.map((payout) => (
                                        <tr key={payout.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4"><Checkbox className="rounded-sm" /></td>
                                            <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                                                {new Date(payout.requested_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                                                {earnings.currency}{Number(payout.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {payout.payment_method?.payment_type === 'bank_transfer' ? 'Bank Transfer (GTB)' : (payout.payment_method?.payment_type === 'paypal' ? 'PayPal' : 'Mobile Money')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={payout.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-gray-400 h-8 w-8">
                                                            <Icon icon="solar:menu-dots-bold" className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[220px] rounded-2xl p-2 shadow-2xl border border-gray-100 bg-white z-[100]">
                                                        <DropdownMenuItem
                                                            disabled={payout.status !== 'pending'}
                                                            onClick={() => handleApprovePayout(payout.id)}
                                                            className="flex items-center justify-between p-3.5 rounded-xl text-[#00A991] font-bold cursor-pointer hover:bg-[#E7F9F3] transition-colors outline-none"
                                                        >
                                                            Approve Request
                                                            <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-[#00A991]" />
                                                        </DropdownMenuItem>
                                                        <div className="h-px bg-gray-50 my-1" />
                                                        <DropdownMenuItem
                                                            disabled={payout.status !== 'pending'}
                                                            onClick={() => handleDeclinePayout(payout.id)}
                                                            className="flex items-center justify-between p-3.5 rounded-xl text-[#FF3B30] font-bold cursor-pointer hover:bg-[#FFF2F2] transition-colors outline-none"
                                                        >
                                                            Decline Request
                                                            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-[#FF3B30]" />
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                    {payouts.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No payout requests found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Earnings.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
