import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { FormEventHandler } from 'react';
import { Switch } from '@/components/ui/switch';

interface Props {
    toggles: any;
}

export default function FeatureControlsTab({ toggles }: Props) {
    const { data, setData, post, processing } = useForm({
        toggles: {
            enable_referral_program: toggles?.enable_referral_program === '1',
            email_verification_on_signup: toggles?.email_verification_on_signup === '1',
            allow_teacher_withdrawals: toggles?.allow_teacher_withdrawals === '1',
            blog_comments: toggles?.blog_comments === '1',
            sms_notifications: toggles?.sms_notifications === '1',
            auto_payouts: toggles?.auto_payouts === '1',
        }
    });

    const toggleFeature = (key: string, value: boolean) => {
        setData('toggles', { ...data.toggles, [key]: value });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.features.update'), {
            onSuccess: () => toast.success('Feature controls updated'),
        });
    };

    const features = [
        { key: 'auto_payouts', label: 'Auto-Payouts' },
        { key: 'enable_referral_program', label: 'Enable Referral Program' },
        { key: 'email_verification_on_signup', label: 'Email Verification on Signup' },
        { key: 'allow_teacher_withdrawals', label: 'Allow Teacher Withdrawals' },
        { key: 'blog_comments', label: 'Blog Comments' },
        { key: 'sms_notifications', label: 'SMS Notifications' },
    ];

    return (
        <form onSubmit={submit} className="max-w-[800px] space-y-8">
            <h3 className="text-[18px] font-semibold text-[#101928]">Feature Controls</h3>

            <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-sm space-y-6">
                {features.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between py-2">
                        <label className="text-[16px] font-medium text-[#101928]">{feature.label}</label>
                        <Switch
                            checked={data.toggles[feature.key as keyof typeof data.toggles]}
                            onCheckedChange={(checked) => toggleFeature(feature.key, checked)}
                            className="data-[state=checked]:bg-[#338078]"
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4">
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
