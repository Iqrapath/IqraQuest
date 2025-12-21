import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

interface Subject {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: any;
    subjects: Subject[];
}

export default function EditExperienceModal({ open, onOpenChange, teacher, subjects }: Props) {
    const { data, setData, post, processing } = useForm({
        subjects: [] as number[],
        experience_years: teacher.experience_years || 0,
    });

    useEffect(() => {
        if (open) {
            setData({
                subjects: teacher.subjects.map((s: any) => s.id),
                experience_years: teacher.experience_years || 0,
            });
        }
    }, [open, teacher]);

    const handleSubjectToggle = (id: number, checked: boolean) => {
        if (checked) {
            setData('subjects', [...data.subjects, id]);
        } else {
            setData('subjects', data.subjects.filter(sid => sid !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/profile', {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white rounded-[20px] max-h-[85vh] flex flex-col">
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <DialogHeader className="mb-6 text-left">
                        <div>
                            <DialogTitle className="font-['Nunito'] font-bold text-[24px] text-[#1a1d56]">
                                Teaching Subjects & Expertise
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Subjects */}
                        <div className="flex flex-col gap-3">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Subjects
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {subjects.map((subject) => (
                                    <div key={subject.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`teach-subject-${subject.id}`}
                                            checked={data.subjects.includes(subject.id)}
                                            onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                                            className="w-5 h-5 rounded-[4px] border-[#818181] aria-checked:bg-[#338078] aria-checked:border-[#338078]"
                                        />
                                        <label htmlFor={`teach-subject-${subject.id}`} className="text-[14px] text-[#555] font-['Nunito'] cursor-pointer select-none">
                                            {subject.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="flex flex-col gap-3">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Experience (Years)
                            </label>
                            <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3 border border-transparent focus-within:border-[#338078] transition-colors w-full sm:w-1/3">
                                <input
                                    type="number"
                                    min="0"
                                    value={data.experience_years}
                                    onChange={(e) => setData('experience_years', parseInt(e.target.value) || 0)}
                                    className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] text-[#333]"
                                />
                            </div>
                        </div>

                        {/* Certifications (Static for now, but UI ready) */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                    Certifications
                                </label>
                                <button type="button" className="text-[#338078] text-[14px] font-medium hover:underline">
                                    Upload New
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {teacher.certificates && teacher.certificates.length > 0 ? (
                                    teacher.certificates.map((cert: any) => (
                                        <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Icon icon="mdi:certificate-outline" className="text-[#338078] w-5 h-5" />
                                                <span className="text-sm font-['Nunito'] text-gray-700">{cert.title || 'Certificate'}</span>
                                            </div>
                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                {cert.verification_status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400 italic">No certificates uploaded yet.</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white font-['Nunito'] font-medium text-[16px] py-3 px-8 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
