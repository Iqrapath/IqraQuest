import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: any;
    availableSubjects: string[];
}

interface DaySchedule {
    day: string;
    from: string;
    to: string;
    enabled: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AGE_GROUPS = ['4-6 Years', '7-9 Years', '10-12 Years', '13-15 Years', '16-18 Years', 'Adult'];

export default function StudentLearningPreferencesEditModal({ open, onOpenChange, student, availableSubjects = [] }: Props) {
    const [schedule, setSchedule] = useState<DaySchedule[]>([]);

    const { data, setData, post, processing, transform } = useForm({
        subjects: [] as string[],
        teaching_mode: 'part-time',
        age_group: '',
        preferred_times: [] as any[],
        additional_notes: '',
    });

    // Initialize state from student prop
    useEffect(() => {
        if (open && student) {
            // Parse subjects
            let initialSubjects: string[] = [];
            if (typeof student.subjects === 'string') {
                initialSubjects = student.subjects.split(',')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s !== '');
            } else if (Array.isArray(student.subjects)) {
                initialSubjects = student.subjects.filter((s: any) => typeof s === 'string' && s.trim() !== '');
            }

            // Initialize with default empty schedule (24h format for input type="time")
            let initialSchedule: DaySchedule[] = DAYS.map(day => ({
                day,
                from: '09:00',
                to: '10:00',
                enabled: false
            }));

            // TODO: Add thorough parsing if preferred_times has JSON data
            // For now, we rely on user re-entering if structure changes

            setSchedule(initialSchedule);

            setData({
                subjects: initialSubjects,
                teaching_mode: student.teaching_mode || 'part-time',
                age_group: student.age_group || '',
                preferred_times: [],
                additional_notes: student.additional_notes || '',
            });
        }
    }, [open, student]);

    const handleSubjectToggle = (subject: string, checked: boolean) => {
        const current = [...data.subjects];
        if (checked) {
            setData('subjects', [...current, subject]);
        } else {
            setData('subjects', current.filter(s => s !== subject));
        }
    };

