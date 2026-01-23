import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { toast } from "sonner";
import FAQForm from './FAQForm';

declare var route: any;

interface FAQ {
    id: number;
    question: string;
    answer: string;
    status: 'published' | 'draft';
    order: number;
}

interface Props {
    faqs: FAQ[];
    onBack: () => void;
}

export default function KnowledgeBaseTab({ faqs: initialFaqs, onBack }: Props) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => translations?.[key] || key;

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

    const filteredFaqs = initialFaqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this FAQ?")) {
            router.delete('/admin/faqs/destroy/' + id, {
                onSuccess: () => toast.success("FAQ deleted successfully"),
            });
        }
    };

    const toggleStatus = (faq: FAQ) => {
        const newStatus = faq.status === 'published' ? 'draft' : 'published';
        router.put('/admin/faqs/update/' + faq.id, {
            ...faq,
            status: newStatus
        }, {
            onSuccess: () => toast.success(`FAQ status updated to ${newStatus}`),
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

            <div className="max-w-[1000px] space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[24px] font-semibold text-[#101928]">Manage FAQs & Knowledge Base</h2>
                    </div>

                    <button
                        onClick={() => {
                            setEditingFAQ(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-[#338078] text-white px-6 py-3 rounded-[12px] font-semibold flex items-center gap-2 hover:bg-[#2a6b64] transition-all shadow-sm"
                    >
                        Add FAQ
                    </button>
                </div>

                <div className="bg-white rounded-[16px] border border-[#E4E7EC] shadow-sm overflow-hidden">
                    <div className="divide-y divide-[#E4E7EC]">
                        {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => (
                            <div key={faq.id} className="group">
                                <div
                                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all"
                                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                >
                                    <span className="text-[18px] font-medium text-[#101928]">{faq.question}</span>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[14px] font-medium ${faq.status === 'published' ? 'text-[#338078]' : 'text-[#F04438]'}`}>
                                            {faq.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                        <Icon
                                            icon={expandedId === faq.id ? "lucide:chevron-up" : "lucide:chevron-down"}
                                            className="text-[20px] text-[#667085]"
                                        />
                                    </div>
                                </div>

                                {expandedId === faq.id && (
                                    <div className="px-6 pb-6 pt-2 space-y-4">
                                        <div className="bg-[#E9FBF9] rounded-[14px] p-6 border border-[#33807833]">
                                            <div
                                                className="text-[#344054] text-[16px] leading-[24px] prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                            />
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleStatus(faq);
                                                }}
                                                className="bg-[#338078] text-white px-6 py-2 rounded-[10px] text-[14px] font-medium hover:bg-[#2a6b64] transition-all"
                                            >
                                                {faq.status === 'published' ? 'Set as Draft' : 'Publish'}
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingFAQ(faq);
                                                    setIsFormOpen(true);
                                                }}
                                                className="text-[#338078] font-medium hover:underline text-[14px]"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(faq.id);
                                                }}
                                                className="text-[#F04438] font-medium hover:underline text-[14px]"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="p-10 text-center text-[#667085]">
                                No FAQs found. Add your first FAQ to get started.
                            </div>
                        )}
                    </div>
                </div>

                <FAQForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    faq={editingFAQ}
                />
            </div>
        </div>
    );
}
