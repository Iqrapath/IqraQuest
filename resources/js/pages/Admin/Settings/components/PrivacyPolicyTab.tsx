import { useForm, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from "sonner";
import RichTextEditor from '@/components/RichTextEditor';

interface Props {
    settings: any;
    onBack: () => void;
}

export default function PrivacyPolicyTab({ settings, onBack }: Props) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    const { data, setData, post, processing } = useForm({
        privacy_policy: settings?.privacy_policy || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings/legal/update', {
            onSuccess: () => toast.success("Privacy Policy updated successfully"),
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

            <h2 className="text-[24px] font-semibold text-[#101928] mb-6">{__("Privacy Policy")}</h2>

            <form onSubmit={handleSubmit} className="max-w-[1000px] space-y-10">
                <div className="bg-white rounded-[12px] p-2 border border-[#E4E7EC] shadow-sm">
                    <RichTextEditor
                        value={data.privacy_policy}
                        onChange={(val) => setData('privacy_policy', val)}
                        placeholder={__("Privacy is important to us...")}
                        className="border-none shadow-none"
                    />
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
