import { useForm } from '@inertiajs/react';
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
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${ampm}`;
});

export default function EditAvailabilityModal({ open, onOpenChange, teacher }: Props) {
    const getInitialSchedule = (): DaySchedule[] => {
        const stored = teacher.availability;
        let initial: DaySchedule[] = DAYS.map(day => ({
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
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d));
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

        transform((data) => ({
            ...data,
            availability: schedule.filter(d => d.enabled).map(({ day, from, to }) => ({
                day_of_week: day.toLowerCase(),
                is_available: true,
                start_time: convertTime12to24(from), // Convert UI 12h time to DB 24h time if needed, or keeping it as selected if logic inside handles it.
                // NOTE: Actually TIME_OPTIONS are in 12h format "9:00 AM". DB expects H:i. Need conversion.
                // Simple conversion for now:
                end_time: convertTime12to24(to)
            }))
        }));

        post('/teacher/profile', {
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
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 ml-0 sm:ml-9 mt-3 sm:mt-0">
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
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
