import { useForm } from '@inertiajs/react'; // Import useForm
import { Icon } from '@iconify/react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner'; // Import toast
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormEventHandler } from 'react';

interface Props {
    settings: {
        commission_rate: string;
        commission_type: string;
        auto_payout_threshold: string;
        min_withdrawal_amount: string;
        bank_verification_enabled: boolean;
        withdrawal_note: string;
        apply_time: string;
    };
}

export default function PaymentSettingsTab({ settings }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        commission_rate: settings?.commission_rate || '10.00',
        commission_type: settings?.commission_type || 'fixed_percentage',
        auto_payout_threshold: settings?.auto_payout_threshold || '50000.00',
        min_withdrawal_amount: settings?.min_withdrawal_amount || '10000.00',
        bank_verification_enabled: settings?.bank_verification_enabled ?? true,
        withdrawal_note: settings?.withdrawal_note || '',
        apply_time: settings?.apply_time || 'set_now',
    });

    const submit: FormEventHandler = (e) => {
        put('/admin/payments/settings', {
            onSuccess: () => {
                toast.success('Settings updated successfully');
            },
            onError: (err) => {
                // Ensure toast is fired on error if needed, usually inertia handles errors props
                toast.error('Failed to update settings');
                console.error(err);
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 font-[Nunito] max-w-[800px]">
            {/* Title */}
            <div>
                <h2 className="text-[20px] font-semibold text-[#101928] mb-6">Commission Settings</h2>
            </div>

            {/* Card 1: Commission Settings */}
            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-sm space-y-8">
                {/* Current Commission Rate */}
                <div className="space-y-3">
                    <label className="text-[16px] font-medium text-[#101928]">Current Commission Rate</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={data.commission_rate}
                                onChange={(e) => setData('commission_rate', e.target.value)}
                                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[8px] px-4 py-3 text-[#667085] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                                placeholder="e.g., 10"
                            />
                        </div>
                        <button type="button" className="text-[#338078] text-sm font-medium hover:underline">Edit Rate</button>
                    </div>
                    {errors.commission_rate && <div className="text-red-500 text-sm">{errors.commission_rate}</div>}
                </div>

                {/* Commission Type */}
                <div className="flex items-center gap-4">
                    <label className="text-[16px] font-medium text-[#101928] min-w-[150px]">Commission Type</label>
                    <div className="w-[300px]">
                        <Select value={data.commission_type} onValueChange={(val) => setData('commission_type', val)}>
                            <SelectTrigger className="w-full rounded-[8px] border-gray-200 bg-[#FAFAFA] px-4 py-3 text-[#667085] focus:ring-[#338078] h-[48px]">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed_percentage">Fixed Percentage</SelectItem>
                                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Card 2: Withdrawal Settings */}
            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-sm space-y-8">

                {/* Auto-Payout Threshold */}
                <div className="space-y-3">
                    <label className="text-[16px] font-medium text-[#101928]">Auto-Payout Threshold</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={data.auto_payout_threshold}
                                onChange={(e) => setData('auto_payout_threshold', e.target.value)}
                                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[8px] px-4 py-3 text-[#667085] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                            />
                        </div>
                        <button type="button" className="text-[#338078] text-sm font-medium hover:underline">Edit</button>
                    </div>
                    {errors.auto_payout_threshold && <div className="text-red-500 text-sm">{errors.auto_payout_threshold}</div>}
                </div>

                {/* Minimum Withdrawal Amount */}
                <div className="space-y-3">
                    <label className="text-[16px] font-medium text-[#101928]">Minimum Withdrawal Amount</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={data.min_withdrawal_amount}
                                onChange={(e) => setData('min_withdrawal_amount', e.target.value)}
                                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[8px] px-4 py-3 text-[#667085] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                            />
                        </div>
                        <button type="button" className="text-[#338078] text-sm font-medium hover:underline">Edit</button>
                    </div>
                    {errors.min_withdrawal_amount && <div className="text-red-500 text-sm">{errors.min_withdrawal_amount}</div>}
                </div>

                {/* Bank Verification Check */}
                <div className="flex items-center gap-4">
                    <label className="text-[16px] font-medium text-[#101928]">Bank Verification Check</label>
                    <Switch
                        checked={data.bank_verification_enabled}
                        onCheckedChange={(checked) => setData('bank_verification_enabled', checked)}
                        className="data-[state=checked]:bg-[#338078]"
                    />
                </div>

                {/* Add withdrawal note */}
                <div className="space-y-3">
                    <label className="text-[16px] font-medium text-[#101928]">Add withdrawal note for users</label>
                    <textarea
                        value={data.withdrawal_note}
                        onChange={(e) => setData('withdrawal_note', e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[8px] px-4 py-3 text-[#667085] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] min-h-[100px] resize-none"
                    />
                </div>

                {/* Apply Time */}
                <div className="flex items-center gap-4">
                    <label className="text-[16px] font-medium text-[#101928]">Apply Time:</label>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#344054]">Set Now</span>
                            <Switch
                                checked={data.apply_time === 'set_now'}
                                onCheckedChange={(checked) => checked && setData('apply_time', 'set_now')}
                                className="data-[state=checked]:bg-[#338078]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#344054]">Schedule for Later</span>
                            <Switch
                                checked={data.apply_time === 'schedule'}
                                onCheckedChange={(checked) => checked && setData('apply_time', 'schedule')}
                                className="data-[state=checked]:bg-[#338078]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-6 pt-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-[#338078] text-white px-8 py-3 rounded-[30px] font-medium hover:bg-[#286660] transition-colors shadow-sm disabled:opacity-50"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="text-[#F04438] font-medium hover:underline">
                    Cancel
                </button>
            </div>
        </form>
    );
}


