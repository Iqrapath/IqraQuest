import { useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: any;
}

interface DaySchedule {
    day: string;
    from: string;
    to: string;
    enabled: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getTimeInMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function isValidDuration(start: string, end: string): boolean {
    if (!start || !end) return false;
    return getTimeInMinutes(end) - getTimeInMinutes(start) === 60;
}

function addOneHour(time: string): string {
    const minutes = getTimeInMinutes(time) + 60;
    const h = (Math.floor(minutes / 60) % 24).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function EditAvailabilityModal({ open, onOpenChange, teacher }: Props) {
    const getInitialSchedule = (): DaySchedule[] => {
        const stored = teacher.availability;
        let initial: DaySchedule[] = DAYS.map((day: string) => ({
            day,
            from: '09:00',
            to: '17:00',
            enabled: false
        }));

        if (Array.isArray(stored)) {
            initial = initial.map(d => {
                const found = stored.find((s: any) => s.day_of_week === d.day.toLowerCase());
                return found ? {
                    ...d,
                    from: found.start_time?.slice(0, 5) || '09:00',
                    to: found.end_time?.slice(0, 5) || '17:00',
                    enabled: true
                } : d;
            });
        }
        return initial;
    };

    const [schedule, setSchedule] = useState<DaySchedule[]>(getInitialSchedule());

    const { data, setData, post, processing, transform } = useForm({
        timezone: teacher.timezone || 'Africa/Lagos',
        teaching_mode: teacher.teaching_mode || 'part-time',
        availability: [] as any[], // Will be populated on submit
    });

    useEffect(() => {
        if (open) {
            setData({
                timezone: teacher.timezone || 'Africa/Lagos',
                teaching_mode: teacher.teaching_mode || 'part-time',
                availability: [],
            });
            setSchedule(getInitialSchedule());
        }
    }, [open, teacher]);

    const handleDayToggle = (day: string, checked: boolean) => {
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, enabled: checked } : d));
    };

    const handleTimeChange = (day: string, field: 'from' | 'to', value: string) => {
        if (field === 'to') return; // End time is now strictly calculated

        setSchedule(prev => prev.map(d => {
            if (d.day === day) {
                const newDay = { ...d, from: value };
                newDay.to = addOneHour(value);
                return newDay;
            }
            return d;
        }));
    };

    const convertTime12to24 = (time12h: string) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString();
        }
        return `${hours.padStart(2, '0')}:${minutes}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate 1 hour restriction
        const invalidDays = schedule.filter(d => d.enabled && !isValidDuration(d.from, d.to));
        if (invalidDays.length > 0) {
            const dayNames = invalidDays.map(d => d.day).join(', ');
            alert(`The following days must have at least a 1-hour duration: ${dayNames}`);
            return;
        }

        transform((data) => ({
            ...data,
            availability: schedule.filter(d => d.enabled).map(({ day, from, to }) => ({
                day_of_week: day.toLowerCase(),
                is_available: true,
                start_time: from,
                end_time: to
            }))
        }));

        post('/teacher/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Availability updated successfully');
                onOpenChange(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Failed to update availability');
            }
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
                                    Time Zone
                                </label>
                                <Select
                                    value={data.timezone}
                                    onValueChange={(val) => setData('timezone', val)}
                                >
                                    <SelectTrigger className="w-full h-[50px] rounded-[6px] border border-[#caced7] bg-white">
                                        <SelectValue placeholder="Select timezone..." />
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
                                    Availability Type
                                </label>
                                <div className="flex items-center gap-6 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="full-time"
                                            checked={data.teaching_mode === 'full-time'}
                                            onCheckedChange={() => setData('teaching_mode', 'full-time')}
                                        />
                                        <label htmlFor="full-time" className="text-[16px] text-[#555] font-['Nunito']">Full-Time</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="part-time"
                                            checked={data.teaching_mode === 'part-time'}
                                            onCheckedChange={() => setData('teaching_mode', 'part-time')}
                                        />
                                        <label htmlFor="part-time" className="text-[16px] text-[#555] font-['Nunito']">Part-Time</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="flex flex-col gap-4">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Available Days & Hours
                            </label>
                            <div className="flex flex-col gap-6 mt-2">
                                {schedule.map((daySch) => (
                                    <div key={daySch.day} className="flex flex-col gap-3">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`day-${daySch.day}`}
                                                checked={daySch.enabled}
                                                onCheckedChange={(checked) => handleDayToggle(daySch.day, checked as boolean)}
                                            />
                                            <label htmlFor={`day-${daySch.day}`} className="text-[16px] text-[#333] font-['Nunito'] font-medium">
                                                {daySch.day}
                                            </label>
                                        </div>

                                        {daySch.enabled && (
                                            <>
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 ml-0 sm:ml-9 mt-3 sm:mt-0">
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <span className="text-[14px] text-[#333] font-['Nunito']">From</span>
                                                        <input
                                                            type="time"
                                                            value={daySch.from}
                                                            onChange={(e) => handleTimeChange(daySch.day, 'from', e.target.value)}
                                                            className="w-full h-[45px] rounded-[6px] border border-[#caced7] px-3 font-['Nunito']"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <span className="text-[14px] text-[#333] font-['Nunito']">To</span>
                                                        <input
                                                            type="time"
                                                            value={daySch.to}
                                                            readOnly
                                                            className="w-full h-[45px] rounded-[6px] border border-[#caced7] px-3 font-['Nunito'] bg-[#f9fafb] text-[#9ca3af] cursor-not-allowed outline-none"
                                                            title="End time is automatically set to 1 hour after start time"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-[#338078] font-['Nunito'] ml-9 mt-1 italic">Duration is fixed at exactly 1 hour</p>
                                            </>
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
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
