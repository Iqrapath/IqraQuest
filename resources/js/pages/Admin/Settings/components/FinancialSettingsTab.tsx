import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { FormEventHandler } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';

interface Props {
    settings: any;
}

export default function FinancialSettingsTab({ settings }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        commission_rate: settings?.commission_rate || '10.00',
        commission_type: settings?.commission_type || 'fixed_percentage',
        auto_payout_threshold: settings?.auto_payout_threshold || '50000.00',
        min_withdrawal_amount: settings?.min_withdrawal_amount || '10000.00',
        bank_verification_enabled: settings?.bank_verification_enabled ?? true,
        withdrawal_note: settings?.withdrawal_note || '',
        apply_time: settings?.apply_time || 'set_now',
        platform_currency: 'NGN (₦)', // Mocked for now to match Figma
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.payments.update-settings'), {
            onSuccess: () => toast.success('Financial settings updated'),
        });
    };

    return (
        <form onSubmit={submit} className="max-w-[800px] space-y-8 pb-10">
            <h3 className="text-[18px] font-semibold text-[#101928]">Financial Controls</h3>

            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-sm space-y-8">
                {/* Platform Currency */}
                <div className="flex items-center justify-between">
                    <label className="text-[16px] font-medium text-[#101928]">Platform Currency</label>
                    <Select value={data.platform_currency} onValueChange={(v) => setData('platform_currency', v)}>
                        <SelectTrigger className="w-[300px] h-[48px] bg-[#FAFAFA] border-gray-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NGN (₦)">NGN (₦)</SelectItem>
                            <SelectItem value="USD ($)">USD ($)</SelectItem>
                            <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Commission Rate */}
                <div className="space-y-4">
                    <label className="text-[16px] font-medium text-[#101928]">Commission Rate</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={data.commission_rate}
                            onChange={(e) => setData('commission_rate', e.target.value)}
                            className="flex-1 h-[48px] px-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] text-[#667085] focus:ring-1 focus:ring-[#338078] outline-none"
                        />
                        <button type="button" className="text-[#338078] text-sm font-medium hover:underline">Edit Rate</button>
                    </div>
                </div>

                {/* Commission Type */}
                <div className="flex items-center justify-between">
                    <label className="text-[16px] font-medium text-[#101928]">Commission Type</label>
                    <Select value={data.commission_type} onValueChange={(v) => setData('commission_type', v)}>
                        <SelectTrigger className="w-[300px] h-[48px] bg-[#FAFAFA] border-gray-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed_percentage">Fixed Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Auto-Payout Threshold */}
                <div className="space-y-4">
                    <label className="text-[16px] font-medium text-[#101928]">Auto-Payout Threshold</label>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]">₦</span>
                            <input
                                type="text"
                                value={data.auto_payout_threshold}
                                onChange={(e) => setData('auto_payout_threshold', e.target.value)}
                                className="w-full h-[48px] pl-8 pr-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] text-[#667085] focus:ring-1 focus:ring-[#338078] outline-none"
                            />
                        </div>
                        <button type="button" className="text-[#338078] text-sm font-medium hover:underline">Edit</button>
                    </div>
                </div>

                {/* Minimum Withdrawal Amount */}
                <div className="space-y-4">
                    <label className="text-[16px] font-medium text-[#101928]">Minimum Withdrawal Amount</label>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]">₦</span>
                            <input
                                type="text"
                                value={data.min_withdrawal_amount}
                                onChange={(e) => setData('min_withdrawal_amount', e.target.value)}
                                className="w-full h-[48px] pl-8 pr-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] text-[#667085] focus:ring-1 focus:ring-[#338078] outline-none"
                            />
                        </div>
                        <button type="button" className="text-[#338078] text-sm font-medium hover:underline">Edit</button>
                    </div>
                </div>

                {/* Instant Payouts Toggle (System wide) */}
                <div className="flex items-center justify-between">
                    <label className="text-[16px] font-medium text-[#101928]">Instant Payouts</label>
                    <Switch
                        checked={data.bank_verification_enabled}
                        onCheckedChange={(v) => setData('bank_verification_enabled', v)}
                        className="data-[state=checked]:bg-[#338078]"
                    />
                </div>

                {/* Export Log Mockup */}
                <div className="flex items-center justify-between">
                    <label className="text-[16px] font-medium text-[#101928]">Export Payout Logs</label>
                    <div className="flex items-center gap-2 text-[#338078] text-xs font-semibold cursor-pointer">
                        <Icon icon="ph:download-simple-bold" className="w-4 h-4" />
                        <span>Export Logs</span>
                    </div>
                </div>

                {/* Multi-Currency Mode Toggle */}
                <div className="flex items-center justify-between">
                    <label className="text-[16px] font-medium text-[#101928]">Multi-Currency Mode</label>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked className="w-5 h-5 accent-[#338078] rounded cursor-pointer" />
                            <span className="text-sm font-semibold text-[#667085]">Enable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-5 h-5 accent-[#338078] rounded cursor-pointer" />
                            <span className="text-sm font-semibold text-[#667085]">Disable</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-[#338078] text-white px-10 py-3 rounded-[30px] font-semibold hover:bg-[#2a6b64] transition-all shadow-sm"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
