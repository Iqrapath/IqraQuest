import { useForm, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import RichTextEditor from '@/components/RichTextEditor';

interface Props {
    settings: any;
    onBack: () => void;
}

export default function TermsConditionsTab({ settings, onBack }: Props) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    const { data, setData, post, processing } = useForm({
        terms_conditions: settings?.terms_conditions || '',
        tc_send_email: !!settings?.tc_send_email,
        tc_send_dashboard: !!settings?.tc_send_dashboard,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings/legal/update', {
            onSuccess: () => {
                toast.success("Terms & Conditions updated successfully");
                setData((prev) => ({
                    ...prev,
                    tc_send_email: false,
                    tc_send_dashboard: false
                }));
            },
        });
    };

    return (
        <div className="font-[Nunito] pb-20">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#338078] hover:text-[#2a6b64] mb-6 font-semibold transition-colors cursor-pointer hover:underline"
            >
                <Icon icon="ph:arrow-left-bold" className="w-5 h-5" />
                {__("Back to General Settings")}
            </button>

            <form onSubmit={handleSubmit} className="max-w-[1000px] space-y-10">
                <div className="bg-white rounded-[12px] p-2 border border-[#E4E7EC] shadow-sm">
                    <RichTextEditor
                        value={data.terms_conditions}
                        onChange={(val) => setData('terms_conditions', val)}
                        placeholder={__("Welcome to IqraPath – a trusted platform for connecting Quran teachers with students...")}
                        className="border-none shadow-none"
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[18px] text-[#338078] font-medium">{__("Sent to User via:")}</span>

                        <div className="bg-white px-4 py-2 rounded-[12px] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] border border-[#F2F4F7] flex items-center gap-4">
                            <span className="text-[#344054] font-medium">{__("Email")}</span>
                            <Switch
                                checked={data.tc_send_email}
                                onCheckedChange={(checked) => setData('tc_send_email', checked)}
                                className="data-[state=checked]:bg-[#338078]"
                            />
                        </div>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-[12px] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] border border-[#F2F4F7] flex items-center gap-4 w-fit">
                        <span className="text-[#344054] font-medium">{__("Dashboard Notification")}</span>
                        <Switch
                            checked={data.tc_send_dashboard}
                            onCheckedChange={(checked) => setData('tc_send_dashboard', checked)}
                            className="data-[state=checked]:bg-[#338078]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-8 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[#338078] text-white px-10 py-4 rounded-[12px] text-[20px] font-semibold hover:bg-[#2a6b64] transition-all disabled:opacity-50"
                    >
                        {__("Save & Continue")}
                    </button>

                    <button
                        type="button"
                        className="text-[#F04438] text-[20px] font-medium hover:underline"
                    >
                        {__("Cancel")}
                    </button>
                </div>
            </form>
        </div>
    );
}
