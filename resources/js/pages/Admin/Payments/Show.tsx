import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Payout } from '@/types';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import EditPaymentMethodModal from './Components/EditPaymentMethodModal';
import RejectPayoutModal from './Components/RejectPayoutModal';

interface TransactionLog {
    date: string;
    subject: string;
    type: string;
    amount: number;
}

interface Props {
    payout: Payout;
    walletBalance: number;
    totalEarnings: number;
    previousPayouts: number;
    sessionLogs: TransactionLog[];
}

export default function Show({ payout, walletBalance, totalEarnings, previousPayouts, sessionLogs }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve this withdrawal?')) {
            router.post(`/admin/payouts/${payout.id}/approve`, {}, {
                onSuccess: () => toast.success('Payout approved successfully'),
                onError: () => toast.error('Failed to approve payout')
            });
        }
    };

    const handleRejectConfirm = (reason: string) => {
        router.post(`/admin/payouts/${payout.id}/reject`, { reason }, {
            onSuccess: () => {
                toast.success('Payout rejected successfully');
                setIsRejectModalOpen(false);
            },
            onError: () => toast.error('Failed to reject payout')
        });
    };

    // Helper to format status display
    const formatStatus = (status: string) => {
        if (status === 'pending') return 'Pending Approval';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="font-[Nunito]">
            <Head title={`Withdrawal Request - ${payout.reference || 'Details'}`} />

            <div className="p-8 max-w-[1200px] mx-auto space-y-[32px]">
                {/* Header Section from Figma */}
                <div className="flex items-center gap-[14px]">
                    <span className="text-gray-500 text-[20px] font-light">Dashboard</span>
                    <div className="w-[8px] h-[8px] bg-[#D9D9D9] rounded-full" />
                    <Link href="/admin/payments" className="text-[#141522] text-[20px] font-semibold hover:text-[#338078]">
                        Payment and wallet System
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[16px] p-[32px] shadow-[0px_6px_24px_0px_rgba(75,112,245,0.08)] border border-gray-100/50">
                    <h1 className="text-[24px] font-semibold text-[#101928] mb-[35px]">Withdrawal Request – Detail View</h1>

                        {/* Left Column: Details */}
                        <div className="w-[450px] space-y-[24px] mb-10">
                            {/* Row 1 */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <span className="text-[#667085] font-semibold text-[16px]">Teacher:</span>
                                <span className="text-[#101928] font-normal text-[16px]">{payout.teacher?.user?.name || 'Unknown'}</span>
                            </div>
                            
                            {/* Row 2 */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <span className="text-[#667085] font-semibold text-[16px]">Email:</span>
                                <span className="text-[#667085] font-normal text-[16px]">{payout.teacher?.user?.email}</span>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <span className="text-[#667085] font-semibold text-[16px]">Request ID:</span>
                                <span className="text-[#667085] font-normal text-[16px]">WD-{String(payout.id).padStart(5, '0')}-APR25</span>
                            </div>

                            {/* Row 4 */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <span className="text-[#667085] font-semibold text-[16px]">Requested On:</span>
                                <span className="text-[#667085] font-normal text-[16px]">{new Date(payout.requested_at).toLocaleDateString()} - {new Date(payout.requested_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>

                            {/* Row 5 */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <span className="text-[#667085] font-semibold text-[16px]">Requested Amount:</span>
                                <span className="text-[#101928] font-semibold text-[16px]">₦{Number(payout.amount).toLocaleString()}</span>
                            </div>

                            {/* Row 6 */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <span className="text-[#667085] font-semibold text-[16px]">Status</span>
                                <span className={`px-4 py-1.5 rounded-[4px] text-[14px] font-medium w-fit capitalize ${
                                    payout.status === 'pending' ? 'bg-[#FFF9C4] text-[#F9A825]' : 
                                    payout.status === 'approved' || payout.status === 'completed' || payout.status === 'processing' ? 'bg-[#E6F4EA] text-[#1E8E3E]' : 
                                    payout.status === 'rejected' ? 'bg-[#FCE8E6] text-[#D93025]' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {formatStatus(payout.status)}
                                </span>
                            </div>
                        </div>
                    <div className="flex gap-[48px] items-start">

                        {/* Right Column: Payment Method Card */}
                        <div className="flex-1 bg-white rounded-[16px] border border-[#EAECF0] p-[24px] relative">
                            <div className="mb-6">
                                <p className="text-[#344054] text-[14px] font-medium mb-3">Payment Method:</p>
                                <div className="border-l-[3px] border-[#338078] pl-4 py-1">
                                    <p className="text-[#667085] text-[16px]">
                                        {payout.payment_method?.payment_type === 'bank_transfer'
                                            ? `Bank Transfer – ${payout.payment_method?.bank_name}, A/C: ${payout.payment_method?.account_number} (${payout.payment_method?.account_name})`
                                            : `PayPal – ${payout.payment_method?.email}`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Inner Wallet Stats Card */}
                            <div className="bg-white rounded-[12px] border border-[#EAECF0] p-[24px] shadow-sm">
                                <p className="text-[#101928] text-[14px] font-medium mb-[16px]">Wallet Balance at Time of Request</p>
                                
                                <div className="flex gap-[12px]">
                                    {/* Balance */}
                                    <div className="bg-[#E3F2FD] rounded-[8px] p-[16px] flex-1 min-w-[140px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center">
                                                 <Icon icon="solar:wallet-money-bold-duotone" className="text-[#2196F3] w-4 h-4" />
                                            </div>
                                            <span className="text-[#101928] font-bold text-[18px]">₦{walletBalance.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[#667085] text-[12px]">Wallet Balance</p>
                                    </div>

                                    {/* Total Earnings */}
                                    <div className="bg-[#E0F7FA] rounded-[8px] p-[16px] flex-1 min-w-[140px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center">
                                                <Icon icon="solar:hand-money-bold-duotone" className="text-[#00BCD4] w-4 h-4" />
                                            </div>
                                            <span className="text-[#101928] font-bold text-[18px]">₦{totalEarnings.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[#667085] text-[12px]">Total Earnings</p>
                                    </div>

                                    {/* Previous Payouts */}
                                    <div className="bg-[#FFFDE7] rounded-[8px] p-[16px] flex-1 min-w-[140px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center">
                                                <Icon icon="solar:history-bold-duotone" className="text-[#FBC02D] w-4 h-4" />
                                            </div>
                                            <span className="text-[#101928] font-bold text-[18px]">₦{previousPayouts.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[#667085] text-[12px]">Previous Payouts</p>
                                    </div>
                                </div>

                                <div className="text-right mt-4">
                                    <Link href="#" className="text-[#338078] text-[12px] font-medium hover:underline">
                                        View Teacher Earnings
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Session Logs Section */}
                    <div className="mt-[48px]">
                        <h2 className="text-[20px] font-semibold text-[#101928] mb-[24px]">Session Logs (Earning Source):</h2>

                        <div className="bg-[#F9FAFB] rounded-[8px] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#F2F4F7] border-b border-[#EAECF0]">
                                    <tr>
                                        <th className="p-4 w-12 pl-6">
                                            <div className="w-4 h-4 border border-gray-300 rounded bg-white"></div>
                                        </th>
                                        <th className="py-3 px-4 text-[#475467] font-medium text-[12px]">Date & Time</th>
                                        <th className="py-3 px-4 text-[#475467] font-medium text-[12px]">Subject</th>
                                        <th className="py-3 px-4 text-[#475467] font-medium text-[12px]">Session Type</th>
                                        <th className="py-3 px-4 text-[#475467] font-medium text-[12px] text-right pr-6">Amount Earned</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EAECF0]">
                                    {sessionLogs.length > 0 ? (
                                        sessionLogs.map((log, index) => (
                                            <tr key={index}>
                                                <td className="p-4 pl-6">
                                                     <div className="w-4 h-4 border border-gray-300 rounded bg-white"></div>
                                                </td>
                                                <td className="py-4 px-4 text-[#101928] text-[14px]">{log.date}</td>
                                                <td className="py-4 px-4 text-[#101928] font-medium text-[14px]">{log.subject}</td>
                                                <td className="py-4 px-4 text-[#667085] text-[14px]">{log.type}</td>
                                                <td className="py-4 px-4 text-[#101928] font-bold text-[14px] text-right pr-6">₦{Number(log.amount).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No recent earning logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    {payout.status === 'pending' && (
                        <div className="mt-[48px] flex items-center justify-center gap-[32px]">
                            <button
                                onClick={handleApprove}
                                className="bg-[#338078] hover:bg-[#2A6B64] text-white px-8 py-3 rounded-[30px] font-medium text-[16px] shadow-lg transition-all"
                            >
                                Approve Withdrawal
                            </button>

                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-[#338078] font-medium text-[16px] hover:underline"
                            >
                                Edit Payment Method
                            </button>

                            <button
                                onClick={() => setIsRejectModalOpen(true)}
                                className="text-[#FF3B30] font-medium text-[16px] hover:underline"
                            >
                                Reject & Enter Reason
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <EditPaymentMethodModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                payout={payout}
            />

            <RejectPayoutModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                payout={payout}
                onConfirm={handleRejectConfirm}
            />
        </div>
    );
}

Show.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
