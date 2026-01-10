import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Payout } from '@/types'; // Assuming types exist, or we define locally
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ApprovePayoutModal from './ApprovePayoutModal';
import RejectPayoutModal from './RejectPayoutModal';
import EditPaymentMethodModal from './EditPaymentMethodModal';
import SendPayoutNotificationModal from './SendPayoutNotificationModal';
import { toast } from 'sonner';

interface Props {
    payouts: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: any;
}



export default function TeacherPayoutsTab({ payouts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const [dateRange, setDateRange] = useState(filters.date_range || 'all');

    const handleSearch = () => {
        router.get('/admin/payments', {
            tab: 'teacher-payouts',
            search,
            status: status !== 'all' ? status : undefined,
            payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
            date_range: dateRange !== 'all' ? dateRange : undefined,
        }, { preserveState: true });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/admin/payments', {
            tab: 'teacher-payouts',
            search,
            status: newStatus !== 'all' ? newStatus : undefined,
            payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
            date_range: dateRange !== 'all' ? dateRange : undefined,
        }, { preserveState: true });
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        router.get('/admin/payments', {
            tab: 'teacher-payouts',
            search,
            status: status !== 'all' ? status : undefined,
            payment_method: method !== 'all' ? method : undefined,
            date_range: dateRange !== 'all' ? dateRange : undefined,
        }, { preserveState: true });
    };

    const handleDateRangeChange = (range: string) => {
        setDateRange(range);
        router.get('/admin/payments', {
            tab: 'teacher-payouts',
            search,
            status: status !== 'all' ? status : undefined,
            payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
            date_range: range !== 'all' ? range : undefined,
        }, { preserveState: true });
    };

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showEditMethodModal, setShowEditMethodModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

    const handleApprove = (id: number) => {
        const payout = payouts.data.find((p: Payout) => p.id === id);
        if (payout) {
            setSelectedPayout(payout);
            setShowApproveModal(true);
        }
    };

    const confirmApprove = () => {
        if (!selectedPayout) return;

        router.post(`/admin/payouts/${selectedPayout.id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedPayout(null);
                setSelectedIds([]);
            },
            onError: (errors) => {
                console.error('Approval Error:', errors);
                toast.error(errors.error || 'Failed to approve payout');
            }
        });
    };

    const handleReject = (id: number) => {
        const payout = payouts.data.find((p: Payout) => p.id === id);
        if (payout) {
            setSelectedPayout(payout);
            setShowRejectModal(true);
        }
    };

    const handleEditMethod = (id: number) => {
        const payout = payouts.data.find((p: Payout) => p.id === id);
        if (payout) {
            setSelectedPayout(payout);
            setShowEditMethodModal(true);
        }
    };

    const handleSendNotification = (id: number) => {
        const payout = payouts.data.find((p: Payout) => p.id === id);
        if (payout) {
            setSelectedPayout(payout);
            setShowNotificationModal(true);
        }
    };

    const confirmReject = (reason: string) => {
        if (!selectedPayout) return;
        router.post(`/admin/payouts/${selectedPayout.id}/reject`, { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedPayout(null);
            },
            onError: (errors) => {
                console.error('Rejection Error:', errors);
                toast.error(errors.error || 'Failed to reject payout');
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="text-yellow-500 font-medium">Pending</span>;
            case 'approved':
                return <span className="text-green-500 font-medium">Approved</span>;
            case 'completed':
                return <span className="text-blue-500 font-medium">Paid</span>;
            case 'rejected':
                return <span className="text-red-500 font-medium">Rejected</span>;
            case 'failed':
                return <span className="text-red-700 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-700"></span>Missed</span>;
            default:
                return <span>{status}</span>;
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === payouts.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(payouts.data.map((p: Payout) => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6">
            <h2 className="text-2xl font-bold text-[#192020] mb-6">Withdrawal Request</h2>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1 min-w-[250px]">
                    <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by Name / Email"
                        className="w-full h-12 pl-11 pr-4 rounded-full border border-gray-200 focus:border-[#2D7A70] focus:ring-[#2D7A70]"
                    />
                </div>

                {/* Status Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-12 px-6 rounded-full border border-gray-200 flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 min-w-[160px] justify-between">
                            <span>{status === 'all' ? 'Select Status' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                            <Icon icon="mdi:chevron-down" className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[160px]">
                        {['all', 'pending', 'approved', 'rejected'].map((s) => (
                            <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>
                                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Payment Method Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-12 px-6 rounded-full border border-gray-200 flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 min-w-[180px] justify-between">
                            <span>{paymentMethod === 'all' ? 'Payment Method' : paymentMethod}</span>
                            <Icon icon="mdi:chevron-down" className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[180px]">
                        {['all', 'Bank Transfer', 'PayPal'].map((m) => (
                            <DropdownMenuItem key={m} onClick={() => handlePaymentMethodChange(m)}>
                                {m === 'all' ? 'All Methods' : m}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Date Range Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-12 px-6 rounded-full border border-gray-200 flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 min-w-[160px] justify-between">
                            <span>
                                {dateRange === 'all' ? 'Date Range' :
                                    dateRange === 'last_7_days' ? 'Last 7 Days' :
                                        dateRange === 'last_30_days' ? 'Last 30 Days' :
                                            dateRange === 'this_month' ? 'This Month' :
                                                dateRange === 'last_month' ? 'Last Month' : dateRange
                                }
                            </span>
                            <Icon icon="mdi:chevron-down" className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[160px]">
                        {[
                            { val: 'all', label: 'All Time' },
                            { val: 'last_7_days', label: 'Last 7 Days' },
                            { val: 'last_30_days', label: 'Last 30 Days' },
                            { val: 'this_month', label: 'This Month' },
                            { val: 'last_month', label: 'Last Month' },
                        ].map((d) => (
                            <DropdownMenuItem key={d.val} onClick={() => handleDateRangeChange(d.val)}>
                                {d.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="h-12 px-8 rounded-full border border-[#2D7A70] text-[#2D7A70] font-medium hover:bg-[#2D7A70] hover:text-white transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 w-12 text-left">
                                <Checkbox
                                    checked={payouts.data.length > 0 && selectedIds.length === payouts.data.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 text-left font-bold text-[#192020]">Teacher Name</th>
                            <th className="px-6 py-4 text-left font-bold text-[#192020]">Email</th>
                            <th className="px-6 py-4 text-left font-bold text-[#192020]">Amount</th>
                            <th className="px-6 py-4 text-left font-bold text-[#192020]">Requested On</th>
                            <th className="px-6 py-4 text-left font-bold text-[#192020]">Payment Method</th>
                            <th className="px-6 py-4 text-left font-bold text-[#192020]">Status</th>
                            <th className="px-6 py-4 text-right font-bold text-[#192020]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.data.map((payout: Payout) => (
                            <tr key={payout.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <Checkbox
                                        checked={selectedIds.includes(payout.id)}
                                        onCheckedChange={() => toggleSelect(payout.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-[#192020]">
                                    {payout.teacher?.user?.name}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {payout.teacher?.user?.email}
                                </td>
                                <td className="px-6 py-4 font-medium text-[#192020]">
                                    ₦{Number(payout.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(payout.requested_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-medium flex items-center gap-2">
                                    {/* Simple Icon Logic */}
                                    {payout.gateway === 'paypal'
                                        ? <Icon icon="logos:paypal" className="w-4 h-4" />
                                        : <Icon icon="mdi:bank" className="w-4 h-4 text-gray-400" />
                                    }
                                    {payout.gateway === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(payout.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100">
                                                <Icon icon="mdi:dots-vertical" className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px]">
                                            {payout.status === 'pending' && (
                                                <DropdownMenuItem onClick={() => handleApprove(payout.id)} className="text-[#192020] cursor-pointer flex justify-between items-center w-full">
                                                    <span>Approve</span>
                                                    <div className="bg-[#00B050] text-white rounded p-0.5">
                                                        <Icon icon="mdi:check" className="w-4 h-4 text-base" />
                                                    </div>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/payouts/${payout.id}`} className="cursor-pointer flex justify-between items-center w-full text-[#192020]">
                                                    <span>View Details</span>
                                                    <Icon icon="mdi:clipboard-account-outline" className="w-5 h-5 text-base" />
                                                </Link>
                                            </DropdownMenuItem>

                                            {payout.status === 'pending' && (
                                                <DropdownMenuItem onClick={() => handleEditMethod(payout.id)} className="cursor-pointer flex justify-between items-center w-full text-[#192020] bg-gray-50 py-3 my-1">
                                                    <span>Edit Payout Method</span>
                                                    <Icon icon="mdi:pencil-outline" className="w-5 h-5 border border-black rounded p-0.5 text-base" />
                                                </DropdownMenuItem>
                                            )}

                                            {/* <DropdownMenuItem className="cursor-pointer flex justify-between items-center w-full text-[#192020]">
                                                <span>Reassign Teacher</span>
                                                <Icon icon="mdi:file-document-edit-outline" className="w-5 h-5" />
                                            </DropdownMenuItem> */}

                                            <DropdownMenuItem onClick={() => handleSendNotification(payout.id)} className="cursor-pointer flex justify-between items-center w-full text-[#192020]">
                                                <span>Send Notification</span>
                                                <Icon icon="mdi:message-text-outline" className="w-5 h-5 text-base" />
                                            </DropdownMenuItem>

                                            {payout.status === 'pending' && (
                                                <DropdownMenuItem onClick={() => handleReject(payout.id)} className="text-[#192020] cursor-pointer flex justify-between items-center w-full">
                                                    <span>Reject</span>
                                                    <div className="border border-[#FF0000] text-[#FF0000] rounded-full p-0.5">
                                                        <Icon icon="mdi:close" className="w-3 h-3 text-base" />
                                                    </div>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                        {payouts.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-gray-500">
                                    No payout requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {payouts.last_page > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white gap-4 border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500 font-['Nunito']">
                        Showing <span className="font-bold text-[#192020]">{payouts.data.length}</span> of <span className="font-bold text-[#192020]">{payouts.total}</span> requests
                    </p>
                    <div className="flex items-center gap-2">
                        {payouts.links.map((link: any, index: number) => {
                            const isFirst = index === 0;
                            const isLast = index === payouts.links.length - 1;
                            const isPrevNext = isFirst || isLast;

                            if (!link.url && isPrevNext) {
                                return (
                                    <span
                                        key={index}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 cursor-not-allowed border border-gray-100"
                                    >
                                        <Icon icon={isFirst ? 'mdi:chevron-left' : 'mdi:chevron-right'} className="w-5 h-5" />
                                    </span>
                                );
                            }

                            if (!link.url) return null;

                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveState={true}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${link.active
                                        ? 'bg-[#2D7A70] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    {isPrevNext ? (
                                        <Icon icon={isFirst ? 'mdi:chevron-left' : 'mdi:chevron-right'} className="w-5 h-5" />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* Modals */}
            <ApprovePayoutModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                payout={selectedPayout}
                onConfirm={confirmApprove}
            />

            <RejectPayoutModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                payout={selectedPayout}
                onConfirm={confirmReject}
            />

            <EditPaymentMethodModal
                isOpen={showEditMethodModal}
                onClose={() => setShowEditMethodModal(false)}
                payout={selectedPayout}
            />

            <SendPayoutNotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                payout={selectedPayout}
            />
        </div>
    );
}
