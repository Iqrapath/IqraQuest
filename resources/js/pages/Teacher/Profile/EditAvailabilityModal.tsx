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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: any;
}

interface TimeSlot {
    day: string;
    start: string;
    end: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_SLOTS_PER_DAY = 5;

// Calculate duration in minutes between start and end time
const getSlotDuration = (start: string, end: string): number => {
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1] || '0');
    let endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1] || '0');
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;
    return endMinutes - startMinutes;
};

// Check if a slot has valid duration (1 hour or less, but more than 0)
const isSlotDurationValid = (slot: TimeSlot): boolean => {
    const duration = getSlotDuration(slot.start, slot.end);
    return duration > 0 && duration <= 60;
};

// Calculate end time (+1 hour from start)
const addOneHour = (time: string): string => {
    const hours = parseInt(time.split(':')[0]);
    const endHour = (hours + 1) % 24;
    return `${endHour.toString().padStart(2, '0')}:00`;
};

export default function EditAvailabilityModal({ open, onOpenChange, teacher }: Props) {
    const getInitialSlots = (): TimeSlot[] => {
        const stored = teacher.availability;
        if (!Array.isArray(stored) || stored.length === 0) return [];

        return stored.map((s: any) => ({
            day: (s.day_of_week || '').toLowerCase(),
            start: s.start_time?.slice(0, 5) || '09:00',
            end: s.end_time?.slice(0, 5) || '10:00'
        }));
    };

    const [slots, setSlots] = useState<TimeSlot[]>(getInitialSlots());
    const [expandedDays, setExpandedDays] = useState<string[]>(
        [...new Set(getInitialSlots().map(s => s.day))]
    );

    const { data, setData, post, processing, transform } = useForm({
        timezone: teacher.timezone || 'Africa/Lagos',
        teaching_mode: teacher.teaching_mode || 'part-time',
        availability: [] as any[],
    });

    useEffect(() => {
        if (open) {
            const initialSlots = getInitialSlots();
            setSlots(initialSlots);
            setExpandedDays([...new Set(initialSlots.map(s => s.day))]);
            setData({
                timezone: teacher.timezone || 'Africa/Lagos',
                teaching_mode: teacher.teaching_mode || 'part-time',
                availability: [],
            });
        }
    }, [open, teacher]);

    const getDaySlots = (day: string): TimeSlot[] => {
        return slots.filter(s => s.day === day.toLowerCase());
    };

    const toggleDay = (day: string) => {
        const dayLower = day.toLowerCase();
        const isExpanded = expandedDays.includes(dayLower);

        if (isExpanded) {
            setExpandedDays(expandedDays.filter(d => d !== dayLower));
            setSlots(slots.filter(s => s.day !== dayLower));
        } else {
            // Check part-time limit
            if (data.teaching_mode === 'part-time') {
                const uniqueDays = [...new Set(slots.map(s => s.day))];
                if (uniqueDays.length >= 3) {
                    toast.error('Part-time teachers can only select up to 3 days.');
                    return;
                }
            }

            setExpandedDays([...expandedDays, dayLower]);
            setSlots([...slots, { day: dayLower, start: '09:00', end: '10:00' }]);
        }
    };

    const addSlot = (day: string) => {
        const dayLower = day.toLowerCase();
        const daySlots = getDaySlots(day);

        if (daySlots.length >= MAX_SLOTS_PER_DAY) {
            toast.error(`Maximum ${MAX_SLOTS_PER_DAY} time slots per day.`);
            return;
        }

        // Find next available hour
        const usedStarts = daySlots.map(s => s.start);
        let startHour = 9;
        while (usedStarts.includes(`${startHour.toString().padStart(2, '0')}:00`) && startHour < 23) {
            startHour++;
        }
        const newStart = `${startHour.toString().padStart(2, '0')}:00`;
        const newEnd = addOneHour(newStart);

        setSlots([...slots, { day: dayLower, start: newStart, end: newEnd }]);
    };

    const removeSlot = (day: string, slotIndex: number) => {
        const dayLower = day.toLowerCase();
        const daySlots = getDaySlots(day);
        const otherSlots = slots.filter(s => s.day !== dayLower);

        daySlots.splice(slotIndex, 1);

        if (daySlots.length === 0) {
            setExpandedDays(expandedDays.filter(d => d !== dayLower));
        }

        setSlots([...otherSlots, ...daySlots]);
    };

    const updateSlotTime = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
        const dayLower = day.toLowerCase();
        const daySlots = getDaySlots(day);
        const globalIdx = slots.indexOf(daySlots[slotIndex]);

        const updated = slots.map((slot, idx) => {
            if (idx === globalIdx) {
                if (field === 'start') {
                    return { ...slot, start: value, end: addOneHour(value) };
                } else {
                    return { ...slot, end: value };
                }
            }
            return slot;
        });
        setSlots(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (slots.length === 0) {
            toast.error('Please add at least one time slot.');
            return;
        }

        // Check duration for all slots
        const invalidSlots = slots.filter(s => !isSlotDurationValid(s));
        if (invalidSlots.length > 0) {
            toast.error('Each time slot must be exactly 1 hour or less. Please adjust your end times.');
            return;
        }

        transform((data) => ({
            ...data,
            availability: slots.map(({ day, start, end }) => ({
                day_of_week: day,
                is_available: true,
                start_time: start,
                end_time: end
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
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-[#F8F9FA] rounded-[32px] max-h-[90vh] flex flex-col border-none shadow-2xl">
                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                    <DialogHeader className="mb-8 text-left">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#338078] rounded-2xl shadow-lg shadow-[#338078]/20">
                                    <Icon icon="mdi:calendar-clock" className="w-6 h-6 text-white" />
                                </div>
                                <DialogTitle className="font-['Poppins'] font-bold text-[28px] text-[#1a1d56]">
                                    Availability Settings
                                </DialogTitle>
                            </div>
                            <p className="text-[#6B7280] font-['Nunito'] text-base md:ml-[60px]">
                                Add up to {MAX_SLOTS_PER_DAY} time slots per day (1-hour max each)
                            </p>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                        {/* Timezone & Mode Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-[24px] border border-[#e5e7eb] shadow-sm">
                            <div className="flex flex-col gap-3">
                                <label className="font-['Poppins'] font-bold text-[16px] text-[#1a1d56] flex items-center gap-2">
                                    <Icon icon="mdi:earth" className="text-[#338078]" />
                                    Time Zone
                                </label>
                                <Select
                                    value={data.timezone}
                                    onValueChange={(val) => setData('timezone', val)}
                                >
                                    <SelectTrigger className="w-full h-[54px] rounded-xl border border-[#caced7] bg-white text-sm font-['Poppins'] focus:ring-2 focus:ring-[#338078]/20">
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

                            <div className="flex flex-col gap-3">
                                <label className="font-['Poppins'] font-bold text-[16px] text-[#1a1d56] flex items-center gap-2">
                                    <Icon icon="mdi:briefcase" className="text-[#338078]" />
                                    Teaching Mode
                                </label>
                                <div className="flex items-center gap-4 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setData('teaching_mode', 'full-time')}
                                        className={cn(
                                            "flex-1 h-[54px] rounded-xl border-2 flex items-center justify-center gap-2 font-['Poppins'] font-bold text-sm transition-all",
                                            data.teaching_mode === 'full-time'
                                                ? "bg-[#338078] border-[#338078] text-white shadow-lg shadow-[#338078]/20"
                                                : "bg-white border-[#e5e7eb] text-[#1a1d56]/60 hover:border-[#338078]/30"
                                        )}
                                    >
                                        Full-Time
                                    </button>
                                    {/* <button
                                        type="button"
                                        onClick={() => setData('teaching_mode', 'part-time')}
                                        className={cn(
                                            "flex-1 h-[54px] rounded-xl border-2 flex items-center justify-center gap-2 font-['Poppins'] font-bold text-sm transition-all",
                                            data.teaching_mode === 'part-time'
                                                ? "bg-[#338078] border-[#338078] text-white shadow-lg shadow-[#338078]/20"
                                                : "bg-white border-[#e5e7eb] text-[#1a1d56]/60 hover:border-[#338078]/30"
                                        )}
                                    >
                                        Part-Time
                                    </button> */}
                                </div>
                            </div>
                        </div>

                        {/* Schedule Section */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-['Poppins'] font-bold text-[20px] text-[#1a1d56]">Available Days & Hours</h3>
                                <p className="font-['Nunito'] text-[#6B7280]">Enable the days you want to teach and define your hours.</p>
                            </div>

                            <div className="grid gap-4">
                                {DAYS.map((day) => {
                                    const dayLower = day.toLowerCase();
                                    const isExpanded = expandedDays.includes(dayLower);
                                    const daySlots = getDaySlots(day);

                                    return (
                                        <div
                                            key={day}
                                            className={cn(
                                                "group transition-all duration-300 rounded-[24px] border border-[#e5e7eb] bg-white overflow-hidden",
                                                isExpanded ? "ring-2 ring-[#338078] ring-offset-2 shadow-xl" : "hover:shadow-md hover:border-[#338078]/30"
                                            )}
                                        >
                                            {/* Day Header */}
                                            <div
                                                className={cn(
                                                    "flex items-center justify-between p-5 cursor-pointer transition-colors",
                                                    isExpanded ? "bg-[#338078]/[0.02]" : "bg-white"
                                                )}
                                                onClick={() => toggleDay(day)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                                                            isExpanded ? "bg-[#338078] border-[#338078] scale-110 shadow-lg shadow-[#338078]/20" : "border-[#ced4da] bg-white"
                                                        )}
                                                    >
                                                        {isExpanded && <Icon icon="mdi:check" className="text-white w-4 h-4" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            "text-lg font-['Poppins'] font-bold capitalize transition-colors",
                                                            isExpanded ? "text-[#1a1d56]" : "text-[#1a1d56]/70"
                                                        )}>
                                                            {day}
                                                        </span>
                                                        {isExpanded && (
                                                            <span className="text-[12px] text-[#338078] font-['Nunito'] font-semibold flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#338078] animate-pulse" />
                                                                {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''} active
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Icon
                                                    icon="mdi:chevron-down"
                                                    className={cn(
                                                        "w-6 h-6 text-[#1a1d56]/40 transition-transform duration-300",
                                                        isExpanded ? "rotate-180 text-[#338078]" : ""
                                                    )}
                                                />
                                            </div>

                                            {/* Time Slots Content */}
                                            {isExpanded && (
                                                <div className="px-5 pb-6 pt-2 md:px-8 md:pb-8 border-t border-dashed border-[#e5e7eb] bg-[#fafafa]/50">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                                        {daySlots.map((slot, idx) => (
                                                            <div
                                                                key={`${day}-${idx}`}
                                                                className="relative bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm hover:shadow-md transition-all group/slot animate-in fade-in zoom-in-95 duration-300"
                                                            >
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <div className="bg-[#e4f7f4] text-[#338078] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                        Slot {idx + 1}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeSlot(day, idx);
                                                                        }}
                                                                        className="w-7 h-7 flex items-center justify-center text-[#ef4444]/60 hover:text-[#ef4444] hover:bg-red-50 rounded-full transition-all group-hover/slot:scale-110"
                                                                        title="Remove slot"
                                                                    >
                                                                        <Icon icon="mdi:close" className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex flex-col gap-3">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <div className="flex items-center gap-2 text-[#6b7280]">
                                                                            <Icon icon="mdi:clock-start" className="w-3.5 h-3.5" />
                                                                            <span className="text-[11px] font-bold uppercase tracking-tight font-['Poppins']">Start</span>
                                                                        </div>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.start}
                                                                            onChange={(e) => updateSlotTime(day, idx, 'start', e.target.value)}
                                                                            className="w-full h-[46px] px-4 bg-white border border-[#ced4da] rounded-xl text-sm font-['Poppins'] font-medium' focus:outline-none focus:ring-2 focus:ring-[#338078]/20 transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="flex flex-col gap-1.5">
                                                                        <div className="flex items-center gap-2 text-[#6b7280]">
                                                                            <Icon icon="mdi:clock-end" className="w-3.5 h-3.5" />
                                                                            <span className="text-[11px] font-bold uppercase tracking-tight font-['Poppins']">End</span>
                                                                        </div>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.end}
                                                                            onChange={(e) => updateSlotTime(day, idx, 'end', e.target.value)}
                                                                            className={cn(
                                                                                "w-full h-[46px] px-4 bg-white rounded-xl text-sm font-['Poppins'] font-medium focus:outline-none focus:ring-2 focus:ring-[#338078]/20 transition-all",
                                                                                !isSlotDurationValid(slot)
                                                                                    ? "border-2 border-[#ef4444] shadow-sm shadow-red-100"
                                                                                    : "border border-[#ced4da] focus:border-[#338078]"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {!isSlotDurationValid(slot) && (
                                                                    <div className="mt-3 flex items-center gap-1.5 text-[#ef4444] animate-bounce">
                                                                        <Icon icon="mdi:alert" className="w-3.5 h-3.5" />
                                                                        <span className="text-[10px] font-bold font-['Nunito']">Max 1 hour</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {daySlots.length < MAX_SLOTS_PER_DAY && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addSlot(day);
                                                                }}
                                                                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-white/50 hover:bg-[#e4f7f4]/10 hover:border-[#338078]/40 hover:scale-[1.02] transition-all group/add"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-[#f8f9fa] flex items-center justify-center mb-2 group-hover/add:bg-[#e4f7f4] transition-all">
                                                                    <Icon icon="mdi:plus" className="w-6 h-6 text-[#1a1d56]/20 group-hover/add:text-[#338078]" />
                                                                </div>
                                                                <span className="font-['Poppins'] font-bold text-xs text-[#1a1d56]/40 group-hover/add:text-[#338078]">Add Slot</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 md:p-8 bg-white border-t border-[#e5e7eb] flex justify-end gap-4 rounded-b-[32px]">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="px-8 h-[54px] rounded-full font-['Poppins'] font-bold text-sm text-[#1a1d56]/60 hover:text-[#1a1d56] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="px-10 h-[54px] rounded-full bg-[#338078] hover:bg-[#2a6b64] text-white font-['Poppins'] font-bold text-sm shadow-xl shadow-[#338078]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:check-circle" className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
