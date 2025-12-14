import React from 'react';
import { Icon } from '@iconify/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TimeSlot {
    start: string;
    end: string;
    period: string; // 'morning' | 'afternoon' | 'evening'
    is_available: boolean;
}

interface Step1Props {
    teacher: any;
    selectedDate: Date | null;
    currentMonth: Date;
    daysArray: number[];
    availableSlots: TimeSlot[];
    selectedTimeSlot: TimeSlot | null;
    selectedDuration: number;
    userTimeZone: string;
    isRecurring: boolean;
    occurrences: number;
    // Handlers
    onMonthChange: (direction: number) => void;
    onDateClick: (day: number) => void;
    onTimeSlotSelect: (slot: TimeSlot) => void;
    onDurationChange: (duration: number) => void;
    onRecurrenceToggle: (checked: boolean) => void;
    onOccurrencesChange: (val: number) => void;
    onNext: () => void;
    // Helpers (passed down or redefined? Better to redefine if simple, or keep pure)
    getAvailabilitySummary: (schedule: any[]) => { days: string, time: string };
    formatTimePill: (time: string | null) => string;
}

export default function Step1DateSelection({
    teacher,
    selectedDate,
    currentMonth,
    daysArray,
    availableSlots,
    selectedTimeSlot,
    selectedDuration,
    userTimeZone,
    isRecurring,
    occurrences,
    onMonthChange,
    onDateClick,
    onTimeSlotSelect,
    onDurationChange,
    onRecurrenceToggle,
    onOccurrencesChange,
    onNext,
    getAvailabilitySummary,
    formatTimePill
}: Step1Props) {

    return (
        <div className="">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Class</h1>
            <p className="text-gray-500 mb-8">You're booking a session with <span className="font-medium text-gray-700">{teacher.user.name}</span></p>

            {/* Teacher Profile Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                {/* Left Column: Avatar & Verify Badge */}
                <div className="flex flex-col items-center gap-3">
                    <div className="h-40 w-40 rounded-[32px] overflow-hidden border-2 border-white shadow-sm">
                        <img
                            src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                            alt={teacher.user.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                        <div className="bg-[#2D8E81] rounded-full p-0.5"><Icon icon="mdi:check" className="w-3 h-3 text-white" /></div>
                        <span>Certified Quran Tutor</span>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 pt-2">
                    <h2 className="text-3xl font-primary font-bold text-gray-900 mb-2">{teacher.user.name}</h2>

                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <Icon icon="ph:user" className="w-5 h-5" />
                        <span className="text-lg">{teacher.city || teacher.location}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-[#FFB800]">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Icon key={i} icon="mdi:star" className={i <= Math.round(teacher.average_rating) ? "w-5 h-5" : "w-5 h-5 text-gray-200"} />
                            ))}
                        </div>
                        <span className="text-gray-500 font-medium text-lg">{Number(teacher.average_rating || 0).toFixed(1)}/5 from {teacher.total_reviews} Students</span>
                    </div>

                    <div className="text-gray-700 text-lg mb-4">
                        <span className="text-gray-400 font-normal">Subjects Taught: </span>
                        <span className="font-medium text-gray-800">{teacher.subjects.map((s: any) => s.name).join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-lg">Availability:</span>
                        <div className="bg-[#FFF9EA] px-4 py-2 rounded-lg flex items-center gap-4 text-[#2D8E81] text-lg font-medium">
                            <span>{getAvailabilitySummary(teacher.availability_schedule).days}</span>
                            <span className="text-gray-300">|</span>
                            <span>{getAvailabilitySummary(teacher.availability_schedule).time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions Alert */}
            <Alert className="mb-8 border-[#00A991] bg-[#E0F2F1] text-[#004D40]">
                <Icon icon="mdi:information-outline" className="h-5 w-5 !text-[#00796B]" />
                <AlertTitle className="text-[#00796B] font-bold">How to Book</AlertTitle>
                <AlertDescription className="text-[#00695C]">
                    1. Select a generic date from the calendar on the left.<br />
                    2. Choose an available time slot from the list on the right.
                </AlertDescription>
            </Alert>

            <TooltipProvider>
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {/* Left Column: Calendar */}
                    <div className="w-full lg:w-1/2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 font-primary">Select Date</h3>
                        <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => onMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <Icon icon="mdi:chevron-left" className="w-6 h-6" />
                                </button>
                                <h4 className="text-lg font-bold text-gray-900">
                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </h4>
                                <button onClick={() => onMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <Icon icon="mdi:chevron-right" className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 text-center mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-xs font-semibold text-gray-400 py-2">{d}</div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Empty cells for start of month offset */}
                                {(() => {
                                    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                                    return [...Array(startDay)].map((_, i) => <div key={`empty-${i}`} />);
                                })()}

                                {daysArray.map(day => {
                                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                    const isToday = new Date().toDateString() === date.toDateString();

                                    // Check availability for this specific day of week (0-6)
                                    const dayOfWeekName = date.toLocaleDateString('en-US', { weekday: 'long' });

                                    // Check if date is in the past
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const isPastDate = date < today;

                                    const isWorkingDay = teacher.availability_schedule.some((s: any) =>
                                        s.day_of_week.toLowerCase() === dayOfWeekName.toLowerCase() && s.is_available
                                    );

                                    const isAvailableDay = !isPastDate && isWorkingDay;

                                    const DayButton = (
                                        <button
                                            disabled={!isAvailableDay}
                                            onClick={() => onDateClick(day)}
                                            className={`
                                                    h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all
                                                    ${isSelected
                                                    ? 'bg-[#00A991] text-white font-bold shadow-md'
                                                    : isAvailableDay
                                                        ? 'text-gray-900 hover:bg-gray-100'
                                                        : 'text-gray-300 cursor-not-allowed'}
                                                    ${isToday && !isSelected ? 'border border-[#00A991] text-[#00A991]' : ''}
                                                    ${!isAvailableDay && !isPastDate ? 'bg-gray-50' : ''} 
                                                `}
                                        >
                                            {day}
                                        </button>
                                    );

                                    if (!isAvailableDay) {
                                        let tooltipText = "";
                                        if (isPastDate) {
                                            tooltipText = "Cannot book dates in the past";
                                        } else if (!isWorkingDay) {
                                            tooltipText = `Teacher is not available on ${dayOfWeekName}s`;
                                        }

                                        return (
                                            <Tooltip key={day}>
                                                <TooltipTrigger asChild>
                                                    <span className="flex justify-center cursor-not-allowed opacity-75">{DayButton}</span>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-800 text-white border-0 text-xs">
                                                    <p>{tooltipText}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    }

                                    return <div key={day} className="flex justify-center">{DayButton}</div>;
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Time Slots */}
                    <div className="w-full lg:w-1/2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 font-primary mb-0">Select Time</h3>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                <Icon icon="mdi:world" className="w-4 h-4" />
                                {userTimeZone.replace(/_/g, ' ')}
                            </div>
                        </div>

                        {/* Duration Selector */}
                        <div className="mb-6">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Session Duration</label>
                            <div className="flex gap-2">
                                {[30, 45, 60].map(duration => (
                                    <button
                                        key={duration}
                                        onClick={() => onDurationChange(duration)}
                                        className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all border
                                        ${selectedDuration === duration
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                                    `}
                                    >
                                        {duration} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recurrence (Enterprise Feature) - Moved to Step 1 */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 relative overflow-hidden">
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    id="recurring-toggle-step1"
                                    checked={isRecurring}
                                    onChange={(e) => onRecurrenceToggle(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-[#358D83] border-gray-300 rounded focus:ring-[#358D83]"
                                />
                                <div className="flex-1">
                                    <label htmlFor="recurring-toggle-step1" className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                                        <span>Repeat Weekly</span>
                                        {isRecurring && <span className="text-[10px] bg-[#358D83] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>}
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Book this slot for multiple weeks.</p>
                                </div>
                            </div>

                            {isRecurring && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2 border-t border-gray-200 pt-4">
                                    <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
                                        Duration: {occurrences} Weeks
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="2"
                                            max="12"
                                            value={occurrences}
                                            onChange={(e) => onOccurrencesChange(parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#358D83]"
                                        />
                                        <div className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded border">
                                            {occurrences}w
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Ends on: {(() => {
                                            if (!selectedDate) return 'Select a date';
                                            const d = new Date(selectedDate);
                                            d.setDate(d.getDate() + ((occurrences - 1) * 7));
                                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        })()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm min-h-[400px]">
                            {!selectedDate ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Icon icon="mdi:calendar-blank-outline" className="w-12 h-12 mb-2 opacity-50" />
                                    <p>Please select a date first</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-gray-500 font-medium border-b border-gray-100 pb-2">
                                        Available slots for <span className="text-gray-900 font-bold">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                    </p>

                                    {availableSlots.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">No available slots for this date.</div>
                                    ) : (
                                        <>
                                            {/* Group by Period */}
                                            {['Morning', 'Afternoon', 'Evening'].map(period => {
                                                const periodSlots = availableSlots.filter(s => s.period === period.toLowerCase());
                                                if (periodSlots.length === 0) return null;
                                                return (
                                                    <div key={period}>
                                                        <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{period}</h5>
                                                        <div className="flex flex-wrap gap-3">
                                                            {periodSlots.map((slot, index) => {
                                                                const isSelected = selectedTimeSlot?.start === slot.start;
                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => onTimeSlotSelect(slot)}
                                                                        className={`
                                                                        px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                                                                        ${isSelected
                                                                                ? 'bg-[#358D83] text-white border-[#358D83] shadow-md'
                                                                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#358D83] hover:text-[#358D83]'}
                                                                    `}
                                                                    >
                                                                        {formatTimePill(slot.start)} - {formatTimePill(slot.end)}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TooltipProvider>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-16 border-t border-dashed border-gray-200 pt-8">
                <button
                    className="px-10 py-3 rounded-full border border-[#358D83] text-[#358D83] font-bold text-lg hover:bg-teal-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onNext}
                    disabled={!selectedDate || !selectedTimeSlot}
                    className={`
                        px-10 py-3 rounded-full font-bold text-lg shadow-lg transition-all
                        ${selectedDate && selectedTimeSlot
                            ? 'bg-[#358D83] text-white hover:bg-[#2b756d]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
