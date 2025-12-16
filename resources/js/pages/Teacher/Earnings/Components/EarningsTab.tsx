import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCurrency, CURRENCY_CONFIG, CurrencyCode } from '@/contexts/CurrencyContext';
import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { WithdrawModal } from './WithdrawModal';

// Silence TS error for global route helper from Ziggy
declare let route: any;

interface EarningsTabProps {
    totalEarnings: number;
    availableBalance: number;
    recentTransactions: any;
    automaticPayouts: boolean;
    paymentMethods: any[];
}

export default function EarningsTab({
    totalEarnings,
    availableBalance,
    recentTransactions,
    automaticPayouts,
    paymentMethods,
}: EarningsTabProps) {
    const { currency, setCurrency } = useCurrency();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Form for settings (Currency & Auto Payouts)
    const { data, setData, post, processing, errors } = useForm({
        preferred_currency: currency,
        automatic_payouts: automaticPayouts,
    });

    // Update local currency context when form changes
    useEffect(() => {
        if (data.preferred_currency) {
            setCurrency(data.preferred_currency as CurrencyCode);
        }
    }, [data.preferred_currency]);

    // Sync external prop changes to form
    useEffect(() => {
        setData('automatic_payouts', automaticPayouts);
    }, [automaticPayouts]);


    const handleSaveChanges = () => {
        post('/teacher/earnings/settings', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Earnings settings updated successfully');
            },
            onError: () => {
                toast.error('Failed to update settings');
            },
        });
    };

    const formatCurrency = (amount: number) => {
        // Fallback to NGN formatting if currency context is missing config for some reason
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            {/* 1. Earnings Settings (Header - Restore Original Separation) */}
            <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-6 w-full md:w-auto mb-10">
                        <p className="text-gray-600 mb-8">Manage your earnings and withdraw funds settings.</p>
                        {/* Preferred Currency */}
                        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
                            <span className="text-gray-700 font-medium text-lg">Preferred Currency</span>
                            <Select
                                value={data.preferred_currency}
                                onValueChange={(val) => {
                                    const code = val as CurrencyCode;
                                    setCurrency(code);
                                    setData('preferred_currency', code);
                                }}
                            >
                                <SelectTrigger className="w-[100px] border-gray-200 text-gray-900 focus:ring-[#2D7A70] focus:border-[#2D7A70] rounded-xl">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CURRENCY_CONFIG).map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Automatic Payouts */}
                        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
                            <span className="text-gray-700 font-medium text-lg">Automatic Payouts</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={data.automatic_payouts}
                                    onChange={(e) => setData('automatic_payouts', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#338078]"></div>
                            </label>
                        </div>
                    </div>

                    {/* Save Changes Button */}
                    <button
                        onClick={handleSaveChanges}
                        disabled={processing}
                        className="bg-[#338078] text-white px-8 py-2.5 rounded-full font-medium hover:bg-[#2a6961] transition-colors w-full md:w-auto disabled:opacity-70"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Line dividing the earnings settings and statistics */}
            <div className='border-t pt-6'></div>

            {/* 2. Statistics Card (Unified Figma Layout with Student Style Balance) */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm mb-8 relative border border-gray-100">
                {/* Top Link */}
                <div className="flex justify-end mb-8">
                    <button className="text-[#2D7A70] font-medium hover:underline text-sm">
                        Check Transaction History
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Total Earnings */}
                    <div className="flex flex-col items-center justify-center gap-3 pl-6 pr-4 py-2 rounded-[55px] bg-gradient-to-r from-transparent to-[#c0b7e8]/30 border border-white/20 min-w-[200px] w-full max-w-[280px] md:w-auto">
                        <p className="text-gray-500 mb-3 font-medium">Total Earnings</p>
                        <p className="text-3xl font-bold text-[#1F1F1F]">{formatCurrency(totalEarnings)}</p>
                    </div>

                    {/* Available Balance (Student Gradient Style) */}
                    <div className="flex flex-col items-center justify-center gap-3 pl-6 pr-4 py-2 rounded-[55px] bg-gradient-to-r from-transparent to-[#E9FFFD]/30 border border-white/20 min-w-[200px] w-full max-w-[280px] md:w-auto shadow-sm transform md:scale-105 z-10 transition-transform">
                        <p className="text-gray-500 mb-3 font-medium">Available Balance</p>
                        <p className="text-4xl font-bold text-[#2D7A70]">{formatCurrency(availableBalance)}</p>
                    </div>

                    {/* Pending Payout */}
                    <div className="flex flex-col items-center justify-center gap-3 pl-6 pr-4 py-2 rounded-[55px] bg-gradient-to-r from-transparent to-[#FFF9E9]/30 border border-white/20 min-w-[200px] w-full max-w-[280px] md:w-auto">
                        <p className="text-gray-500 mb-3 font-medium">Pending Payout</p>
                        <p className="text-3xl font-bold text-[#1F1F1F]">{formatCurrency(0)}</p>
                    </div>
                </div>

                {/* Bottom Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="bg-[#2D7A70] text-white px-12 py-3.5 rounded-full font-medium hover:bg-[#24635b] transition-all shadow-lg shadow-[#2D7A70]/20"
                    >
                        Withdraw Fund
                    </button>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Recent Transaction</h2>
                    <button className="flex items-center gap-2 text-red-500 text-sm font-medium">
                        <Icon icon="material-symbols:picture-as-pdf" className="w-5 h-5" />
                        Send Activity Report
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Subject</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions?.data?.map((transaction: any, index: number) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        {new Date(transaction.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{transaction.description || '-'}</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{transaction.metadata?.student_name || '-'}</td>
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                        {formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!recentTransactions?.data?.length && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        No transactions yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                availableBalance={availableBalance}
                paymentMethods={paymentMethods}
            />
        </>
    );
}
