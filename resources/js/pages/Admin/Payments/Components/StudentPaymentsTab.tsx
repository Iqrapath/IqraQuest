import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StudentPayment {
    id: number;
    date: string;
    student_name: string;
    plan: string;
    amount: string;
    payment_method: string;
    status: 'successful' | 'failed' | 'pending';
    currency: string;
}

// Mock Data based on Figma
const MOCK_PAYMENTS: StudentPayment[] = [
    {
        id: 1,
        date: 'Apr 12',
        student_name: 'Maryam Bello',
        plan: 'Half Quran',
        amount: '₦25,000',
        payment_method: 'Debit/Credit Card',
        status: 'successful',
        currency: 'NGN'
    },
    {
        id: 2,
        date: 'Apr 11',
        student_name: 'Abdullah Bello',
        plan: 'Full Quran (USD)',
        amount: '$60.00',
        payment_method: 'PayPal',
        status: 'successful',
        currency: 'USD'
    },
    {
        id: 3,
        date: 'Apr 10',
        student_name: 'Aisha Bello',
        plan: "Juz' Amma",
        amount: '₦12,000',
        payment_method: 'Bank Transfer',
        status: 'failed',
        currency: 'NGN'
    }
];

export default function StudentPaymentsTab() {
    const [search, setSearch] = useState('');
    const [planType, setPlanType] = useState('all');
    const [paymentMethod, setPaymentMethod] = useState('all');
    const [userType, setUserType] = useState('all');
    const [currency, setCurrency] = useState('all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(MOCK_PAYMENTS.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    return (
        <div className="space-y-6 font-[Nunito]">
            {/* Header / Title if needed, but Index.tsx handles the main header */}

            {/* Title Section from Design (Payment list) */}
            <div>
                <h2 className="text-[20px] font-semibold text-[#101928] mb-6">Payment list</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative w-[320px]">
                    <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Name / Email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 rounded-[30px] border border-gray-200 text-sm focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                    />
                </div>

                {/* Plan Type Dropdown */}
                <div className="w-[140px]">
                    <Select value={planType} onValueChange={setPlanType}>
                        <SelectTrigger className="w-full rounded-[30px] border-gray-200 bg-white px-4 py-5 text-sm text-gray-600 focus:ring-[#338078]">
                            <SelectValue placeholder="Plan Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Plan Type</SelectItem>
                            <SelectItem value="full_quran">Full Quran</SelectItem>
                            <SelectItem value="half_quran">Half Quran</SelectItem>
                            <SelectItem value="juz_amma">Juz' Amma</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment Method Dropdown */}
                <div className="w-[180px]">
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="w-full rounded-[30px] border-gray-200 bg-white px-4 py-5 text-sm text-gray-600 focus:ring-[#338078]">
                            <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Payment Method</SelectItem>
                            <SelectItem value="card">Debit/Credit Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* User Type Dropdown */}
                <div className="w-[140px]">
                    <Select value={userType} onValueChange={setUserType}>
                        <SelectTrigger className="w-full rounded-[30px] border-gray-200 bg-white px-4 py-5 text-sm text-gray-600 focus:ring-[#338078]">
                            <SelectValue placeholder="User Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">User Type</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Currency Filter */}
                <div className="w-[140px]">
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-full rounded-[30px] border-gray-200 bg-white px-4 py-5 text-sm text-gray-600 focus:ring-[#338078]">
                            <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Currency Filter</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Search Button */}
                <button className="bg-white border border-[#338078] text-[#338078] px-6 py-2.5 rounded-[30px] text-sm font-medium hover:bg-[#338078] hover:text-white transition-colors">
                    Search
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[16px] overflow-hidden border border-gray-100 shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <Checkbox
                                    checked={selectedIds.length === MOCK_PAYMENTS.length && MOCK_PAYMENTS.length > 0}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                    className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#101928]">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#101928]">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#101928]">Plan</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#101928]">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#101928]">Payment Method</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#101928]">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[#101928]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {MOCK_PAYMENTS.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <Checkbox
                                        checked={selectedIds.includes(payment.id)}
                                        onCheckedChange={(checked) => handleSelectOne(payment.id, checked as boolean)}
                                        className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm text-[#344054] font-medium">{payment.date}</td>
                                <td className="px-6 py-4 text-sm text-[#101928] font-medium">{payment.student_name}</td>
                                <td className="px-6 py-4 text-sm text-[#667085]">{payment.plan}</td>
                                <td className="px-6 py-4 text-sm text-[#101928] font-bold">{payment.amount}</td>
                                <td className="px-6 py-4 text-sm text-[#101928]">
                                    {payment.payment_method === 'Debit/Credit Card' && (
                                        <div className="flex flex-col">
                                            <span>Debit/Credit</span>
                                            <span>Card</span>
                                        </div>
                                    )}
                                    {payment.payment_method !== 'Debit/Credit Card' && payment.payment_method}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${payment.status === 'successful' ? 'text-[#027A48]' : 'text-[#B42318]'
                                        }`}>
                                        {payment.status === 'successful' ? 'Successful' : 'Failed'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg outline-none">
                                                <Icon icon="solar:menu-dots-bold" className="w-5 h-5 text-gray-400 rotate-90" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px] p-1 bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] border border-gray-100">
                                            <DropdownMenuItem className="cursor-pointer flex items-center justify-between text-[#344054] px-3 py-2.5 hover:bg-gray-50 rounded-lg focus:bg-gray-50">
                                                <span>Approve</span>
                                                <Icon icon="solar:verified-check-bold" className="w-5 h-5 text-[#027A48]" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer flex items-center justify-between text-[#344054] px-3 py-2.5 hover:bg-gray-50 rounded-lg focus:bg-gray-50">
                                                <span>View Details</span>
                                                <Icon icon="solar:clipboard-text-linear" className="w-5 h-5 text-[#344054]" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer flex items-center justify-between text-[#344054] px-3 py-2.5 hover:bg-gray-50 rounded-lg focus:bg-gray-50">
                                                <span>View plan</span>
                                                <Icon icon="solar:bookmark-circle-linear" className="w-5 h-5 text-[#344054]" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer flex items-center justify-between text-[#344054] px-3 py-2.5 hover:bg-gray-50 rounded-lg focus:bg-gray-50">
                                                <span>Reject</span>
                                                <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-[#F04438]" />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder if needed */}
        </div>
    );
}
