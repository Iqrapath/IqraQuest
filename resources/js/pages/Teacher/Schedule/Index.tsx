import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
function getTimeInMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function isValidDuration(start: string, end: string): boolean {
    if (!start || !end) return false;
    return getTimeInMinutes(end) - getTimeInMinutes(start) === 60;
}

function addOneHour(time: string): string {
    const minutes = getTimeInMinutes(time) + 60;
    const h = (Math.floor(minutes / 60) % 24).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

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

type AvailabilityState = Record<string, { enabled: boolean; start: string; end: string }>;


export default function Schedule({ tab, sessionTab, availability, holidayMode, sessions, counts, serverDate }: Props) {
    const [activeTab, setActiveTab] = useState<'availability' | 'schedule'>(tab);
    const [activeSessionTab, setActiveSessionTab] = useState<'upcoming' | 'past'>(sessionTab);
    const [isHolidayMode, setIsHolidayMode] = useState(holidayMode);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with server data
    useEffect(() => {
        setActiveTab(tab);
        setActiveSessionTab(sessionTab);
        setIsHolidayMode(holidayMode);
        setIsLoading(false);
    }, [tab, sessionTab, holidayMode, sessions]);

    const [availabilityState, setAvailabilityState] = useState<AvailabilityState>(() => {
        const state: AvailabilityState = {};
        DAYS.forEach(day => {
            const slot = availability.find(a => a.day_of_week === day);
            state[day] = {
                enabled: slot?.is_available ?? false,
                start: slot?.start_time ?? '09:00',
                end: slot?.end_time ?? '10:00',
            };
        });
        return state;
    });

    // Update availability state when props change
    useEffect(() => {
        const state: AvailabilityState = {};
        DAYS.forEach(day => {
            const slot = availability.find(a => a.day_of_week === day);
            state[day] = {
                enabled: slot?.is_available ?? false,
                start: slot?.start_time ?? '09:00',
                end: slot?.end_time ?? '10:00',
            };
        });
        setAvailabilityState(state);
    }, [availability]);

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
        setAvailabilityState((prev: AvailabilityState) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
    };

    const updateTime = (day: string, field: 'start' | 'end', value: string) => {
        if (field === 'end') return; // End time is now strictly calculated

        setAvailabilityState((prev: AvailabilityState) => {
            const newState = { ...prev, [day]: { ...prev[day], start: value } };
            newState[day].end = addOneHour(value);
            return newState;
        });
    };

    const handleSaveAvailability = () => {
        // Validate all enabled days have at least 1 hour duration
        const invalidDays = DAYS.filter(day =>
            availabilityState[day].enabled &&
            !isValidDuration(availabilityState[day].start, availabilityState[day].end)
        );

        if (invalidDays.length > 0) {
            const dayNames = invalidDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
            alert(`The following days must have at least a 1-hour duration: ${dayNames}`);
            return;
        }

        setIsSaving(true);
        const availabilityData = DAYS.map(day => ({
            day_of_week: day,
            is_available: availabilityState[day].enabled,
            start_time: availabilityState[day].enabled ? availabilityState[day].start : null,
            end_time: availabilityState[day].enabled ? availabilityState[day].end : null,
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
                        <AvailabilitySettings availabilityState={availabilityState} isHolidayMode={isHolidayMode} isSaving={isSaving} onToggleDay={toggleDay} onUpdateTime={updateTime} onSave={handleSaveAvailability} onToggleHolidayMode={handleToggleHolidayMode} />
                    )
                ) : (
                    <YourSchedule activeSessionTab={activeSessionTab} sessions={sessions} counts={counts} onSessionTabChange={handleSessionTabChange} onJoinSession={handleJoinSession} isLoading={isLoading} serverDate={serverDate} />
                )}
            </div>
        </TeacherLayout>
    );
}


interface AvailabilitySettingsProps {
    availabilityState: AvailabilityState;
    isHolidayMode: boolean;
    isSaving: boolean;
    onToggleDay: (day: string) => void;
    onUpdateTime: (day: string, field: 'start' | 'end', value: string) => void;
    onSave: () => void;
    onToggleHolidayMode: () => void;
}

function AvailabilitySettings({ availabilityState, isHolidayMode, isSaving, onToggleDay, onUpdateTime, onSave, onToggleHolidayMode }: AvailabilitySettingsProps) {
    const enabledDays = DAYS.filter(day => availabilityState[day].enabled);

    return (
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)]">
            <p className="font-['Nunito'] text-[clamp(0.875rem,1.5vw,1rem)] text-[#6b7280]">Manage your teaching availability</p>
            <div className="flex items-center gap-3">
                <span className="font-['Nunito'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-[#181818]">Holiday Mode</span>
                <Switch checked={isHolidayMode} onCheckedChange={onToggleHolidayMode} />
            </div>
            {isHolidayMode && (
                <div className="bg-[#fff9e9] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3">
                    <Icon icon="mdi:beach" className="h-5 w-5 text-[#d97706] flex-shrink-0 mt-0.5" />
                    <p className="font-['Nunito'] text-sm text-[#92400e]">Holiday mode is enabled. Students cannot book new sessions with you until you disable it.</p>
                </div>
            )}
            <div className="flex flex-col gap-3">
                <h3 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.125rem)] text-[#181818]">Select Available Days</h3>
                <p className="font-['Nunito'] text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#6b7280]">Select Days you will be available for student</p>
                <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                        <button key={day} onClick={() => onToggleDay(day)} className={cn("px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.375rem,0.75vw,0.5rem)] rounded-lg border font-['Nunito'] font-medium text-[clamp(0.75rem,1.25vw,0.875rem)] transition-all", availabilityState[day].enabled ? 'bg-[#e4f7f4] border-[#338078] text-[#338078]' : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#338078]')}>
                            {DAY_LABELS[day]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <h3 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.125rem)] text-[#181818]">Select Available Hours</h3>
                <p className="font-['Nunito'] text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#6b7280]">Set which hours you want to be active</p>
                <div className="flex flex-col gap-4">
                    {enabledDays.map(day => (
                        <div key={day} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={availabilityState[day].enabled} onChange={() => onToggleDay(day)} className="h-4 w-4 rounded border-[#338078] text-[#338078] focus:ring-[#338078]" />
                                <span className="font-['Nunito'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-[#181818] capitalize">{day}</span>
                            </div>
                            <div className="flex flex-col gap-2 ml-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="font-['Nunito'] text-xs text-[#6b7280]">From</label>
                                        <input
                                            type="time"
                                            value={availabilityState[day].start}
                                            onChange={(e) => onUpdateTime(day, 'start', e.target.value)}
                                            className="w-40 rounded-lg border border-[#e5e7eb] px-3 py-2 font-['Nunito'] text-sm text-[#181818] focus:border-[#338078] focus:ring-1 focus:ring-[#338078] bg-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="font-['Nunito'] text-xs text-[#6b7280]">To</label>
                                        <input
                                            type="time"
                                            value={availabilityState[day].end}
                                            readOnly
                                            className="w-40 rounded-lg border border-[#e5e7eb] px-3 py-2 font-['Nunito'] text-sm text-[#9ca3af] bg-gray-50 cursor-not-allowed outline-none"
                                            title="End time is automatically set to 1 hour after start time"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#338078] font-['Nunito'] italic">Duration is fixed at exactly 1 hour</p>
                            </div>
                        </div>
                    ))}
                    {enabledDays.length === 0 && <p className="font-['Nunito'] text-sm text-[#9ca3af] italic">Select at least one day above to set your hours.</p>}
                </div>
            </div>
            <Button onClick={onSave} disabled={isSaving} className="w-fit rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm px-6 h-11">
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    );
}


interface YourScheduleProps {
    activeSessionTab: 'upcoming' | 'past';
    sessions: Session[];
    counts: { upcoming: number; past: number };
    onSessionTabChange: (tab: 'upcoming' | 'past') => void;
    onJoinSession: (session: Session) => void;
    isLoading: boolean;
    serverDate: string;
}

function YourSchedule({ activeSessionTab, sessions, counts, onSessionTabChange, onJoinSession, isLoading, serverDate }: YourScheduleProps) {
    // Parse server date without timezone conversion (YYYY-MM-DD format)
    const parseServerDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const [selectedDate, setSelectedDate] = useState<Date>(() => parseServerDate(serverDate));
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const today = parseServerDate(serverDate);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        return monday;
    });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        return date;
    });

    const currentMonth = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const navigateWeek = (direction: number) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();
    const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const filteredSessions = activeSessionTab === 'upcoming' ? sessions.filter(s => s.date_key === selectedDateKey) : sessions;

    return (
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)]">
            <div className="flex items-center gap-6">
                <button onClick={() => onSessionTabChange('upcoming')} className={cn("font-['Nunito'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] pb-2 border-b-2 transition-all", activeSessionTab === 'upcoming' ? 'text-[#338078] border-[#338078]' : 'text-[#6b7280] border-transparent hover:text-[#338078]')}>
                    Upcoming Session ({counts.upcoming})
                </button>
                <button onClick={() => onSessionTabChange('past')} className={cn("font-['Nunito'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] pb-2 border-b-2 transition-all", activeSessionTab === 'past' ? 'text-[#338078] border-[#338078]' : 'text-[#6b7280] border-transparent hover:text-[#338078]')}>
                    Past Sessions
                </button>
            </div>
            {activeSessionTab === 'upcoming' && (
                <>
                    <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1rem,2vw,1.5rem)]">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280] transition-colors">
                                <Icon icon="mdi:chevron-left" className="h-5 w-5" />
                            </button>
                            <h3 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.125rem)] text-[#181818]">{currentMonth}</h3>
                            <button onClick={() => navigateWeek(1)} className="p-2 rounded-full hover:bg-[#f3f4f6] text-[#6b7280] transition-colors">
                                <Icon icon="mdi:chevron-right" className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((date, idx) => {
                                const isToday = date.toDateString() === parseServerDate(serverDate).toDateString();
                                const hasSession = sessions.some(s => s.date_key === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "flex flex-col items-center py-3 px-2 rounded-xl transition-all relative",
                                            isSelected(date) ? 'bg-[#338078] text-white' : 'hover:bg-[#f3f4f6]',
                                            isToday && !isSelected(date) && 'ring-2 ring-[#338078] ring-inset'
                                        )}
                                    >
                                        <span className={cn("font-['Nunito'] text-xs mb-1", isSelected(date) ? 'text-white/80' : 'text-[#9ca3af]')}>
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span className={cn("font-['Poppins'] font-medium text-lg", isSelected(date) ? 'text-white' : 'text-[#181818]')}>
                                            {date.getDate()}
                                        </span>
                                        {hasSession && (
                                            <span className={cn("absolute bottom-1 w-1.5 h-1.5 rounded-full", isSelected(date) ? 'bg-white' : 'bg-[#338078]')} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:calendar" className="h-5 w-5 text-[#338078]" />
                            <span className="font-['Poppins'] font-medium text-[#181818]">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        {isLoading ? (
                            <SessionsLoadingSkeleton />
                        ) : filteredSessions.length === 0 ? (
                            <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 text-center">
                                <Icon icon="mdi:calendar-blank" className="h-12 w-12 text-[#d1d5db] mx-auto mb-3" />
                                <p className="font-['Nunito'] text-sm text-[#6b7280]">No sessions scheduled for this day</p>
                            </div>
                        ) : (
                            filteredSessions.map(session => <SessionCard key={session.id} session={session} onJoin={onJoinSession} />)
                        )}
                    </div>
                </>
            )}
            {activeSessionTab === 'past' && (
                <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1rem,2vw,1.5rem)] overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#f9fafb] border-b border-[#e5e7eb]">
                        <span className="font-['Nunito'] font-medium text-sm text-[#6b7280]">Date</span>
                        <span className="font-['Nunito'] font-medium text-sm text-[#6b7280]">Time</span>
                        <span className="font-['Nunito'] font-medium text-sm text-[#6b7280]">Student</span>
                        <span className="font-['Nunito'] font-medium text-sm text-[#6b7280]">Subject</span>
                    </div>
                    {isLoading ? (
                        <PastSessionsLoadingSkeleton />
                    ) : sessions.length === 0 ? (
                        <div className="p-6 text-center"><p className="font-['Nunito'] text-sm text-[#6b7280]">No past sessions</p></div>
                    ) : (
                        sessions.map(session => (
                            <div key={session.id} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-[#e5e7eb] last:border-b-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-['Poppins'] font-medium text-lg text-[#181818]">{session.formatted_day}</span>
                                    <span className="font-['Nunito'] text-sm text-[#6b7280]">{session.formatted_month}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-['Nunito'] font-semibold text-sm text-[#338078]">{session.formatted_start_time}</span>
                                    <span className="font-['Nunito'] text-xs text-[#9ca3af]">{session.formatted_end_time}</span>
                                </div>
                                <span className="font-['Nunito'] text-sm text-[#181818]">{session.student.name}</span>
                                <span className="font-['Nunito'] text-sm text-[#181818]">{session.subject.name}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function AvailabilityLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)] animate-pulse">
            <div className="h-4 w-64 bg-[#e5e7eb] rounded" />
            <div className="flex items-center gap-3">
                <div className="h-4 w-24 bg-[#e5e7eb] rounded" />
                <div className="h-6 w-11 bg-[#e5e7eb] rounded-full" />
            </div>
            <div className="flex flex-col gap-3">
                <div className="h-5 w-40 bg-[#e5e7eb] rounded" />
                <div className="h-4 w-56 bg-[#e5e7eb] rounded" />
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-8 w-12 bg-[#e5e7eb] rounded-lg" />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <div className="h-5 w-44 bg-[#e5e7eb] rounded" />
                <div className="h-4 w-52 bg-[#e5e7eb] rounded" />
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-[#e5e7eb] rounded" />
                                <div className="h-4 w-20 bg-[#e5e7eb] rounded" />
                            </div>
                            <div className="flex items-center gap-4 ml-6">
                                <div className="flex flex-col gap-1">
                                    <div className="h-3 w-8 bg-[#e5e7eb] rounded" />
                                    <div className="h-10 w-36 bg-[#e5e7eb] rounded-lg" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="h-3 w-6 bg-[#e5e7eb] rounded" />
                                    <div className="h-10 w-36 bg-[#e5e7eb] rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-11 w-32 bg-[#e5e7eb] rounded-[56px]" />
        </div>
    );
}

function SessionsLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="flex flex-col items-end min-w-[5rem] gap-1">
                        <div className="h-5 w-16 bg-[#e5e7eb] rounded" />
                        <div className="h-3 w-12 bg-[#e5e7eb] rounded" />
                    </div>
                    <div className="w-px h-12 bg-[#e5e7eb]" />
                    <div className="flex-1 bg-[#f3f4f6] rounded-xl px-4 py-3 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="h-4 w-20 bg-[#e5e7eb] rounded" />
                            <div className="h-5 w-32 bg-[#e5e7eb] rounded" />
                        </div>
                        <div className="h-9 w-24 bg-[#e5e7eb] rounded-[56px]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function PastSessionsLoadingSkeleton() {
    return (
        <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-6 bg-[#e5e7eb] rounded" />
                        <div className="h-4 w-16 bg-[#e5e7eb] rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-16 bg-[#e5e7eb] rounded" />
                        <div className="h-3 w-12 bg-[#e5e7eb] rounded" />
                    </div>
                    <div className="h-4 w-24 bg-[#e5e7eb] rounded" />
                    <div className="h-4 w-20 bg-[#e5e7eb] rounded" />
                </div>
            ))}
        </div>
    );
}

function SessionCard({ session, onJoin }: { session: Session; onJoin: (session: Session) => void }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end min-w-[5rem]">
                <span className="font-['Poppins'] font-semibold text-lg text-[#338078]">{session.formatted_start_time}</span>
                <span className="font-['Nunito'] text-xs text-[#9ca3af]">{session.formatted_end_time}</span>
            </div>
            <div className="w-px h-12 bg-[#e5e7eb]" />
            <div className="flex-1 bg-[#e4f7f4] rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="font-['Nunito'] text-sm text-[#6b7280]">{session.subject.name}</span>
                    <span className="font-['Poppins'] font-medium text-[#181818]">{session.student.name}</span>
                </div>
                {session.can_join && (
                    <Button onClick={() => onJoin(session)} className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm px-4 h-9">
                        Join Session
                    </Button>
                )}
            </div>
        </div>
    );
}
