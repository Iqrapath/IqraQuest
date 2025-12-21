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

interface Subject {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: any;
    subjects: Subject[];
}

export default function EditPreferencesModal({ open, onOpenChange, student, subjects }: Props) {
    const { data, setData, post, processing } = useForm({
        subjects: [] as number[],
        learning_goal_description: student.learning_goal_description || '',
    });

    useEffect(() => {
        if (open) {
            setData({
                subjects: student.subjects.map((s: any) => s.id),
                learning_goal_description: student.learning_goal_description || '',
            });
        }
    }, [open, student]);

    const handleSubjectToggle = (id: number, checked: boolean) => {
        if (checked) {
            setData('subjects', [...data.subjects, id]);
        } else {
            setData('subjects', data.subjects.filter(sid => sid !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/profile', {
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
                                Subjects you want to Learn
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {subjects.map((subject) => (
                                    <div key={subject.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`pref-subject-${subject.id}`}
                                            checked={data.subjects.includes(subject.id)}
                                            onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                                            className="w-5 h-5 rounded-[4px] border-[#818181] aria-checked:bg-[#338078] aria-checked:border-[#338078]"
                                        />
                                        <label htmlFor={`pref-subject-${subject.id}`} className="text-[14px] sm:text-[16px] text-[#555] font-['Nunito'] cursor-pointer select-none">
                                            {subject.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Goal */}
                        <div className="flex flex-col gap-3">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Your learning goal
                            </label>
                            <textarea
                                value={data.learning_goal_description}
                                onChange={(e) => setData('learning_goal_description', e.target.value)}
                                placeholder="Write your learning goal"
                                className="w-full h-[120px] p-4 border border-[#caced7] rounded-[10px] bg-transparent outline-none resize-none font-['Nunito'] text-[14px] text-[#333] placeholder:text-[#a0a0a0] focus:border-[#338078] transition-colors"
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white font-['Nunito'] font-medium text-[16px] py-3 px-8 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save and Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
