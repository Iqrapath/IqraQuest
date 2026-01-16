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

    const availabilitySummary = getAvailabilitySummary(teacher.availability_schedule);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36">
            {/* Redesigned Header: Teacher Profile Card */}
            <div className="bg-white rounded-[clamp(1.5rem,3vw,2rem)] p-[clamp(1.25rem,2.5vw,2rem)] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    {/* Left: Avatar & Badge */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative p-1 bg-gradient-to-br from-[#358D83] to-teal-100 rounded-[clamp(1rem,2vw,1.5rem)]">
                            <div className="h-[clamp(5rem,10vw,7.5rem)] w-[clamp(5rem,10vw,7.5rem)] rounded-[clamp(0.875rem,2vw,1.375rem)] overflow-hidden border-2 border-white shadow-sm bg-gray-50">
                                <img
                                    src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                                    alt={teacher.user.name}
                                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                                />
                            </div>
                        </div>
                        {teacher.status === 'approved' && (
                            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-teal-50 text-[#358D83] rounded-full border border-teal-100">
                                <Icon icon="qlementine-icons:certified-filled-16" className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Certified Quran Tutor</span>
                            </div>
                        )}
                    </div>

                    {/* Middle: Info Details */}
                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <div className="space-y-1">
                            <h1 className="font-['Poppins'] font-bold text-[clamp(1.5rem,2.5vw,2.25rem)] text-gray-900 leading-tight">
                                {teacher.user.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="stash:location-light" className="w-4 h-4 text-[#358D83]" />
                                    <span className="text-sm font-medium">{teacher.city || 'Online'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Icon
                                                key={star}
                                                icon="material-symbols:star-rounded"
                                                className={`w-4 h-4 ${star <= Math.round(teacher.average_rating) ? 'text-orange-400' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{teacher.average_rating.toFixed(1)}/5</span>
                                    <span className="text-xs text-gray-400">({teacher.total_reviews} Students)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">Subjects Taught:</span>
                            {teacher.subjects.map((subject: any) => (
                                <span
                                    key={subject.id}
                                    className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold border border-transparent hover:border-teal-100 hover:text-[#358D83] transition-colors"
                                >
                                    {subject.name}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Availability:</span>
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#F6FAF9] rounded-xl border border-[#E0F2F1]">
                                <span className="text-sm font-bold text-[#338078]">{availabilitySummary.days}</span>
                                <div className="h-3 w-px bg-teal-100" />
                                <span className="text-sm font-bold text-[#338078]">{availabilitySummary.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <TooltipProvider>
                {/* 2. UNIFIED SELECTION CARD */}
                <div className="bg-white rounded-[clamp(1.5rem,3vw,2.5rem)] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden relative">


                    {/* A. PREFERENCES BAR (Top of card) */}
                    <div className="bg-gray-50/50 border-b border-gray-100 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Duration */}
                            {!hideDurationSelector && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Session Length</h4>
                                    <div className="flex gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                        {[30, 45, 60].map(duration => (
                                            <button
                                                key={duration}
                                                onClick={() => onDurationChange(duration)}
                                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${selectedDuration === duration ? 'bg-[#358D83] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {duration}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="hidden sm:block h-8 w-px bg-gray-200" />

                            {/* Recurrence */}
                            {!hideRecurrence && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Learning Frequency</h4>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                            <button
                                                onClick={() => onRecurrenceToggle(false)}
                                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${!isRecurring ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                <Icon icon="ph:bookmark-simple-bold" className="w-3.5 h-3.5" />
                                                <span>Single</span>
                                            </button>
                                            <button
                                                onClick={() => onRecurrenceToggle(true)}
                                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${isRecurring ? 'bg-[#358D83] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                <Icon icon="ph:repeat-bold" className="w-3.5 h-3.5" />
                                                <span>Weekly</span>
                                            </button>
                                        </div>

                                        {isRecurring && (
                                            <div className="flex items-center gap-4 bg-[#F6FAF9] px-4 py-2 rounded-xl border border-[#E0F2F1] animate-in slide-in-from-left-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-[#358D83] font-black leading-none mb-1">{occurrences} Weeks</span>
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Period</span>
                                                </div>
                                                <input
                                                    type="range" min="2" max="12" value={occurrences}
                                                    onChange={(e) => onOccurrencesChange(parseInt(e.target.value))}
                                                    className="w-24 h-1.5 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-[#358D83]"
                                                />
                                                {selectedDate && (
                                                    <div className="flex flex-col items-end border-l border-teal-100 pl-4">
                                                        <span className="text-[9px] font-black text-teal-700 leading-none mb-1 text-right">
                                                            {(() => {
                                                                const d = new Date(selectedDate);
                                                                d.setDate(d.getDate() + ((occurrences - 1) * 7));
                                                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                            })()}
                                                        </span>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase text-right">Until</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Count Indicator */}
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#358D83] rounded-2xl text-white shadow-lg w-fit">
                            <Icon icon="ph:list-checks-bold" className="w-5 h-5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black opacity-80 uppercase leading-none mb-1">Selections</span>
                                <span className="text-sm font-black leading-none">{selectedSessions.length} Slots</span>
                            </div>
                        </div>
                    </div>

                    {/* B. MAIN SELECTION AREA (Side-by-Side on XL) */}
                    <div className="flex flex-col xl:flex-row h-auto xl:h-[750px] divide-y xl:divide-y-0 xl:divide-x divide-gray-100">
                        {/* LEFT HALF: CALENDAR */}
                        <div className="xl:w-[420px] lg:w-[380px] w-full p-8 bg-white shrink-0 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <Icon icon="ph:calendar-month-bold" className="text-[#358D83]" />
                                    Pick Date
                                </h3>
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                                    <button onClick={() => onMonthChange(-1)} className="p-1.5 hover:bg-white rounded-lg text-gray-400 transition-all shadow-hover"><Icon icon="lucide:chevron-left" className="w-4 h-4" /></button>
                                    <span className="text-xs font-black text-gray-700 min-w-[100px] text-center uppercase tracking-tight">
                                        {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                    </span>
                                    <button onClick={() => onMonthChange(1)} className="p-1.5 hover:bg-white rounded-lg text-gray-400 transition-all shadow-hover"><Icon icon="lucide:chevron-right" className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 text-center mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={i} className="text-[10px] font-black text-gray-300 py-2 uppercase">{d}</div>
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
                                    const today = new Date(); today.setHours(0, 0, 0, 0);
                                    const isPastDate = date < today;
                                    const isWorkingDay = teacher.availability_schedule.some((s: any) =>
                                        s.day_of_week.toLowerCase() === dayOfWeekName.toLowerCase() && s.is_available
                                    );
                                    const isAvailableDay = !isPastDate && isWorkingDay;
                                    const selectedOnThisDay = selectedSessions.filter(s => s.date.toDateString() === date.toDateString()).length;

                                    return (
                                        <div key={day} className="flex justify-center p-0.5">
                                            <button
                                                disabled={!isAvailableDay}
                                                onClick={() => onDateClick(day)}
                                                className={`
                                                    relative h-11 w-11 rounded-2xl flex items-center justify-center text-xs font-black transition-all
                                                    ${isSelected ? 'bg-[#358D83] text-white shadow-lg' : isAvailableDay ? 'text-gray-900 hover:bg-teal-50 hover:text-[#358D83]' : 'text-gray-200 cursor-not-allowed'}
                                                    ${isToday && !isSelected ? 'border-2 border-teal-100 text-[#358D83]' : ''}
                                                `}
                                            >
                                                {day}
                                                {selectedOnThisDay > 0 && !isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-orange-500 text-white rounded-xl text-[9px] flex items-center justify-center font-black border-2 border-white">{selectedOnThisDay}</div>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Trust Badge (Relocated for better side-by-side fit) */}
                            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Icon icon="ph:shield-check-bold" className="w-6 h-6 text-[#358D83]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-900 uppercase">Secured Learning</p>
                                    <p className="text-[9px] text-gray-400 font-medium leading-tight">All sessions are Recorded & Monitored for safety.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT HALF: TIME EXPLORER */}
                        <div className="flex-1 p-8 bg-white flex flex-col min-w-0">
                            <div className="flex items-center justify-between mb-8 shrink-0">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                        <Icon icon="ph:timer-bold" className="text-indigo-500" />
                                        Available Slots
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{availableSlots.length} Times found for {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{userTimeZone}</div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-12 xl:pb-0">
                                {availableSlots.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-12">
                                        <Icon icon="ph:calendar-x-bold" className="w-16 h-16 opacity-20 mb-4" />
                                        <p className="text-sm font-bold text-gray-400">No slots for this date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {['Morning', 'Afternoon', 'Evening'].map(period => {
                                            const periodSlots = availableSlots.filter(s => s.period === period.toLowerCase());
                                            if (periodSlots.length === 0) return null;
                                            return (
                                                <div key={period} className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <Icon icon={period === 'Morning' ? 'ph:sun-horizon-bold' : period === 'Afternoon' ? 'ph:sun-bold' : 'ph:moon-stars-bold'} className={`w-5 h-5 ${period === 'Morning' ? 'text-orange-400' : period === 'Afternoon' ? 'text-blue-400' : 'text-indigo-400'}`} />
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{period}</span>
                                                        <div className="flex-1 h-px bg-gray-50" />
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                                        {periodSlots.map((slot, idx) => {
                                                            const isSelectedInCart = selectedSessions.some(s => s.date.toDateString() === selectedDate?.toDateString() && s.start === slot.start);
                                                            const isConflict = slot.conflict !== undefined && slot.conflict !== 'selected';
                                                            const isPastOrBooked = slot.conflict === 'booked' || slot.conflict === 'past';

                                                            const SlotBtn = (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => onTimeSlotToggle(slot)}
                                                                    disabled={isPastOrBooked}
                                                                    className={`
                                                                        group relative p-4 rounded-2xl transition-all duration-300 border-2 text-center
                                                                        ${isSelectedInCart ? 'bg-[#358D83] border-[#358D83] text-white shadow-xl -translate-y-1' : isPastOrBooked ? 'bg-gray-50 border-transparent opacity-40 grayscale' : isConflict ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-gray-100 hover:border-[#358D83] hover:-translate-y-1 shadow-hover'}
                                                                    `}
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-sm font-black tabular-nums">{formatTimePill(slot.start)}</span>
                                                                        <span className="text-[10px] font-bold text-gray-400 opacity-60 tabular-nums leading-none mt-0.5">
                                                                            {formatTimePill(slot.end)}
                                                                        </span>
                                                                    </div>
                                                                    {isSelectedInCart && <Icon icon="ph:check-circle-fill" className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white" />}
                                                                </button>
                                                            );

                                                            return (isConflict && !isSelectedInCart) ? (
                                                                <Tooltip key={idx}>
                                                                    <TooltipTrigger asChild>{SlotBtn}</TooltipTrigger>
                                                                    <TooltipContent className="bg-gray-900 border-0 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xl">
                                                                        <div className="flex items-center gap-2"><Icon icon="ph:warning-circle-bold" className="text-red-400" /><span>{slot.conflict === 'booked' ? 'Booked' : 'Conflict'}</span></div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ) : SlotBtn;
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
                </div>
            </TooltipProvider>

            {/* 3. PREMIUM FLOATING PILL SUMMARY (Redesigned for v2.4) */}
            <div className={`
                fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 transition-all duration-700 ease-out
                ${selectedSessions.length > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 pointer-events-none scale-95'}
            `}>
                <div className=" backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] border border-white/10 p-2 md:p-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6">
                        {/* Stats Section */}
                        <div className="flex items-center gap-6 md:gap-10 py-2 sm:py-0">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-2">Lessons</span>
                                <div className="flex items-end gap-1.5">
                                    <span className="text-2xl font-black text-black leading-none">{sessionCount}</span>
                                    <span className="text-[10px] font-bold text-gray-500 mb-0.5">Slots</span>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-white/10" />

                            <div className="flex flex-col min-w-[100px]">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-2">Investment</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-2xl font-black text-black leading-none">
                                        {currency === 'USD' ? '$' : '₦'}{(currency === 'USD' ? totalCost.usd : totalCost.ngn).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <button
                            onClick={onNext}
                            className="w-full sm:w-auto bg-[#358D83] hover:bg-[#2b756d] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            <span>{nextButtonText}</span>
                            <Icon icon="ph:arrow-right-bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
