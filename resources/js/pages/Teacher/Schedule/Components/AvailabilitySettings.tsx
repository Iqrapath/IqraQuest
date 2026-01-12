import { Icon } from '@iconify/react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS: Record<string, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
    friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
const MAX_SLOTS_PER_DAY = 5;

interface TimeSlot {
    day: string;
    start: string;
    end: string;
}

// Calculate duration in minutes
const getSlotDuration = (start: string, end: string): number => {
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1] || '0');
    let endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1] || '0');
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;
    return endMinutes - startMinutes;
};

// Check if slot has valid duration (1 hour or less)
export const isSlotDurationValid = (slot: TimeSlot): boolean => {
    const duration = getSlotDuration(slot.start, slot.end);
    return duration > 0 && duration <= 60;
};

interface AvailabilitySettingsProps {
    slots: TimeSlot[];
    expandedDays: string[];
    isHolidayMode: boolean;
    isSaving: boolean;
    onToggleDay: (day: string) => void;
    onAddSlot: (day: string) => void;
    onRemoveSlot: (day: string, index: number) => void;
    onUpdateSlotTime: (day: string, index: number, field: 'start' | 'end', value: string) => void;
    onSave: () => void;
    onToggleHolidayMode: () => void;
    getDaySlots: (day: string) => TimeSlot[];
}

