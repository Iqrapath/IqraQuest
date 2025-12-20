import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import StudentLayout from '@/layouts/StudentLayout';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import Step1DateSelection from './Components/Step1DateSelection';

interface Teacher {
    id: number;
 user: {
        name: string;
        avatar?: string;
    };
    subjects: Array<{ id: number; name: string }>;
    hourly_rate: number;
    average_rating: number;
    total_reviews: number;
    availability_schedule: any[];
    city?: string;
}

interface TimeSlot {
    start: string;
    end: string;
    period: string;
    is_available: boolean;
}

interface BookingData {
    id: number;
    subject: { id: number; name: string };
    current_start_time: string;
    current_end_time: string;
    formatted_date: string;
    formatted_time: string;
    duration_minutes: number;
}

interface Props {
    booking: BookingData;
    teacher: Teacher;
    booked_slots: Array<{ start: string; end: string }>;
}

export default function Reschedule({ booking, teacher, booked_slots = [] }: Props) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [userTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [reason, setReason] = useState('');
    const [showReasonInput, setShowReasonInput] = useState(false);

    // Fixed duration from original booking
    const selectedDuration = booking.duration_minutes;

    // --- Helper Logic ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return { days };
    };

    const { days } = getDaysInMonth(currentMonth);
    const daysArray = [...Array(days).keys()].map(i => i + 1);

    const getAvailableSlots = (date: Date | null): TimeSlot[] => {
        if (!date) return [];

        const dayOfWeekName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const isAvailableDay = teacher.availability_schedule.some(s =>
            s.day_of_week.toLowerCase() === dayOfWeekName.toLowerCase() && s.is_available
        );

        if (!isAvailableDay) return [];

        const daySchedule = teacher.availability_schedule.find(s =>
            s.day_of_week.toLowerCase() === dayOfWeekName.toLowerCase()
        );

        if (!daySchedule || !daySchedule.start_time || !daySchedule.end_time) return [];

        const slots: TimeSlot[] = [];
        const startTime = new Date(`2000-01-01 ${daySchedule.start_time}`);
        const endTime = new Date(`2000-01-01 ${daySchedule.end_time}`);

        let currentSlotStart = new Date(startTime);

        while (currentSlotStart < endTime) {
            const currentSlotEnd = new Date(currentSlotStart.getTime() + selectedDuration * 60000);
            if (currentSlotEnd > endTime) break;

            const startStr = currentSlotStart.toTimeString().slice(0, 5);
            const endStr = currentSlotEnd.toTimeString().slice(0, 5);

            const hour = currentSlotStart.getHours();
            let period = 'morning';
            if (hour >= 12 && hour < 17) period = 'afternoon';
            if (hour >= 17) period = 'evening';

            // Check if slot is booked (excluding current booking which is handled server-side)
            const slotDateTime = new Date(date);
            slotDateTime.setHours(currentSlotStart.getHours(), currentSlotStart.getMinutes(), 0, 0);
            const slotEndDateTime = new Date(slotDateTime.getTime() + selectedDuration * 60000);

            const isBooked = booked_slots?.some(b => {
                const bookingStart = new Date(b.start);
                const bookingEnd = new Date(b.end);
                return slotDateTime < bookingEnd && slotEndDateTime > bookingStart;
            });

            if (!isBooked) {
                slots.push({
                    start: startStr,
                    end: endStr,
                    period: period,
                    is_available: true
                });
            }

            currentSlotStart = new Date(currentSlotEnd);
        }

        return slots;
    };

    const availableSlots = getAvailableSlots(selectedDate);

    const formatTimePill = (time: string | null) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const getAvailabilitySummary = (schedule: any[]) => {
        if (!schedule || schedule.length === 0) return { days: 'flexible', time: 'Contact for details' };
        const activeSchedule = schedule.filter(s => s.is_available);
        if (activeSchedule.length === 0) return { days: 'Not Available', time: 'Contact for details' };

        const activeDays = activeSchedule.map(s => s.day_of_week).filter((v, i, a) => a.indexOf(v) === i);
        const startTimes = activeSchedule.map(s => s.start_time);
        const endTimes = activeSchedule.map(s => s.end_time);

        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        activeDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        const daySummary = activeDays.length === 7 ? 'Every Day' : (activeDays.length > 2 ? `${activeDays[0]} - ${activeDays[activeDays.length - 1]}` : activeDays.join(', '));
        const timeSummary = `${formatTimePill(startTimes[0] || '09:00')} - ${formatTimePill(endTimes[0] || '17:00')}`;

        return { days: daySummary, time: timeSummary };
    };

    // --- Handlers ---
    const handleMonthChange = (offset: number) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newMonth);
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
        setSelectedTimeSlot(null);
    };

    const handleSubmitReschedule = async () => {
        if (!selectedDate || !selectedTimeSlot) {
            toast.error("Please select a new date and time slot.");
            return;
        }

        setIsProcessing(true);

        try {
            // Construct ISO Start Time
            const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
            const d = new Date(selectedDate);
            d.setHours(hours, minutes, 0, 0);
            const isoStartTime = d.toISOString();

            // First check availability
            const checkResponse = await axios.post(`/student/booking/${booking.id}/reschedule/check-availability`, {
                start_time: isoStartTime,
            });

            if (!checkResponse.data.available) {
                toast.error("This time slot is no longer available. Please choose another.");
                setSelectedTimeSlot(null);
                setIsProcessing(false);
                return;
            }

            // Submit reschedule request
            router.post(`/student/booking/${booking.id}/reschedule`, {
                new_start_time: isoStartTime,
                reason: reason || undefined,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Reschedule request submitted!');
                },
                onError: (errors: any) => {
                    console.error(errors);
                    toast.error(errors.error || 'Failed to submit reschedule request.');
                },
                onFinish: () => setIsProcessing(false),
            });
        } catch (error) {
            console.error("Reschedule Error:", error);
            toast.error("Failed to submit reschedule request. Please try again.");
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        router.visit('/student/bookings');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head title={`Reschedule - ${booking.subject.name}`} />

            {/* Reschedule Banner */}
            <div className="bg-[#fff9e9] border-b border-[#fde68a] px-4 py-3">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <Icon icon="mdi:calendar-sync" className="h-5 w-5 text-[#d97706]" />
                        <p className="font-['Nunito'] text-sm font-semibold text-[#92400e]">
                            Reschedule Session
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-[#fde68a]">
                        <p className="font-['Nunito'] text-xs text-[#6b7280] mb-1">Current Schedule:</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-['Nunito'] text-sm font-medium text-[#181818]">
                                {booking.subject.name}
                            </span>
                            <span className="text-[#d1d5db]">•</span>
                            <span className="font-['Nunito'] text-sm text-[#6b7280]">
                                {booking.formatted_date}
                            </span>
                            <span className="text-[#d1d5db]">•</span>
                            <span className="font-['Nunito'] text-sm text-[#6b7280]">
                                {booking.formatted_time}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Selection - Reusing Step1 but with custom next handler */}
            <Step1DateSelection
                teacher={teacher}
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                daysArray={daysArray}
                availableSlots={availableSlots}
                selectedTimeSlot={selectedTimeSlot}
                selectedDuration={selectedDuration}
                userTimeZone={userTimeZone}
                isRecurring={false}
                occurrences={1}
                onMonthChange={handleMonthChange}
                onDateClick={handleDateClick}
                onTimeSlotSelect={setSelectedTimeSlot}
                onDurationChange={() => {}} // Duration is fixed
                onRecurrenceToggle={() => {}} // No recurrence for reschedule
                onOccurrencesChange={() => {}}
                onNext={() => setShowReasonInput(true)}
                getAvailabilitySummary={getAvailabilitySummary}
                formatTimePill={formatTimePill}
                hideRecurrence={true}
                hideDurationSelector={true}
                nextButtonText="Continue"
            />

            {/* Reason Modal/Section */}
            {showReasonInput && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h3 className="font-['Poppins'] font-semibold text-lg text-[#181818] mb-4">
                            Confirm Reschedule
                        </h3>

                        {/* New Schedule Summary */}
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mb-4">
                            <p className="font-['Nunito'] text-xs text-[#166534] mb-2">New Schedule:</p>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:calendar" className="h-4 w-4 text-[#166534]" />
                                    <span className="font-['Nunito'] text-sm text-[#181818]">
                                        {selectedDate?.toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:clock-outline" className="h-4 w-4 text-[#166534]" />
                                    <span className="font-['Nunito'] text-sm text-[#181818]">
                                        {formatTimePill(selectedTimeSlot?.start || '')} - {formatTimePill(selectedTimeSlot?.end || '')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="mb-4">
                            <label className="font-['Nunito'] text-sm text-[#374151] mb-2 block">
                                Reason for rescheduling (optional)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Let the teacher know why you need to reschedule..."
                                className="w-full rounded-xl border border-[#e5e7eb] p-3 font-['Nunito'] text-sm text-[#181818] placeholder:text-[#9ca3af] focus:border-[#338078] focus:ring-1 focus:ring-[#338078] resize-none"
                                rows={3}
                                maxLength={500}
                            />
                        </div>

                        {/* Info Notice */}
                        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 mb-4 flex items-start gap-2">
                            <Icon icon="mdi:information-outline" className="h-5 w-5 text-[#0284c7] flex-shrink-0 mt-0.5" />
                            <p className="font-['Nunito'] text-xs text-[#075985]">
                                Your reschedule request will be sent to the teacher for approval. 
                                The original booking remains active until the teacher accepts.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReasonInput(false)}
                                disabled={isProcessing}
                                className="flex-1 rounded-[56px] border border-[#e5e7eb] text-[#374151] font-['Nunito'] font-semibold text-sm h-11 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitReschedule}
                                disabled={isProcessing}
                                className="flex-1 rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm h-11 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Reschedule.layout = (page: React.ReactNode) => <StudentLayout children={page} hideRightSidebar={true} />;
