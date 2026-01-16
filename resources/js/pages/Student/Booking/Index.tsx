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
    conflict?: string | Date[];
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

export default function BookingIndex({ teacher, booked_slots = [], rebook_data }: Props) {
    const { auth } = usePage<any>().props;
    const userWalletBalance = auth?.wallet_balance || 0;

    // Check if this is a rebook - pre-fill values
    const isRebook = !!rebook_data;

    const [step, setStep] = useState(1);
    const [isBookingSummaryOpen, setIsBookingSummaryOpen] = useState(false);
    const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // New Multi-Slot Cart State
    const [selectedSessions, setSelectedSessions] = useState<Array<{
        date: Date,
        start: string,
        end: string,
        period: string
    }>>([]);

    const [selectedDuration, setSelectedDuration] = useState(rebook_data?.duration || 60);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(rebook_data?.subject_id || null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [occurrences, setOccurrences] = useState(4);
    const [notes, setNotes] = useState('');

    // Currency Context
    const { currency, setCurrency, convert } = useCurrency();
    const [paymentMethod, setPaymentMethod] = useState('wallet');

    // --- Helper Logic ---
    const parseNaiveTime = (s: string) => {
        // We now use new Date() directly to respect ISO 8601 timezone indicators (like 'Z')
        // providing correct UTC-to-Local conversion for backend booked_slots.
        return new Date(s);
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return { days };
    };

    const { days } = getDaysInMonth(currentMonth);
    const daysArray = [...Array(days).keys()].map(i => i + 1);

    /**
     * Checks if a specific slot (on a specific date) conflicts with:
     * 1. Existing confirmed/pending bookings from other students (booked_slots)
     * 2. Already selected slots in the current cart (selectedSessions)
     */
    const getSlotConflict = (date: Date, start: string, end: string, checkCart = true) => {
        const slotStart = new Date(date);
        const [sH, sM] = start.split(':').map(Number);
        slotStart.setHours(sH, sM, 0, 0);

        const slotEnd = new Date(date);
        const [eH, eM] = end.split(':').map(Number);
        slotEnd.setHours(eH, eM, 0, 0);

        // 1. Check against backend booked_slots
        const isExternalConflict = booked_slots?.some(booking => {
            const bStart = parseNaiveTime(booking.start);
            const bEnd = parseNaiveTime(booking.end);
            return slotStart < bEnd && slotEnd > bStart;
        });

        if (isExternalConflict) return 'booked';

        // 2. Check against current selection in cart (to prevent double picking same day/time)
        if (checkCart) {
            const isInternalConflict = selectedSessions.some(session => {
                if (session.date.toDateString() !== date.toDateString()) return false;
                return session.start === start;
            });
            if (isInternalConflict) return 'selected';
        }

        return null;
    };

    /**
     * Checks if a slot is available for ALL occurrences if recurring is enabled.
     */
    const validateRecurrence = (date: Date, start: string, end: string, checkCart = true, forceRecurring?: boolean, forceOccurrences?: number) => {
        const loopCount = (forceRecurring ?? isRecurring) ? (forceOccurrences ?? occurrences) : 1;
        const conflicts: Date[] = [];

        for (let i = 0; i < loopCount; i++) {
            const futureDate = new Date(date);
            futureDate.setDate(date.getDate() + (i * 7));

            if (getSlotConflict(futureDate, start, end, checkCart)) {
                conflicts.push(futureDate);
            }
        }

        return conflicts;
    };

    const getAvailableSlots = (date: Date | null): (TimeSlot & { conflict?: string | Date[] })[] => {
        if (!date) return [];

        const dayOfWeekName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const daySchedules = teacher.availability_schedule.filter(s =>
            s.day_of_week.toLowerCase() === dayOfWeekName.toLowerCase() && s.is_available
        );

        if (daySchedules.length === 0) return [];

        const slots: (TimeSlot & { conflict?: string | Date[] })[] = [];

        for (const daySchedule of daySchedules) {
            if (!daySchedule.start_time || !daySchedule.end_time) continue;

            const startTime = new Date(`2000-01-01 ${daySchedule.start_time}`);
            let endTime = new Date(`2000-01-01 ${daySchedule.end_time}`);

            // Handle overnight wrap (e.g. 23:00 -> 00:00)
            if (endTime <= startTime) {
                endTime.setDate(endTime.getDate() + 1);
            }

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

                // Core Conflict Logic
                const cartConflict = getSlotConflict(date, startStr, endStr, true);
                const recurrenceConflicts = validateRecurrence(date, startStr, endStr);

                // Check if slot is in the past (with a 30-min buffer for processing time)
                const now = new Date();
                const bufferTime = 30 * 60000; // 30 minutes
                const slotStartDateTime = new Date(date);
                slotStartDateTime.setHours(currentSlotStart.getHours(), currentSlotStart.getMinutes(), 0, 0);
                const isPast = slotStartDateTime.getTime() < (now.getTime() + bufferTime);

                slots.push({
                    start: startStr,
                    end: endStr,
                    period: period,
                    is_available: !cartConflict && recurrenceConflicts.length === 0 && !isPast,
                    conflict: cartConflict || (recurrenceConflicts.length > 0 ? recurrenceConflicts : (isPast ? 'past' : undefined))
                });

                currentSlotStart = new Date(currentSlotEnd);
            }
        }

        slots.sort((a, b) => a.start.localeCompare(b.start));
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
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

        // Basic Summary Logic
        const daySummary = days.length === 7 ? 'Every Day' : (days.length > 2 ? `${days[0]} - ${days[days.length - 1]}` : days.join(', '));
        // Get times from the first available slot as a sample
        const sample = activeSchedule[0];
        const timeSummary = `${formatTimePill(sample.start_time)} - ${formatTimePill(sample.end_time)}`;

        return { days: daySummary, time: timeSummary };
    };

    // Calculate Costs for Logic
    const hourlyRate = teacher.hourly_rate || 0;
    const sessionCostNGN = (hourlyRate / 60) * selectedDuration;
    const sessionCostUSD = convert(sessionCostNGN, 'NGN', 'USD');

    // Total counts sessions in cart across all recurring instances
    const totalSessionsCount = selectedSessions.length * (isRecurring ? occurrences : 1);
    const totalCostUSD = sessionCostUSD * totalSessionsCount;
    const totalCostNGN = sessionCostNGN * totalSessionsCount;

    const currentTotalCost = currency === 'USD' ? totalCostUSD : totalCostNGN;

    // --- Handlers ---
    const handleSlotToggle = (slot: TimeSlot) => {
        if (!selectedDate) return;

        // Feedback for unavailable slots
        if (slot.conflict && slot.conflict !== 'selected') {
            if (slot.conflict === 'booked') {
                toast.error("This slot is already booked. Please choose another time.");
                return;
            }
            if (slot.conflict === 'past') {
                toast.error("This time has already passed for today.");
                return;
            }
            if (Array.isArray(slot.conflict)) {
                // It's a list of recurring conflict dates
                const firstConflict = slot.conflict[0];
                toast.error(`Recurring conflict: This slot is already booked on ${firstConflict.toLocaleDateString()}`);
                return;
            }
        }

        const isAlreadySelected = selectedSessions.some(s =>
            s.date.toDateString() === selectedDate.toDateString() && s.start === slot.start
        );

        if (isAlreadySelected) {
            setSelectedSessions(prev => prev.filter(s =>
                !(s.date.toDateString() === selectedDate.toDateString() && s.start === slot.start)
            ));
        } else {
            // Check for future conflicts just to be sure (redundant but good safety)
            const conflicts = validateRecurrence(selectedDate, slot.start, slot.end);
            if (conflicts.length > 0) {
                toast.error(`Cannot select this slot. There is a conflict on ${conflicts[0].toLocaleDateString()}`);
                return;
            }

            setSelectedSessions(prev => [...prev, {
                date: new Date(selectedDate),
                start: slot.start,
                end: slot.end,
                period: slot.period
            }]);
        }
    };

    const handleMonthChange = (offset: number) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newMonth);
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
    };

    const handleDurationChange = (duration: number) => {
        setSelectedDuration(duration);
        // Clear sessions if duration changes as slots might shift?
        // Actually, it's safer to clear cart to prevent invalid overlaps.
        if (selectedSessions.length > 0) {
            toast.info("Changing duration cleared your current selections to prevent overlaps.");
            setSelectedSessions([]);
        }
    };

    const handleRecurrenceChange = (checked: boolean) => {
        setIsRecurring(checked);
        // Re-validate everything in the cart
        if (checked && selectedSessions.length > 0) {
            toast.info("Re-validating your selected slots for future conflicts...");
            const validSessions = selectedSessions.filter(s => {
                const conflicts = validateRecurrence(s.date, s.start, s.end, true, checked, occurrences);
                return conflicts.length === 0;
            });
            if (validSessions.length < selectedSessions.length) {
                toast.warning(`${selectedSessions.length - validSessions.length} slots were removed due to recurring conflicts.`);
            }
            setSelectedSessions(validSessions);
        }
    };

    const handleOccurrencesChange = (val: number) => {
        setOccurrences(val);
        // Re-validate everything in the cart
        if (isRecurring && selectedSessions.length > 0) {
            const validSessions = selectedSessions.filter(s => {
                const conflicts = validateRecurrence(s.date, s.start, s.end, true, isRecurring, val);
                return conflicts.length === 0;
            });
            if (validSessions.length < selectedSessions.length) {
                toast.warning(`${selectedSessions.length - validSessions.length} slots were removed due to new conflicts.`);
            }
            setSelectedSessions(validSessions);
        }
    };

    const goToNextStep = () => setStep(prev => prev + 1);
    const goToPrevStep = () => setStep(prev => prev - 1);

    const handleStep1Next = () => {
        if (selectedSessions.length === 0) {
            toast.error("Please select at least one time slot.");
            return;
        }

        // Final comprehensive validation sweep before proceeding
        const invalidSessions = selectedSessions.filter(s => {
            // Check direct conflicts
            if (getSlotConflict(s.date, s.start, s.end, false)) return true;
            // Check recurrence conflicts
            const conflicts = validateRecurrence(s.date, s.start, s.end, false);
            return conflicts.length > 0;
        });

        if (invalidSessions.length > 0) {
            toast.error(`Some selected slots are no longer available. ${invalidSessions.length} sessions were removed.`);
            setSelectedSessions(prev => prev.filter(s => !invalidSessions.includes(s)));
            return;
        }

        setStep(2);
    };

    const handleProceedCheck = () => {
        if (selectedSessions.length === 0 || !selectedSubject) return;

        // Show Summary
        setIsBookingSummaryOpen(true);
    };

    const handleFinalBooking = () => {
        if (selectedSessions.length === 0 || !selectedSubject) return;

        setIsProcessing(true);

        // Helper to format date for MySQL/Laravel (Using ISO to preserve timezone)
        const formatForBackend = (date: Date) => {
            return date.toISOString();
        };

        // Construct sessions array for backend
        const sessions = selectedSessions.map(s => {
            const startD = new Date(s.date);
            const [sH, sM] = s.start.split(':').map(Number);
            startD.setHours(sH, sM, 0, 0);

            const endD = new Date(s.date);
            const [eH, eM] = s.end.split(':').map(Number);
            endD.setHours(eH, eM, 0, 0);

            return {
                date: `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}-${String(s.date.getDate()).padStart(2, '0')}`,
                start_time: formatForBackend(startD),
                end_time: formatForBackend(endD),
            };
        });

        router.post('/student/book/process', {
            teacher_id: teacher.id,
            sessions: sessions, // New bulk format
            subject_id: selectedSubject,
            notes: notes,
            duration: selectedDuration,
            currency: currency,
            payment_method: paymentMethod,
            is_recurring: isRecurring,
            recurrence_occurrences: occurrences
        } as any, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
            onSuccess: (page) => {
                setIsBookingSummaryOpen(false);

                const flash = page.props.flash as any;

                if (flash?.booking_status === 'awaiting_payment') {
                    toast.warning("Booking saved, payment pending. Please top up!");
                    setIsInsufficientFundsOpen(true);
                } else {
                    setIsSuccessModalOpen(true);
                }
            },
            onError: (errors) => {
                console.error(errors);
                const firstError = Object.values(errors)[0];
                toast.error(firstError || "Failed to submit booking.");
            }
        });
    };

    // Get subject Name
    const selectedSubjectObj = teacher.subjects.find(s => s.id === selectedSubject);
    const selectedSubjectName = selectedSubjectObj ? selectedSubjectObj.name : '';

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head title={`${isRebook ? 'Rebook' : 'Book'} Session - ${teacher.user.name}`} />

            {/* Rebook Banner */}
            {isRebook && (
                <div className="bg-[#e4f7f4] border-b border-[#a4cfc3] px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center gap-3">
                        <Icon icon="mdi:refresh" className="h-5 w-5 text-[#338078]" />
                        <p className="font-['Nunito'] text-sm text-[#338078]">
                            <span className="font-semibold">Rebooking:</span> Subject and duration have been pre-filled. Just pick your new session slots!
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
                    availableSlots={availableSlots as any}
                    selectedSessions={selectedSessions}
                    selectedDuration={selectedDuration}
                    userTimeZone={userTimeZone}
                    isRecurring={isRecurring}
                    occurrences={occurrences}
                    onMonthChange={handleMonthChange}
                    onDateClick={handleDateClick}
                    onTimeSlotToggle={handleSlotToggle}
                    onDurationChange={handleDurationChange}
                    onRecurrenceToggle={handleRecurrenceChange}
                    onOccurrencesChange={handleOccurrencesChange}
                    onNext={handleStep1Next}
                    getAvailabilitySummary={getAvailabilitySummary}
                    formatTimePill={formatTimePill}
                    totalCost={{ usd: totalCostUSD, ngn: totalCostNGN }}
                    sessionCount={totalSessionsCount}
                    currency={currency}
                />
            )}

            {step === 2 && (
                <Step2SessionDetails
                    teacher={teacher}
                    selectedSessions={selectedSessions} // Updated prop
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
                    slotsCount={selectedSessions.length} // Added
                    sessionCount={totalSessionsCount} // Added
                    onCurrencyChange={(c) => setCurrency(c as any)}
                    onPaymentMethodChange={setPaymentMethod}
                    onBack={goToPrevStep}
                    onProceed={handleProceedCheck}
                    totalCost={{ usd: totalCostUSD, ngn: totalCostNGN }} // Updated
                />
            )}

            {/* Modals */}
            <BookingSummaryModal
                isOpen={isBookingSummaryOpen}
                onClose={() => setIsBookingSummaryOpen(false)}
                teacher={teacher}
                selectedSessions={selectedSessions} // Updated prop
                selectedSubjectName={selectedSubjectName}
                totalCost={{ usd: totalCostUSD, ngn: totalCostNGN }}
                currency={currency}
                notes={notes}
                isProcessing={isProcessing}
                onConfirm={handleFinalBooking}
                isRecurring={isRecurring}
                occurrences={occurrences}
            />

            <InsufficientFundsModal
                isOpen={isInsufficientFundsOpen}
                onClose={() => setIsInsufficientFundsOpen(false)}
                requiredAmount={totalCostNGN}
            />
            {selectedSessions.length > 0 && (
                <BookingSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => router.visit('/student/dashboard')}
                    teacherName={teacher.user.name}
                    sessions={selectedSessions}
                    isRecurring={isRecurring}
                    occurrences={occurrences}
                />
            )}
        </div>
    );
}

BookingIndex.layout = (page: React.ReactNode) => <StudentLayout children={page} hideRightSidebar={true} />;
