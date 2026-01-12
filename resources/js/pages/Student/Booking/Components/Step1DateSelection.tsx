import React from 'react';
import { Icon } from '@iconify/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TimeSlot {
    start: string;
    end: string;
    period: string;
    is_available: boolean;
    conflict?: string | Date[]; // Added conflict info
}

interface Step1Props {
    teacher: any;
    selectedDate: Date | null;
    currentMonth: Date;
    daysArray: number[];
    availableSlots: TimeSlot[];
    selectedSessions: any[]; // Changed from selectedTimeSlot
    selectedDuration: number;
    userTimeZone: string;
    isRecurring: boolean;
    occurrences: number;
    onMonthChange: (direction: number) => void;
    onDateClick: (day: number) => void;
    onTimeSlotToggle: (slot: TimeSlot) => void; // Changed handler
    onDurationChange: (duration: number) => void;
    onRecurrenceToggle: (checked: boolean) => void;
    onOccurrencesChange: (val: number) => void;
    onNext: () => void;
    getAvailabilitySummary: (schedule: any[]) => { days: string, time: string };
    formatTimePill: (time: string | null) => string;
    hideRecurrence?: boolean;
    hideDurationSelector?: boolean;
    nextButtonText?: string;
    // New Props for Cart Summary
    totalCost: { usd: number, ngn: number };
    sessionCount: number;
    currency: string;
}