export function AvailabilitySettings({
    slots,
    expandedDays,
    isHolidayMode,
    isSaving,
    onToggleDay,
    onAddSlot,
    onRemoveSlot,
    onUpdateSlotTime,
    onSave,
    onToggleHolidayMode,
    getDaySlots
}: AvailabilitySettingsProps) {
    return (
        <div className="flex flex-col gap-[clamp(1.5rem,3vw,2rem)]">
            <div className="flex flex-col gap-2">
                <p className="font-['Nunito'] text-[clamp(0.875rem,1.5vw,1rem)] text-[#6b7280]">
                    Manage your teaching availability. Add up to {MAX_SLOTS_PER_DAY} time slots per day (1-hour max each).
                </p>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e5e7eb] w-fit shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isHolidayMode ? 'bg-[#fff9e9]' : 'bg-[#e4f7f4]'}`}>
                            <Icon
                                icon={isHolidayMode ? "mdi:beach" : "mdi:calendar-check"}
                                className={`h-5 w-5 ${isHolidayMode ? 'text-[#d97706]' : 'text-[#338078]'}`}
                            />
                        </div>
                        <span className="font-['Poppins'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-[#181818]">Holiday Mode</span>
                    </div>
                    <Switch checked={isHolidayMode} onCheckedChange={onToggleHolidayMode} />
                </div>
            </div>

            {isHolidayMode && (
                <div className="bg-[#fff9e9] border border-[#fde68a] rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Icon icon="mdi:alert-circle" className="h-5 w-5 text-[#d97706]" />
                    </div>
                    <div>
                        <p className="font-['Poppins'] font-medium text-[#92400e] text-sm mb-1">Holiday mode is active</p>
                        <p className="font-['Nunito'] text-sm text-[#92400e]/80">Students cannot book new sessions until you disable this. Existing bookings remain active.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h3 className="font-['Poppins'] font-bold text-[clamp(1.125rem,2.5vw,1.25rem)] text-[#1a1d56]">Available Days & Time Slots</h3>
                    <p className="font-['Nunito'] text-[clamp(0.875rem,1.5vw,0.95rem)] text-[#6b7280]">Enable the days you want to teach and define your preferred hours.</p>
                </div>

                <div className="grid gap-4">
                    {DAYS.map((day) => {
                        const isExpanded = expandedDays.includes(day);
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
                                        "flex items-center justify-between p-5 md:p-6 cursor-pointer transition-colors",
                                        isExpanded ? "bg-[#338078]/[0.02]" : "bg-white"
                                    )}
                                    onClick={() => onToggleDay(day)}
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
                                                {DAY_LABELS[day]}
                                            </span>
                                            {isExpanded && (
                                                <span className="text-[12px] text-[#338078] font-['Nunito'] font-semibold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#338078] animate-pulse" />
                                                    {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''} active
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Icon
                                            icon="mdi:chevron-down"
                                            className={cn(
                                                "w-6 h-6 text-[#1a1d56]/40 transition-transform duration-300 ease-out",
                                                isExpanded ? "rotate-180 text-[#338078]" : "group-hover:translate-y-1"
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Time Slots Content */}
                                {isExpanded && (
                                    <div className="px-5 pb-6 pt-2 md:px-8 md:pb-8 border-t border-dashed border-[#e5e7eb] bg-[#fafafa]/50">
                                        <div className="flex flex-col gap-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {daySlots.map((slot, idx) => (
                                                    <div
                                                        key={`${day}-${idx}`}
                                                        className="relative bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm hover:shadow-md transition-all group/slot animate-in fade-in zoom-in-95 duration-300"
                                                    >
                                                        {/* Slot Label & Remove */}
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="bg-[#e4f7f4] text-[#338078] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                Slot {idx + 1}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onRemoveSlot(day, idx);
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center text-[#ef4444]/60 hover:text-[#ef4444] hover:bg-red-50 rounded-full transition-all group-hover/slot:scale-110"
                                                                title="Remove slot"
                                                            >
                                                                <Icon icon="mdi:close" className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-col gap-3">
                                                            {/* Start Time */}
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2 text-[#6b7280]">
                                                                    <Icon icon="mdi:clock-start" className="w-3.5 h-3.5" />
                                                                    <span className="text-[11px] font-bold uppercase tracking-tight font-['Poppins']">Start Time</span>
                                                                </div>
                                                                <input
                                                                    type="time"
                                                                    value={slot.start}
                                                                    onChange={(e) => onUpdateSlotTime(day, idx, 'start', e.target.value)}
                                                                    className="w-full h-[46px] px-4 bg-white border border-[#ced4da] rounded-xl text-sm font-['Poppins'] font-medium focus:outline-none focus:ring-2 focus:ring-[#338078]/20 focus:border-[#338078] transition-all"
                                                                />
                                                            </div>

                                                            <div className="flex items-center justify-center py-1">
                                                                <div className="h-px bg-[#e5e7eb] flex-1" />
                                                                <div className="mx-3 text-[#338078]/30">
                                                                    <Icon icon="mdi:arrow-down" className="w-4 h-4" />
                                                                </div>
                                                                <div className="h-px bg-[#e5e7eb] flex-1" />
                                                            </div>

                                                            {/* End Time */}
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2 text-[#6b7280]">
                                                                    <Icon icon="mdi:clock-end" className="w-3.5 h-3.5" />
                                                                    <span className="text-[11px] font-bold uppercase tracking-tight font-['Poppins']">End Time</span>
                                                                </div>
                                                                <input
                                                                    type="time"
                                                                    value={slot.end}
                                                                    onChange={(e) => onUpdateSlotTime(day, idx, 'end', e.target.value)}
                                                                    className={cn(
                                                                        "w-full h-[46px] px-4 bg-white rounded-xl text-sm font-['Poppins'] font-medium focus:outline-none focus:ring-2 focus:ring-[#338078]/20 transition-all",
                                                                        !isSlotDurationValid(slot)
                                                                            ? "border-2 border-[#ef4444] shadow-sm shadow-red-100"
                                                                            : "border border-[#ced4da] focus:border-[#338078]"
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Error Badge */}
                                                        {!isSlotDurationValid(slot) && (
                                                            <div className="mt-3 flex items-center gap-1.5 text-[#ef4444] animate-bounce">
                                                                <Icon icon="mdi:alert" className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold font-['Nunito']">Max 1 hour session</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Add Slot Block */}
                                                {daySlots.length < MAX_SLOTS_PER_DAY && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAddSlot(day);
                                                        }}
                                                        className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-white/50 hover:bg-[#e4f7f4]/10 hover:border-[#338078]/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 group/add"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-[#f8f9fa] flex items-center justify-center mb-3 group-hover/add:bg-[#e4f7f4] group-hover/add:rotate-90 transition-all duration-500">
                                                            <Icon icon="mdi:plus" className="w-6 h-6 text-[#1a1d56]/30 group-hover/add:text-[#338078]" />
                                                        </div>
                                                        <span className="font-['Poppins'] font-bold text-sm text-[#1a1d56]/40 group-hover/add:text-[#338078]">Add Time Slot</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end pt-4 sticky bottom-4 z-10">
                <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="h-14 px-10 rounded-full bg-[#1a1d56] hover:bg-[#252a7a] text-white shadow-xl shadow-[#1a1d56]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="font-['Poppins'] font-bold text-base">{isSaving ? 'Saving Changes...' : 'Confirm Availability'}</span>
                    {!isSaving && <Icon icon="mdi:check-circle" className="w-5 h-5" />}
                    {isSaving && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                </Button>
            </div>
        </div>
    );
}
