import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AvailabilitySettings, DAYS, isSlotDurationValid } from './Components/AvailabilitySettings';
import { YourSchedule } from './Components/YourSchedule';
import { AvailabilityLoadingSkeleton } from './Components/Skeletons';

const MAX_SLOTS_PER_DAY = 5;

interface TimeSlot {
    day: string;
    start: string;
    end: string;
}

// Calculate end time (+1 hour)
const addOneHour = (time: string): string => {
    const hours = parseInt(time.split(':')[0]);
    const endHour = (hours + 1) % 24;
    return `${endHour.toString().padStart(2, '0')}:00`;
};

interface AvailabilitySlot {
    id: number;
    day_of_week: string;
    is_available: boolean;
    start_time: string | null;
    end_time: string | null;
}

interface Session {
    id: number;
    student: { id: number; name: string; avatar: string | null };
    subject: { id: number; name: string };
    start_time: string;
    end_time: string;
    date_key: string;
    formatted_date: string;
    formatted_day: string;
    formatted_month: string;
    formatted_start_time: string;
    formatted_end_time: string;
    status: string;
    can_join: boolean;
    meeting_link: string | null;
}

interface Props {
    tab: 'availability' | 'schedule';
    sessionTab: 'upcoming' | 'past';
    availability: AvailabilitySlot[];
    holidayMode: boolean;
    sessions: Session[];
    counts: { upcoming: number; past: number };
    serverDate: string;
}

export default function Schedule({ tab, sessionTab, availability, holidayMode, sessions, counts, serverDate }: Props) {
    const [activeTab, setActiveTab] = useState<'availability' | 'schedule'>(tab);
    const [activeSessionTab, setActiveSessionTab] = useState<'upcoming' | 'past'>(sessionTab);
    const [isHolidayMode, setIsHolidayMode] = useState(holidayMode);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Convert backend availability to multi-slot format
    const getInitialSlots = (): TimeSlot[] => {
        if (!Array.isArray(availability) || availability.length === 0) return [];
        return availability
            .filter(a => a.is_available && a.start_time && a.end_time)
            .map(a => ({
                day: a.day_of_week,
                start: a.start_time?.slice(0, 5) || '09:00',
                end: a.end_time?.slice(0, 5) || '10:00'
            }));
    };

    const [slots, setSlots] = useState<TimeSlot[]>(getInitialSlots());
    const [expandedDays, setExpandedDays] = useState<string[]>(
        [...new Set(getInitialSlots().map(s => s.day))]
    );

    // Sync state with server data
    useEffect(() => {
        setActiveTab(tab);
        setActiveSessionTab(sessionTab);
        setIsHolidayMode(holidayMode);
        setIsLoading(false);
    }, [tab, sessionTab, holidayMode, sessions]);

    // Update slots when availability props change
    useEffect(() => {
        const initialSlots = getInitialSlots();
        setSlots(initialSlots);
        setExpandedDays([...new Set(initialSlots.map(s => s.day))]);
    }, [availability]);

    const getDaySlots = (day: string): TimeSlot[] => {
        return slots.filter(s => s.day === day.toLowerCase());
    };

    const handleTabChange = (newTab: 'availability' | 'schedule') => {
        if (newTab === activeTab) return;
        setActiveTab(newTab);
        setIsLoading(true);
        router.get('/teacher/schedule', { tab: newTab, session_tab: activeSessionTab }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSessionTabChange = (newTab: 'upcoming' | 'past') => {
        if (newTab === activeSessionTab) return;
        setActiveSessionTab(newTab);
        setIsLoading(true);
        router.get('/teacher/schedule', { tab: activeTab, session_tab: newTab }, {
            preserveState: true,
            preserveScroll: true,
            only: ['sessions', 'counts', 'sessionTab'],
            onFinish: () => setIsLoading(false),
        });
    };

    const toggleDay = (day: string) => {
        const dayLower = day.toLowerCase();
        const isExpanded = expandedDays.includes(dayLower);

        if (isExpanded) {
            setExpandedDays(expandedDays.filter(d => d !== dayLower));
            setSlots(slots.filter(s => s.day !== dayLower));
        } else {
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

    const handleSaveAvailability = () => {
        if (slots.length === 0) {
            toast.error('Please add at least one time slot.');
            return;
        }

        // Validate duration for all slots
        const invalidSlots = slots.filter(s => !isSlotDurationValid(s));
        if (invalidSlots.length > 0) {
            toast.error('Each time slot must be exactly 1 hour or less.');
            return;
        }

        setIsSaving(true);
        const availabilityData = slots.map(({ day, start, end }) => ({
            day_of_week: day,
            is_available: true,
            start_time: start,
            end_time: end,
        }));

        router.post('/teacher/schedule/availability', { availability: availabilityData }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Availability updated successfully'),
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Failed to update availability');
            },
            onFinish: () => setIsSaving(false)
        });
    };

    const handleToggleHolidayMode = () => {
        router.post('/teacher/schedule/holiday-mode', {}, { preserveScroll: true, onSuccess: () => setIsHolidayMode(!isHolidayMode) });
    };

    const handleJoinSession = (session: Session) => {
        if (session.meeting_link) window.open(session.meeting_link, '_blank');
    };

    return (
        <TeacherLayout>
            <Head title="Schedule" />
            <div className="flex flex-col gap-[clamp(1.5rem,3vw,2rem)]">
                <h1 className="font-['Poppins'] font-medium text-[clamp(1.25rem,2.5vw,1.5rem)] text-black">Schedule</h1>
                <div className="bg-white rounded-full p-1 inline-flex w-fit border border-[#e5e7eb]">
                    <button onClick={() => handleTabChange('availability')} className={cn("px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-full font-['Nunito'] font-semibold text-[clamp(0.875rem,1.5vw,1rem)] transition-all", activeTab === 'availability' ? 'bg-[#338078] text-white' : 'text-[#6b7280] hover:text-[#338078]')}>
                        Availability Settings
                    </button>
                    <button onClick={() => handleTabChange('schedule')} className={cn("px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-full font-['Nunito'] font-semibold text-[clamp(0.875rem,1.5vw,1rem)] transition-all", activeTab === 'schedule' ? 'bg-[#338078] text-white' : 'text-[#6b7280] hover:text-[#338078]')}>
                        Your Schedule
                    </button>
                </div>
                {activeTab === 'availability' ? (
                    isLoading ? (
                        <AvailabilityLoadingSkeleton />
                    ) : (
                        <AvailabilitySettings
                            slots={slots}
                            expandedDays={expandedDays}
                            isHolidayMode={isHolidayMode}
                            isSaving={isSaving}
                            onToggleDay={toggleDay}
                            onAddSlot={addSlot}
                            onRemoveSlot={removeSlot}
                            onUpdateSlotTime={updateSlotTime}
                            onSave={handleSaveAvailability}
                            onToggleHolidayMode={handleToggleHolidayMode}
                            getDaySlots={getDaySlots}
                        />
                    )
                ) : (
                    <YourSchedule activeSessionTab={activeSessionTab} sessions={sessions} counts={counts} onSessionTabChange={handleSessionTabChange} onJoinSession={handleJoinSession} isLoading={isLoading} serverDate={serverDate} />
                )}
            </div>
        </TeacherLayout>
    );
}
