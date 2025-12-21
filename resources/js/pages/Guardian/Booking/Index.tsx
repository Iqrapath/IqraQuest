import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Icon } from '@iconify/react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
// Import Step components from Student (shared)
import Step1DateSelection from '@/pages/Student/Booking/Components/Step1DateSelection';
import Step2SessionDetails from '@/pages/Student/Booking/Components/Step2SessionDetails';
import Step3Payment from '@/pages/Student/Booking/Components/Step3Payment';
import { BookingSummaryModal } from '@/pages/Student/Booking/Components/BookingSummaryModal';
import { BookingSuccessModal } from '@/pages/Student/Booking/Components/BookingSuccessModal';
import { InsufficientFundsModal } from '@/pages/Student/Wallet/Components/InsufficientFundsModal';

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
    location?: string;
    city?: string;
}

interface TimeSlot {
    start: string;
    end: string;
    period: string;
    is_available: boolean;
}

interface RebookData {
    subject_id: number | null;
    duration: number;
}

interface Props {
    teacher: Teacher;
    booked_slots: Array<{ start: string; end: string }>;
    rebook_data?: RebookData | null;
}

export default function GuardianBookingIndex({ teacher, booked_slots = [], rebook_data }: Props) {
    const { auth } = usePage<any>().props;
    const userWalletBalance = auth?.wallet_balance || 0;

    const isRebook = !!rebook_data;

    const [step, setStep] = useState(1);
    const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(false);
    const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(rebook_data?.duration || 60);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [userTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(rebook_data?.subject_id || null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [occurrences, setOccurrences] = useState(4);
    const [notes, setNotes] = useState('');

    const { currency, setCurrency, convert } = useCurrency();
    const [paymentMethod, setPaymentMethod] = useState('wallet');

    // Helper functions
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

            const isBooked = booked_slots?.some(booking => {
                const bookingStart = new Date(booking.start);
                const bookingEnd = new Date(booking.end);
                return currentSlotStart < bookingEnd && currentSlotEnd > bookingStart;
            });

            if (!isBooked) {
                slots.push({ start: startStr, end: endStr, period, is_available: true });
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

        const daysList = activeSchedule.map(s => s.day_of_week).filter((v, i, a) => a.indexOf(v) === i);
        const startTimes = activeSchedule.map(s => s.start_time);
        const endTimes = activeSchedule.map(s => s.end_time);

        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        daysList.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        const daySummary = daysList.length === 7 ? 'Every Day' : (daysList.length > 2 ? `${daysList[0]} - ${daysList[daysList.length - 1]}` : daysList.join(', '));
        const timeSummary = `${formatTimePill(startTimes[0] || '09:00')} - ${formatTimePill(endTimes[0] || '17:00')}`;

        return { days: daySummary, time: timeSummary };
    };

    // Cost calculations
    const hourlyRate = teacher.hourly_rate || 0;
    const sessionCostNGN = (hourlyRate / 60) * selectedDuration;
    const sessionCostUSD = convert(sessionCostNGN, 'NGN', 'USD');
    const totalSessions = isRecurring ? occurrences : 1;
    const totalCostUSD = sessionCostUSD * totalSessions;
    const totalCostNGN = sessionCostNGN * totalSessions;

    // Handlers
    const handleMonthChange = (offset: number) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newMonth);
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
        setSelectedTimeSlot(null);
    };

    const handleDurationChange = (duration: number) => {
        setSelectedDuration(duration);
        setSelectedTimeSlot(null);
    };

    const goToPrevStep = () => setStep(prev => prev - 1);

    const handleStep1Next = async () => {
        if (!selectedDate || !selectedTimeSlot) {
            toast.error("Please select a date and time slot.");
            return;
        }

        setIsProcessing(true);

        try {
            const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
            const d = new Date(selectedDate);
            d.setHours(hours, minutes, 0, 0);
            const isoStartTime = d.toISOString();

            const response = await axios.post('/guardian/book/check-availability', {
                teacher_id: teacher.id,
                start_time: isoStartTime,
                duration: selectedDuration
            });

            if (response.data.available) {
                setStep(2);
            } else {
                toast.error("This time slot is no longer available. Please choose another.");
                setSelectedTimeSlot(null);
            }
        } catch (error) {
            console.error("Availability Check Error:", error);
            toast.error("Failed to check availability. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProceedCheck = () => {
        if (!selectedDate || !selectedTimeSlot || !selectedSubject) return;

        if (paymentMethod === 'wallet') {
            const balance = Number(userWalletBalance);
            const cost = Number(totalCostNGN.toFixed(2));

            if (balance < cost) {
                setIsInsufficientFundsOpen(true);
                return;
            }
        }

        setIsBookingSummaryOpen(true);
    };

    const handleFinalBooking = () => {
        if (!selectedDate || !selectedTimeSlot || !selectedSubject) return;

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
        const d = new Date(selectedDate);
        d.setHours(hours, minutes, 0, 0);
        const isoStartTime = d.toISOString();

        router.post('/guardian/book/process', {
            teacher_id: teacher.id,
            date: dateStr,
            start_time: isoStartTime,
            end_time: selectedTimeSlot.end,
            subject_id: selectedSubject,
            notes: notes,
            duration: selectedDuration,
            currency: currency,
            payment_method: paymentMethod,
            is_recurring: isRecurring,
            occurrences: occurrences
        }, {
            preserveScroll: true,
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                setIsBookingSummaryOpen(false);
                setIsSuccessModalOpen(true);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Failed to submit booking. Please check details.");
            }
        });
    };

    const selectedSubjectObj = teacher.subjects.find(s => s.id === selectedSubject);
    const selectedSubjectName = selectedSubjectObj ? selectedSubjectObj.name : '';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head title={`${isRebook ? 'Rebook' : 'Book'} Session - ${teacher.user.name}`} />

            {isRebook && (
                <div className="bg-[#e4f7f4] border-b border-[#a4cfc3] px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center gap-3">
                        <Icon icon="mdi:refresh" className="h-5 w-5 text-[#338078]" />
                        <p className="font-['Nunito'] text-sm text-[#338078]">
                            <span className="font-semibold">Rebooking:</span> Subject and duration have been pre-filled from your previous session. Just pick a new time!
                        </p>
                    </div>
                </div>
            )}

            {step === 1 && (
                <Step1DateSelection
                    teacher={teacher}
                    selectedDate={selectedDate}
                    currentMonth={currentMonth}
                    daysArray={daysArray}
                    availableSlots={availableSlots}
                    selectedTimeSlot={selectedTimeSlot}
                    selectedDuration={selectedDuration}
                    userTimeZone={userTimeZone}
                    isRecurring={isRecurring}
                    occurrences={occurrences}
                    onMonthChange={handleMonthChange}
                    onDateClick={handleDateClick}
                    onTimeSlotSelect={setSelectedTimeSlot}
                    onDurationChange={handleDurationChange}
                    onRecurrenceToggle={setIsRecurring}
                    onOccurrencesChange={setOccurrences}
                    onNext={handleStep1Next}
                    getAvailabilitySummary={getAvailabilitySummary}
                    formatTimePill={formatTimePill}
                />
            )}

            {step === 2 && (
                <Step2SessionDetails
                    teacher={teacher}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    selectedSubject={selectedSubject}
                    notes={notes}
                    onSubjectSelect={setSelectedSubject}
                    onNotesChange={setNotes}
                    onBack={goToPrevStep}
                    onContinue={() => setStep(3)}
                    formatTimePill={formatTimePill}
                />
            )}

            {step === 3 && (
                <Step3Payment
                    teacher={teacher}
                    selectedDuration={selectedDuration}
                    currency={currency}
                    paymentMethod={paymentMethod}
                    isRecurring={isRecurring}
                    occurrences={occurrences}
                    onCurrencyChange={(c) => setCurrency(c as any)}
                    onPaymentMethodChange={setPaymentMethod}
                    onBack={goToPrevStep}
                    onProceed={handleProceedCheck}
                />
            )}

            <BookingSummaryModal
                isOpen={isBookingSummaryOpen}
                onClose={() => setIsBookingSummaryOpen(false)}
                teacher={teacher}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                selectedSubjectName={selectedSubjectName}
                totalCost={{ usd: totalCostUSD, ngn: totalCostNGN }}
                currency={currency}
                notes={notes}
                isProcessing={isProcessing}
                onConfirm={handleFinalBooking}
            />

            <InsufficientFundsModal
                isOpen={isInsufficientFundsOpen}
                onClose={() => setIsInsufficientFundsOpen(false)}
                requiredAmount={totalCostNGN}
            />

            {selectedDate && selectedTimeSlot && (
                <BookingSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => router.visit('/guardian/dashboard')}
                    teacherName={teacher.user.name}
                    date={selectedDate}
                    timeSlot={selectedTimeSlot}
                />
            )}
        </div>
    );
}

GuardianBookingIndex.layout = (page: React.ReactNode) => <GuardianLayout children={page} hideRightSidebar={true} />;