    const handleDayToggle = (day: string, checked: boolean) => {
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, enabled: checked } : d));
    };

    const handleTimeChange = (day: string, field: 'from' | 'to', value: string) => {
        if (field === 'from') {
            // Auto-calculate 'to' time (1 hour later)
            let toValue = '';
            if (value) {
                const [hours, minutes] = value.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes);
                date.setHours(date.getHours() + 1);
                const toHours = date.getHours().toString().padStart(2, '0');
                const toMinutes = date.getMinutes().toString().padStart(2, '0');
                toValue = `${toHours}:${toMinutes}`;
            }

            setSchedule(prev => prev.map(d => d.day === day ? { ...d, from: value, to: toValue } : d));
        } else {
            setSchedule(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formattedAvailability = schedule.filter(d => d.enabled).map(({ day, from, to }) => ({
            day,
            from,
            to
        }));

        transform((data) => ({
            ...data,
            subjects: data.subjects.filter(s => s && s.trim() !== '').map(String),
            preferred_times: formattedAvailability
        }));

        post(`/admin/students/${student?.user?.id}/update-learning-preferences`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Preferences Updated');
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Update Error:', errors);
                toast.error('Failed to update preferences', {
                    description: Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(', ')
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] p-0 overflow-hidden bg-transparent border-none shadow-none text-left">
                <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-xl w-full relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogClose className="absolute right-6 top-6 text-[#101828] hover:text-gray-600 z-10">
                        <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                    </DialogClose>

                    <DialogHeader className="mb-6 text-left">
                        <DialogTitle className="font-['Nunito'] font-bold text-2xl text-[#1a1d56]">
                            Learning Preferences
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Edit learning preferences for the student.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        {/* Preferred Subjects */}
                        <div className="flex flex-col gap-3">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Preferred Subjects
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {availableSubjects?.map(subject => (
                                    <div key={subject} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`subject-${subject}`}
                                            checked={data.subjects.includes(subject)}
                                            onCheckedChange={(checked) => handleSubjectToggle(subject, checked as boolean)}
                                            className="border-[#caced7] data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                        />
                                        <label htmlFor={`subject-${subject}`} className="text-[16px] text-[#555] font-['Nunito'] cursor-pointer">
                                            {subject}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Teaching Mode */}
                        <div className="flex flex-col gap-2">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Teaching Mode
                            </label>
                            <p className="text-xs text-gray-500 font-['Nunito'] mb-2">
                                Max 6 hrs/day for full-time, 3 hrs/day for part-time
                            </p>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mode-full-time"
                                        checked={data.teaching_mode === 'full-time'}
                                        onCheckedChange={() => setData('teaching_mode', 'full-time')}
                                        className="border-[#caced7] data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                    />
                                    <label htmlFor="mode-full-time" className="text-[16px] text-[#555] font-['Nunito'] cursor-pointer">
                                        Full-Time
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mode-part-time"
                                        checked={data.teaching_mode === 'part-time'}
                                        onCheckedChange={() => setData('teaching_mode', 'part-time')}
                                        className="border-[#caced7] data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                    />
                                    <label htmlFor="mode-part-time" className="text-[16px] text-[#555] font-['Nunito'] cursor-pointer">
                                        Part-Time
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Student Age Group */}
                        <div className="flex flex-col gap-2 max-w-md">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Student Age Group
                            </label>
                            <Select
                                value={data.age_group}
                                onValueChange={(val) => setData('age_group', val)}
                            >
                                <SelectTrigger className="w-full h-[50px] rounded-[6px] border border-[#caced7] bg-white text-[#555] font-['Nunito']">
                                    <SelectValue placeholder="Select age group..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {AGE_GROUPS.map(age => (
                                        <SelectItem key={age} value={age} className="font-['Nunito']">{age}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Preferred Learning Times */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                    Preferred Learning Times
                                </label>
                                <p className="text-xs text-gray-500 font-['Nunito']">
                                    A correct time zone is essential to coordinate lessons with international students
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 mt-2">
                                {schedule.map((daySch) => (
                                    <div key={daySch.day} className="flex flex-col gap-3">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`pref-day-${daySch.day}`}
                                                checked={daySch.enabled}
                                                onCheckedChange={(checked) => handleDayToggle(daySch.day, checked as boolean)}
                                                className="border-[#caced7] data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                            />
                                            <label htmlFor={`pref-day-${daySch.day}`} className="text-[16px] text-[#333] font-['Nunito'] font-medium cursor-pointer">
                                                {daySch.day}
                                            </label>
                                        </div>

                                        {daySch.enabled && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-9">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[14px] text-[#555] font-['Nunito']">From</span>
                                                    <div className="relative">
                                                        <input
                                                            type="time"
                                                            value={daySch.from}
                                                            onChange={(e) => handleTimeChange(daySch.day, 'from', e.target.value)}
                                                            className="w-full h-[45px] rounded-[6px] border border-[#caced7] bg-white text-[#555] px-3 font-['Nunito']"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[14px] text-[#555] font-['Nunito']">To (1 Hour Duration)</span>
                                                    <div className="relative">
                                                        <input
                                                            type="time"
                                                            value={daySch.to}
                                                            disabled
                                                            className="w-full h-[45px] rounded-[6px] border border-[#caced7] bg-[#f9fafb] text-[#888] px-3 font-['Nunito'] cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="flex flex-col gap-2">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Additional Notes for Teacher
                            </label>
                            <Textarea
                                value={data.additional_notes}
                                onChange={(e) => setData('additional_notes', e.target.value)}
                                placeholder="Dedicated Quran teacher with 10+ years of experience..."
                                className="min-h-[100px] rounded-[12px] border-[#caced7] bg-white resize-none font-['Nunito'] p-4"
                            />
                        </div>

                        <div className="flex justify-end mt-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white font-['Nunito'] font-medium text-[16px] py-3 px-8 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50 shadow-lg"
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