export default function Step1DateSelection({
    teacher,
    selectedDate,
    currentMonth,
    daysArray,
    availableSlots,
    selectedSessions,
    selectedDuration,
    userTimeZone,
    isRecurring,
    occurrences,
    onMonthChange,
    onDateClick,
    onTimeSlotToggle,
    onDurationChange,
    onRecurrenceToggle,
    onOccurrencesChange,
    onNext,
    getAvailabilitySummary,
    formatTimePill,
    hideRecurrence = false,
    hideDurationSelector = false,
    nextButtonText = 'Continue',
    totalCost,
    sessionCount,
    currency
}: Step1Props) {

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Build Your Schedule</h1>
                    <p className="text-gray-500">Pick any days and times that work for you. You can mix multiple slots!</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100">
                        <img
                            src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                            alt={teacher.user.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium leading-none mb-1">Teaching with</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">{teacher.user.name}</p>
                    </div>
                </div>
            </div>

            <TooltipProvider>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* LEFT: Calendar & Settings */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Duration & Recurrence Controls */}
                        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-8">
                            {/* Duration Selector */}
                            {!hideDurationSelector && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-sm font-bold text-gray-900">Session Duration</label>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select One</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {[30, 45, 60].map(duration => (
                                            <button
                                                key={duration}
                                                onClick={() => onDurationChange(duration)}
                                                className={`
                                                flex-1 py-3 rounded-2xl text-sm font-bold transition-all border
                                                ${selectedDuration === duration
                                                        ? 'bg-[#358D83] text-white border-[#358D83] shadow-md'
                                                        : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'}
                                            `}
                                            >
                                                {duration} min
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recurrence Global Switch */}
                            {!hideRecurrence && (
                                <div className="pt-6 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${isRecurring ? 'bg-[#358D83]/10 text-[#358D83]' : 'bg-gray-100 text-gray-400'}`}>
                                                <Icon icon="mdi:calendar-refresh" className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Repeat Weekly</p>
                                                <p className="text-xs text-gray-400">Apply this pattern to future weeks</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => onRecurrenceToggle(!isRecurring)}
                                            className={`
                                                w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative
                                                ${isRecurring ? 'bg-[#358D83]' : 'bg-gray-200'}
                                            `}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>

                                    {isRecurring && (
                                        <div className="mt-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Duration: {occurrences} Weeks</span>
                                                <span className="text-xs font-bold text-[#358D83]">
                                                    {(() => {
                                                        if (!selectedDate) return '';
                                                        const d = new Date(selectedDate);
                                                        d.setDate(d.getDate() + ((occurrences - 1) * 7));
                                                        return `Ends ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                                                    })()}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="2"
                                                max="12"
                                                value={occurrences}
                                                onChange={(e) => onOccurrencesChange(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#358D83]"
                                            />
                                            <div className="flex justify-between mt-2 text-[10px] text-gray-300 font-bold uppercase">
                                                <span>2w</span>
                                                <span>6w</span>
                                                <span>12w</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Calendar Card */}
                        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-bold text-gray-900">Choose Dates</h4>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onMonthChange(-1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
                                        <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm font-bold text-gray-700 min-w-[120px] text-center">
                                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button onClick={() => onMonthChange(1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
                                        <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 text-center mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={`${d}-${i}`} className="text-[10px] font-bold text-gray-300 py-2 uppercase tracking-widest">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {(() => {
                                    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                                    return [...Array(startDay)].map((_, i) => <div key={`empty-${i}`} />);
                                })()}

                                {daysArray.map(day => {
                                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    const dayOfWeekName = date.toLocaleDateString('en-US', { weekday: 'long' });

                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const isPastDate = date < today;

                                    const isWorkingDay = teacher.availability_schedule.some((s: any) =>
                                        s.day_of_week.toLowerCase() === dayOfWeekName.toLowerCase() && s.is_available
                                    );

                                    const isAvailableDay = !isPastDate && isWorkingDay;

                                    // Count how many slots selected for this day
                                    const selectedOnThisDay = selectedSessions.filter(s => s.date.toDateString() === date.toDateString()).length;

                                    const DayButton = (
                                        <button
                                            disabled={!isAvailableDay}
                                            onClick={() => onDateClick(day)}
                                            className={`
                                                    relative h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-sm font-bold transition-all
                                                    ${isSelected
                                                    ? 'bg-[#358D83] text-white shadow-lg'
                                                    : isAvailableDay
                                                        ? 'text-gray-900 hover:bg-teal-50 hover:text-[#358D83]'
                                                        : 'text-gray-200 cursor-not-allowed'}
                                                    ${isToday && !isSelected ? 'border border-[#358D83] text-[#358D83]' : ''}
                                                `}
                                        >
                                            {day}
                                            {selectedOnThisDay > 0 && (
                                                <div className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-orange-500 text-white rounded-full text-[9px] flex items-center justify-center font-black border-2 border-white">
                                                    {selectedOnThisDay}
                                                </div>
                                            )}
                                        </button>
                                    );

                                    if (!isAvailableDay) {
                                        return (
                                            <Tooltip key={day}>
                                                <TooltipTrigger asChild>
                                                    <span className="flex justify-center cursor-not-allowed opacity-40">{DayButton}</span>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-800 text-white border-0 text-xs">
                                                    <p>{isPastDate ? "Cannot book past dates" : `Teacher unavailable on ${dayOfWeekName}s`}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    }

                                    return <div key={day} className="flex justify-center">{DayButton}</div>;
                                })}
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Slot Selection */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Select Slots</h3>
                                    <p className="text-sm text-gray-400">
                                        Showing {formatTimePill('00:00')} - {formatTimePill('23:59')} in {userTimeZone.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#358D83]">
                                        {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-400">{availableSlots.length} slots available</p>
                                </div>
                            </div>

                            {availableSlots.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Icon icon="mdi:calendar-remove" className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="font-bold">No slots available for this date</p>
                                    <p className="text-sm">Try another duration or date</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {['Morning', 'Afternoon', 'Evening'].map(period => {
                                        const periodSlots = availableSlots.filter(s => s.period === period.toLowerCase());
                                        if (periodSlots.length === 0) return null;
                                        return (
                                            <div key={period}>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Icon
                                                        icon={period === 'Morning' ? 'ph:sun-dim-bold' : period === 'Afternoon' ? 'ph:sun-bold' : 'ph:moon-bold'}
                                                        className="w-4 h-4 text-gray-300"
                                                    />
                                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{period}</h5>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {periodSlots.map((slot, index) => {
                                                        const isSelectedInCart = selectedSessions.some(s =>
                                                            s.date.toDateString() === selectedDate?.toDateString() && s.start === slot.start
                                                        );

                                                        // Handle Conflicts (Recurring conflicts or past slots)
                                                        const isConflict = slot.conflict !== undefined && slot.conflict !== 'selected';
                                                        const isBooked = slot.conflict === 'booked';
                                                        const isPast = slot.conflict === 'past';

                                                        const SlotButton = (
                                                            <button
                                                                key={index}
                                                                onClick={() => onTimeSlotToggle(slot)}
                                                                className={`
                                                                    relative group px-4 py-4 rounded-2xl text-sm font-bold border transition-all text-left w-full
                                                                    ${isSelectedInCart
                                                                        ? 'bg-[#E0F2F1] border-[#358D83] text-[#358D83] shadow-sm'
                                                                        : (isBooked || isPast)
                                                                            ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                                                                            : isConflict
                                                                                ? 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed'
                                                                                : 'bg-white border-gray-100 text-gray-600 hover:border-[#358D83] hover:text-[#358D83]'}
                                                                `}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold leading-none mb-1">{formatTimePill(slot.start)}</span>
                                                                    <span className="text-[10px] opacity-60 font-medium">{formatTimePill(slot.end)}</span>
                                                                </div>

                                                                {/* Selection Marker */}
                                                                {isSelectedInCart && (
                                                                    <div className="absolute top-3 right-3 h-5 w-5 bg-[#358D83] rounded-full flex items-center justify-center">
                                                                        <Icon icon="mdi:check" className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}

                                                                {/* Conflict Marker */}
                                                                {isBooked && (
                                                                    <div className="absolute top-3 right-3 text-gray-400">
                                                                        <Icon icon="mdi:lock" className="w-4 h-4" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );

                                                        if (isBooked || isPast || (isConflict && !isSelectedInCart)) {
                                                            let tooltipMsg = "Already booked";
                                                            if (isPast) tooltipMsg = "This time has passed";
                                                            else if (Array.isArray(slot.conflict)) {
                                                                tooltipMsg = `Conflict on ${slot.conflict[0].toLocaleDateString()}${slot.conflict.length > 1 ? ` (+${slot.conflict.length - 1} more)` : ''}`;
                                                            }

                                                            return (
                                                                <Tooltip key={index}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="w-full">{SlotButton}</div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-gray-800 text-white border-0 text-xs shadow-xl rounded-xl py-2 px-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <Icon icon={isPast ? "mdi:clock-alert" : "mdi:clock-alert"} className={`w-3 h-3 ${isPast ? 'text-amber-400' : 'text-red-400'}`} />
                                                                            <span>{tooltipMsg}</span>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            );
                                                        }

                                                        return SlotButton;
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TooltipProvider>

            {/* FLOATING CART SUMMARY BAR */}
            <div className={`
                fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-50 transition-all duration-500
                ${selectedSessions.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
            `}>
                <div className="flex items-center justify-between pl-8 pr-2 py-2">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Schedule</span>
                            <span className="text-xl font-black text-gray-900 leading-none">
                                {sessionCount} <span className="text-sm font-bold text-gray-500">Sessions</span>
                            </span>
                        </div>

                        <div className="h-8 w-px bg-gray-100" />

                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Final Cost</span>
                            <span className="text-xl font-black text-[#358D83] leading-none">
                                {currency === 'USD' ? '$' : '₦'}{(currency === 'USD' ? totalCost.usd : totalCost.ngn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mini Preview of selected days */}
                        <div className="hidden md:flex items-center gap-1 mr-4">
                            {selectedSessions.slice(0, 3).map((s, i) => (
                                <div key={i} className="h-10 w-10 rounded-full bg-teal-50 border border-teal-100 flex flex-col items-center justify-center text-[#358D83] overflow-hidden">
                                    <span className="text-[8px] font-black uppercase leading-none">{s.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    <span className="text-[10px] font-bold">{s.start}</span>
                                </div>
                            ))}
                            {selectedSessions.length > 3 && (
                                <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold font-primary">
                                    +{selectedSessions.length - 3}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={onNext}
                            className="bg-[#358D83] hover:bg-[#2b756d] text-white px-10 py-4 rounded-[32px] font-black text-sm shadow-lg shadow-teal-900/10 transition-all active:scale-95 flex items-center gap-3"
                        >
                            Confirm Selection
                            <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
