import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: any;
}

interface DaySchedule {
    day: string;
    from: string;
    to: string;
    enabled: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${ampm}`;
});

export default function EditDetailsModal({ open, onOpenChange, student }: Props) {
    // Helper to parse existing preferred_days JSON or create default structure
    const getInitialSchedule = (): DaySchedule[] => {
        const stored = student.preferred_days;
        // If stored is array of strings (old format), convert. If array of objects (new), use.
        // Or if null, default.

        let initial: DaySchedule[] = DAYS.map(day => ({ day, from: '9:00 AM', to: '5:00 PM', enabled: false }));

        if (Array.isArray(stored)) {
            // Check if it's new format (objects) or old (strings)
            if (stored.length > 0 && typeof stored[0] === 'string') {
                // Convert old format string array ['Monday'] to enabled days
                initial = initial.map(d => ({
                    ...d,
                    enabled: stored.includes(d.day)
                }));
            } else if (stored.length > 0 && typeof stored[0] === 'object') {
                // Merge stored objects
                initial = initial.map(d => {
                    const found = stored.find((s: any) => s.day === d.day);
                    return found ? { ...d, ...found, enabled: true } : d;
                });
            }
        }
        return initial;
    };

    const [schedule, setSchedule] = useState<DaySchedule[]>(getInitialSchedule());

    const { data, setData, post, processing, transform } = useForm({
        timezone: student.timezone || 'Africa/Lagos',
        availability_type: student.availability_type || 'Part-Time',
        preferred_days: [] as any[], // Will be populated on submit
    });

    useEffect(() => {
        if (open) {
            setData({
                timezone: student.timezone || 'Africa/Lagos',
                availability_type: student.availability_type || 'Part-Time',
                preferred_days: [],
            });
            setSchedule(getInitialSchedule());
        }
    }, [open, student]);

    const handleDayToggle = (day: string, checked: boolean) => {
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, enabled: checked } : d));
    };

    const handleTimeChange = (day: string, field: 'from' | 'to', value: string) => {
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pack enabled days into preferred_days

        // We need to use 'data' in post, but setData is async. 
        // Inertia useForm 'transform' or just manual data object in post.
        // Let's use manual data object in post options or setData first inside a standard form submission?
        // useForm's post uses current 'data'.
        // Better: update data then post? No, state update lag.
        // Use transform!

        transform((data) => ({
            ...data,
            preferred_days: schedule.filter(d => d.enabled).map(({ day, from, to }) => ({ day, from, to }))
        }));

        post('/student/profile', {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white rounded-[20px] max-h-[90vh] flex flex-col">
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <DialogHeader className="mb-6 text-left">
                        <div>
                            <DialogTitle className="font-['Nunito'] font-bold text-[24px] text-[#1a1d56]">
                                Availability & Time Zone
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        {/* Timezone & Mode Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                    Set your Time Zone
                                </label>
                                <p className="text-[#818181] text-[12px] font-['Nunito'] mb-2">
                                    A correct time zone is essential to coordinate lessons with international students
                                </p>
                                <Select
                                    value={data.timezone}
                                    onValueChange={(val) => setData('timezone', val)}
                                >
                                    <SelectTrigger className="w-full h-[50px] rounded-[6px] border border-[#caced7] bg-white">
                                        <SelectValue placeholder="Select one option..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Africa/Lagos">GMT+1 (Nigeria)</SelectItem>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="America/New_York">EST (New York)</SelectItem>
                                        <SelectItem value="Europe/London">GMT (London)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                    Teaching Mode
                                </label>
                                <p className="text-[#818181] text-[12px] font-['Nunito'] mb-2">
                                    Max 6 hrs/day for full-time, 3 hrs/day for part-time
                                </p>
                                <div className="flex items-center gap-6 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="full-time"
                                            checked={data.availability_type === 'Full-Time'}
                                            onCheckedChange={() => setData('availability_type', 'Full-Time')}
                                            className="w-6 h-6 rounded-[6px] border-[#818181] aria-checked:bg-[#338078] aria-checked:border-[#338078]"
                                        />
                                        <label htmlFor="full-time" className="text-[16px] text-[#555] font-['Nunito']">
                                            Full-Time
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="part-time"
                                            checked={data.availability_type === 'Part-Time'}
                                            onCheckedChange={() => setData('availability_type', 'Part-Time')}
                                            className="w-6 h-6 rounded-[6px] border-[#818181] aria-checked:bg-[#338078] aria-checked:border-[#338078]"
                                        />
                                        <label htmlFor="part-time" className="text-[16px] text-[#555] font-['Nunito']">
                                            Part-Time
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                    Select Your Learning Time
                                </label>
                                <p className="text-[#818181] text-[12px] font-['Nunito']">
                                    A correct time zone is essential to coordinate lessons with international students
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 mt-2">
                                {schedule.map((daySch) => (
                                    <div key={daySch.day} className="flex flex-col gap-3">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`day-${daySch.day}`}
                                                checked={daySch.enabled}
                                                onCheckedChange={(checked) => handleDayToggle(daySch.day, checked as boolean)}
                                                className="w-6 h-6 rounded-[6px] border-[#818181] aria-checked:bg-[#338078] aria-checked:border-[#338078]"
                                            />
                                            <label htmlFor={`day-${daySch.day}`} className="text-[16px] text-[#333] font-['Nunito'] font-medium">
                                                {daySch.day}
                                            </label>
                                        </div>

                                        {daySch.enabled && (
                                            <div className="flex items-center gap-4 ml-9">
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <span className="text-[14px] text-[#333] font-['Nunito']">From</span>
                                                    <Select
                                                        value={daySch.from}
                                                        onValueChange={(val) => handleTimeChange(daySch.day, 'from', val)}
                                                    >
                                                        <SelectTrigger className="w-full h-[45px] rounded-[6px] border-[#caced7]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {TIME_OPTIONS.map(time => (
                                                                <SelectItem key={`from-${time}`} value={time}>{time}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <span className="text-[14px] text-[#333] font-['Nunito']">To</span>
                                                    <Select
                                                        value={daySch.to}
                                                        onValueChange={(val) => handleTimeChange(daySch.day, 'to', val)}
                                                    >
                                                        <SelectTrigger className="w-full h-[45px] rounded-[6px] border-[#caced7]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {TIME_OPTIONS.map(time => (
                                                                <SelectItem key={`to-${time}`} value={time}>{time}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
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
