import { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RichTextEditor from '@/components/RichTextEditor';

declare var route: any;

interface FAQ {
    id: number;
    question: string;
    answer: string;
    status: 'published' | 'draft';
    order: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    faq: FAQ | null;
}

export default function FAQForm({ isOpen, onClose, faq }: Props) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    const { data, setData, post, put, processing, reset } = useForm({
        question: '',
        answer: '',
        status: 'published' as 'published' | 'draft',
        order: 0,
    });

    useEffect(() => {
        if (faq) {
            setData({
                question: faq.question,
                answer: faq.answer,
                status: faq.status,
                order: faq.order,
            });
        } else {
            reset();
        }
    }, [faq]);

    const handleSubmit = (status: 'published' | 'draft') => {
        setData('status', status);

        const options = {
            onSuccess: () => {
                toast.success(faq ? "FAQ updated successfully" : "FAQ created successfully");
                onClose();
                if (!faq) reset();
            },
        };

        if (faq) {
            put(route('admin.faqs.update', faq.id), options);
        } else {
            post(route('admin.faqs.store'), options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[700px] font-[Nunito] p-8">
                <DialogHeader>
                    <DialogTitle className="text-[24px] font-semibold text-[#101928]">
                        {faq ? __("Edit FAQ") : __("Add New FAQ")}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 mt-6">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[16px] font-medium text-[#344054]">
                            <Icon icon="lucide:pin" className="text-[#F04438]" />
                            {__("FAQ Title:")}
                        </label>
                        <input
                            type="text"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            placeholder={__("Enter FAQ Title here")}
                            className="w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-[10px] px-4 py-3 focus:ring-[#338078] focus:border-[#338078] outline-none text-[#1D2739]"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[16px] font-medium text-[#344054]">
                            <Icon icon="ph:pencil-line" className="text-[#FDB022]" />
                            {__("Content:")}
                        </label>
                        <RichTextEditor
                            value={data.answer}
                            onChange={(val: string) => setData('answer', val)}
                            placeholder={__("Write the Answer here")}
                            className="bg-[#F9FAFB]"
                        />
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <button
                            onClick={() => handleSubmit('published')}
                            disabled={processing}
                            className="bg-[#338078] text-white px-8 py-3 rounded-[10px] font-semibold hover:bg-[#2a6b64] transition-all disabled:opacity-50"
                        >
                            {__("Publish")}
                        </button>

                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={processing}
                            className="text-[#338078] font-semibold hover:underline"
                        >
                            {__("Add to Draft")}
                        </button>

                        <button
                            onClick={onClose}
                            className="text-[#F04438] font-semibold hover:underline"
                        >
                            {__("Cancel")}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
