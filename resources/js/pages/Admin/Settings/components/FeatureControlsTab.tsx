import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { FormEventHandler, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface Subject {
    id: number;
    name: string;
    category?: string | null;
    description: string | null;
    is_active: boolean;
    display_order: number;
}

interface PaginatedSubjects {
    data: Subject[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    toggles: any;
    subjects: PaginatedSubjects;
}

// Features that are not yet implemented in the backend
const UNIMPLEMENTED_FEATURES = ['sms_notifications', 'blog_comments', 'enable_referral_program'];

export default function FeatureControlsTab({ toggles, subjects = { data: [], current_page: 1, last_page: 1, total: 0 } }: Props) {
    const { data: toggleData, setData: setToggleData, post: postToggles, processing: processingToggles } = useForm({
        toggles: {
            auto_payouts: toggles?.auto_payouts === '1' || toggles?.auto_payouts === undefined,
            email_verification_on_signup: toggles?.email_verification_on_signup === '1' || toggles?.email_verification_on_signup === undefined,
            allow_teacher_withdrawals: toggles?.allow_teacher_withdrawals === '1' || toggles?.allow_teacher_withdrawals === undefined,
            enable_referral_program: toggles?.enable_referral_program === '1',
            blog_comments: toggles?.blog_comments === '1',
            sms_notifications: toggles?.sms_notifications === '1',
        }
    });

    const toggleFeature = (key: string, value: boolean) => {
        if (UNIMPLEMENTED_FEATURES.includes(key)) {
            toast.warning('This feature is not yet implemented. The setting will be saved but will have no effect.');
        }
        setToggleData('toggles', { ...toggleData.toggles, [key]: value });
    };

    const submitToggles: FormEventHandler = (e) => {
        e.preventDefault();
        postToggles(('/admin/settings/features/update'), {
            onSuccess: () => toast.success('Feature controls updated'),
        });
    };

    const features = [
        { key: 'auto_payouts', label: 'Auto-Payouts', implemented: true },
        { key: 'email_verification_on_signup', label: 'Email Verification on Signup', implemented: true },
        { key: 'allow_teacher_withdrawals', label: 'Allow Teacher Withdrawals', implemented: true },
        { key: 'enable_referral_program', label: 'Enable Referral Program', implemented: false },
        { key: 'blog_comments', label: 'Blog Comments', implemented: false },
        { key: 'sms_notifications', label: 'SMS Notifications', implemented: false },
    ];

    // -- Subject Management State --
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const subjectForm = useForm({
        id: '',
        name: '',
        category: '',
        description: '',
        display_order: 0,
        is_active: true,
    });

    const openCreateSubjectModal = () => {
        setEditingSubject(null);
        subjectForm.setData({
            id: '',
            name: '',
            category: '',
            description: '',
            display_order: (subjects.data.length > 0 ? Math.max(...subjects.data.map(s => s.display_order)) + 1 : 1),
            is_active: true,
        });
        subjectForm.clearErrors();
        setIsSubjectModalOpen(true);
    };

    const openEditSubjectModal = (subject: Subject) => {
        setEditingSubject(subject);
        subjectForm.setData({
            id: subject.id.toString(),
            name: subject.name,
            category: subject.category || '',
            description: subject.description || '',
            display_order: subject.display_order,
            is_active: subject.is_active,
        });
        subjectForm.clearErrors();
        setIsSubjectModalOpen(true);
    };

    const submitSubject: FormEventHandler = (e) => {
        e.preventDefault();
        subjectForm.post('/admin/settings/subjects', {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubjectModalOpen(false);
                toast.success(`Subject ${editingSubject ? 'updated' : 'created'} successfully!`);
            },
        });
    };

    const deleteSubject = (id: number) => {
        if (confirm('Are you sure you want to delete this subject? Note: It cannot be deleted if assigned to teachers or students.')) {
            router.delete(`/admin/settings/subjects/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const toggleSubjectStatus = (id: number) => {
        router.patch(`/admin/settings/subjects/${id}/status`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className="max-w-[1000px] space-y-12 pb-20">
            {/* Feature Controls Form */}
            <form onSubmit={submitToggles} className="space-y-8">
                <h3 className="text-[18px] font-semibold text-[#101928]">Feature Controls</h3>

                <div className="bg-white rounded-[16px] p-8 border border-gray-100 shadow-sm space-y-6">
                    {features.map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <label className="text-[16px] font-medium text-[#101928]">{feature.label}</label>
                                {!feature.implemented && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Coming Soon</span>
                                )}
                            </div>
                            <Switch
                                checked={toggleData.toggles[feature.key as keyof typeof toggleData.toggles]}
                                onCheckedChange={(checked) => toggleFeature(feature.key, checked)}
                                className="data-[state=checked]:bg-[#338078]"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processingToggles}
                        className="bg-[#338078] text-white px-10 py-3 rounded-[30px] font-semibold hover:bg-[#2a6b64] transition-all shadow-sm"
                    >
                        {processingToggles ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <hr className="border-gray-200" />

            {/* Subject Management Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#101928]">Subject Management</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage the subjects offered on the platform.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateSubjectModal}
                        className="bg-[#338078] text-white px-5 py-2.5 rounded-[30px] font-semibold hover:bg-[#2a6b64] transition-all shadow-sm flex items-center gap-2 text-sm"
                    >
                        Add Subject
                    </button>
                </div>

                <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order</th>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Description</th>
                                    <th className="px-6 py-4 font-semibold">Active</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subjects.data.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500">{subject.display_order}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                                        <td className="px-6 py-4 font-medium text-[#338078]">{subject.category || <span className="text-gray-300 font-normal italic">None</span>}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-[300px] truncate" title={subject.description || ''}>
                                            {subject.description || <span className="text-gray-300 italic">None</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Switch
                                                checked={subject.is_active}
                                                onCheckedChange={() => toggleSubjectStatus(subject.id)}
                                                className="data-[state=checked]:bg-[#338078]"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => openEditSubjectModal(subject)}
                                                className="text-[#338078] hover:text-[#2a6b64] font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteSubject(subject.id)}
                                                className="text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {subjects.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No subjects found. Add a subject to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {subjects.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <div className="text-sm text-gray-500">
                                Showing {((subjects.current_page - 1) * 10) + 1} to {Math.min(subjects.current_page * 10, subjects.total)} of {subjects.total} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.get(`/admin/settings?tab=features&page=${subjects.current_page - 1}`)}
                                    disabled={subjects.current_page === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => router.get(`/admin/settings?tab=features&page=${subjects.current_page + 1}`)}
                                    disabled={subjects.current_page === subjects.last_page}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subject Modal */}
            <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] font-semibold text-[#101928]">
                            {editingSubject ? 'Edit Subject' : 'Add Subject'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitSubject} className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101928]">Name</label>
                            <input
                                type="text"
                                value={subjectForm.data.name}
                                onChange={e => subjectForm.setData('name', e.target.value)}
                                className="w-full px-4 py-3 rounded-[12px] border border-gray-200 outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] transition-all"
                                placeholder="e.g. Quran Recitation"
                                required
                            />
                            {subjectForm.errors.name && <p className="text-xs text-red-500">{subjectForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101928]">Category</label>
                            <select
                                value={subjectForm.data.category}
                                onChange={e => subjectForm.setData('category', e.target.value)}
                                className="w-full px-4 py-3 rounded-[12px] bg-white border border-gray-200 outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] transition-all"
                            >
                                <option value="">Select a Category (Optional)</option>
                                <option value="Quran">Quran</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Tech">Tech</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Education">Education</option>
                                <option value="Crypto">Crypto</option>
                            </select>
                            {subjectForm.errors.category && <p className="text-xs text-red-500">{subjectForm.errors.category}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#101928]">Description</label>
                            <textarea
                                value={subjectForm.data.description}
                                onChange={e => subjectForm.setData('description', e.target.value)}
                                className="w-full px-4 py-3 rounded-[12px] border border-gray-200 outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] transition-all min-h-[100px]"
                                placeholder="Optional description..."
                            />
                            {subjectForm.errors.description && <p className="text-xs text-red-500">{subjectForm.errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#101928]">Display Order</label>
                                <input
                                    type="number"
                                    value={subjectForm.data.display_order}
                                    onChange={e => subjectForm.setData('display_order', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-[12px] border border-gray-200 outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] transition-all"
                                    required
                                    min="0"
                                />
                                {subjectForm.errors.display_order && <p className="text-xs text-red-500">{subjectForm.errors.display_order}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#101928] block mb-[14px]">Status</label>
                                <div className="flex items-center gap-2 mt-2">
                                    <Switch
                                        checked={subjectForm.data.is_active}
                                        onCheckedChange={v => subjectForm.setData('is_active', v)}
                                        className="data-[state=checked]:bg-[#338078]"
                                    />
                                    <span className="text-sm text-gray-500">{subjectForm.data.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-8">
                            <button
                                type="button"
                                onClick={() => setIsSubjectModalOpen(false)}
                                className="px-6 py-2.5 rounded-[30px] font-semibold text-gray-600 hover:bg-gray-100 transition-all border border-transparent"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={subjectForm.processing}
                                className="bg-[#338078] text-white px-8 py-2.5 rounded-[30px] font-semibold hover:bg-[#2a6b64] transition-all shadow-sm"
                            >
                                {subjectForm.processing ? 'Saving...' : 'Save Subject'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
