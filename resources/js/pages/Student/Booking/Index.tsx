import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react'; // Added router
import axios from 'axios';
// @ts-ignore
declare let route: any;
import StudentLayout from '@/layouts/StudentLayout';
import { Icon } from '@iconify/react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner'; // Import toast
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Step1DateSelection from './Components/Step1DateSelection';
import Step2SessionDetails from './Components/Step2SessionDetails';
import Step3Payment from './Components/Step3Payment';
import { BookingSummaryModal } from './Components/BookingSummaryModal';
import { BookingSuccessModal } from './Components/BookingSuccessModal';
import { InsufficientFundsModal } from '../Wallet/Components/InsufficientFundsModal'; // Import Step 3

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

interface Props {
    teacher: Teacher;
    booked_slots: Array<{ start: string; end: string }>;
}

export default function BookingIndex({ teacher, booked_slots = [] }: Props) {
    const { auth } = usePage<any>().props;
    const userWalletBalance = auth?.wallet_balance || 0;

    const [step, setStep] = useState(1);
    const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(false);
    const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(60); // Default 60 mins
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [occurrences, setOccurrences] = useState(4);
    const [notes, setNotes] = useState('');

    // Currency Context
    const { currency, setCurrency, convert } = useCurrency();
    const [paymentMethod, setPaymentMethod] = useState('wallet');

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

            // Double Booking Logic
            const isBooked = booked_slots?.some(booking => {
                const bookingStart = new Date(booking.start);
                const bookingEnd = new Date(booking.end);
                return currentSlotStart < bookingEnd && currentSlotEnd > bookingStart;
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

        const days = activeSchedule.map(s => s.day_of_week).filter((v, i, a) => a.indexOf(v) === i);
        const startTimes = activeSchedule.map(s => s.start_time);
        const endTimes = activeSchedule.map(s => s.end_time);

        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        // Basic Summary Logic
        const daySummary = days.length === 7 ? 'Every Day' : (days.length > 2 ? `${days[0]} - ${days[days.length - 1]}` : days.join(', '));
        const timeSummary = `${formatTimePill(startTimes[0] || '09:00')} - ${formatTimePill(endTimes[0] || '17:00')}`;

        return { days: daySummary, time: timeSummary };
    };

    // Calculate Costs for Logic
    const hourlyRate = teacher.hourly_rate || 0;
    // Assumption: Teacher hourly_rate is in NGN (e.g. 25000) based on Seeder data
    const sessionCostNGN = (hourlyRate / 60) * selectedDuration;

    // Per Session Cost (USD) using Currency Context
    const sessionCostUSD = convert(sessionCostNGN, 'NGN', 'USD');

    // Total for Logic (Handling recurrence)
    const totalSessions = isRecurring ? occurrences : 1;
    const totalCostUSD = sessionCostUSD * totalSessions;
    const totalCostNGN = sessionCostNGN * totalSessions;

    const currentTotalCost = currency === 'USD' ? totalCostUSD : totalCostNGN;

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

    const handleDurationChange = (duration: number) => {
        setSelectedDuration(duration);
        setSelectedTimeSlot(null);
    };

    const goToNextStep = () => setStep(prev => prev + 1);
    const goToPrevStep = () => setStep(prev => prev - 1);

    const handleStep1Next = async () => {
        if (!selectedDate || !selectedTimeSlot) {
            toast.error("Please select a date and time slot.");
            return;
        }

        setIsProcessing(true); // Reusing processing state or add a new one? Reusing is fine for short check.

        try {
            // Construct ISO Start Time similar to final booking
            const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
            const d = new Date(selectedDate);
            d.setHours(hours, minutes, 0, 0);
            const isoStartTime = d.toISOString();

            const response = await axios.post('/student/book/check-availability', {
                teacher_id: teacher.id,
                start_time: isoStartTime,
                duration: selectedDuration
            });

            if (response.data.available) {
                setStep(2);
            } else {
                toast.error("This time slot is no longer available. Please choose another.");
                // Optionally refresh slots here?
                // For now, let user manually pick another.
                setSelectedTimeSlot(null);
            }
        } catch (error) {
            console.error("Availability Check Error:", error);
            toast.error("Failed to check availability. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Use handleProceedCheck instead of submitting directly
    const handleProceedCheck = () => {
        if (!selectedDate || !selectedTimeSlot || !selectedSubject) return;

        // If paying with wallet, check balance
        if (paymentMethod === 'wallet') {
            // Note: Wallet balance is in NGN (Base).
            const balance = Number(userWalletBalance);
            const cost = Number(totalCostNGN.toFixed(2)); // Round to 2 decimals to avoid float issues

            if (balance < cost) {
                // Double check to ensure we aren't showing insufficient funds for very small differences due to float
                setIsInsufficientFundsOpen(true);
                return;
            }
        }

        // Show Summary
        setIsBookingSummaryOpen(true);
    };

    const handleFinalBooking = () => {
        if (!selectedDate || !selectedTimeSlot || !selectedSubject) return;

        // Construct Start/End DateTime
        // selectedDate is just date (midnight), time is string "HH:MM"
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Just sending primitive data to controller, let it parse or send full ISO?
        // Controller expects 'date', 'start_time', 'end_time' usually.
        // Let's match typical Laravel request structure.

        // Combine Date and Time and convert to ISO (UTC) to handle timezones correctly
        // "2024-03-20T17:00:00" -> Date Object -> toISOString()
        const localDateTimeFunc = () => {
            const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
            const d = new Date(selectedDate);
            d.setHours(hours, minutes, 0, 0);
            return d.toISOString();
        };
        const isoStartTime = localDateTimeFunc();

        router.post('/student/book/process', {
            teacher_id: teacher.id,
            date: dateStr,
            start_time: isoStartTime, // Sends UTC string e.g., "2024-03-20T22:00:00.000Z"
            end_time: selectedTimeSlot.end,
            subject_id: selectedSubject,
            notes: notes,
            duration: selectedDuration,

            // Payment / Step 3 Data
            currency: currency,
            payment_method: paymentMethod,

            // Recurrence
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
                // Simple error handling
                console.error(errors);
                alert("Failed to submit booking. Please check details.");
            }
        });
    };

    // Get subject Name
    const selectedSubjectObj = teacher.subjects.find(s => s.id === selectedSubject);
    const selectedSubjectName = selectedSubjectObj ? selectedSubjectObj.name : '';

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head title={`Book Session - ${teacher.user.name}`} />

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

            {/* Modals */}
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
                requiredAmount={totalCostNGN} // Always pass NGN amount for TopUp as Modal is NGN based
            />
            {selectedDate && selectedTimeSlot && (
                <BookingSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => router.visit('/student/dashboard')}
                    teacherName={teacher.user.name}
                    date={selectedDate}
                    timeSlot={selectedTimeSlot}
                />
            )}
        </div>
    );
}

BookingIndex.layout = (page: React.ReactNode) => <StudentLayout children={page} hideRightSidebar={true} />;
