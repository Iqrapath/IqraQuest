import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react'; // Link import
import SessionDetailsModal from './SessionDetailsModal';

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
    notes?: string | null;
}

interface TeacherUpcomingSessionsProps {
    sessions: Session[];
    serverDate: string; // YYYY-MM-DD
}

export default function TeacherUpcomingSessions({ sessions, serverDate }: TeacherUpcomingSessionsProps) {
    // Parse server date without timezone conversion (YYYY-MM-DD format)
    const parseServerDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const [selectedDate, setSelectedDate] = useState<Date>(() => parseServerDate(serverDate));
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const today = parseServerDate(serverDate);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday start
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        return monday;
    });

    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

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
    const isToday = (date: Date) => date.toDateString() === parseServerDate(serverDate).toDateString();

    // Filter sessions for selected date
    const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dailySessions = sessions.filter(s => s.date_key === selectedDateKey);

    return (
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)] rounded-[32px] bg-white p-6 md:p-8 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Your Upcoming Sessions</h2>
                <Link href="/teacher/schedule" className="text-[#2c7870] hover:text-[#236158] font-medium text-sm hover:underline">
                    Manage Availability
                </Link>
            </div>

            {/* Calendar Widget */}
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
                        const hasSession = sessions.some(s => s.date_key === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "flex flex-col items-center py-3 px-2 rounded-xl transition-all relative",
                                    isSelected(date) ? 'bg-[#338078] text-white' : 'hover:bg-[#f3f4f6]',
                                    isToday(date) && !isSelected(date) && 'ring-2 ring-[#338078] ring-inset'
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

            {/* Session List */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Icon icon="mdi:calendar" className="h-5 w-5 text-[#338078]" />
                    <span className="font-['Poppins'] font-medium text-[#181818]">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>

                {dailySessions.length === 0 ? (
                    <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 text-center">
                        <Icon icon="mdi:calendar-blank" className="h-12 w-12 text-[#d1d5db] mx-auto mb-3" />
                        <p className="font-['Nunito'] text-sm text-[#6b7280]">No sessions scheduled for this day</p>
                    </div>
                ) : (
                    dailySessions.map(session => (
                        <div key={session.id} className="flex items-center gap-4">
                            {/* Date Box */}
                            <div className="flex flex-col items-center justify-center bg-[#fdf8e8] text-[#92400e] rounded-xl w-16 h-16 shrink-0">
                                <span className="text-[10px] uppercase font-bold">{session.formatted_month}</span>
                                <span className="text-xl font-bold leading-none">{session.formatted_day}</span>
                            </div>

                            {/* Session Details */}
                            <div className="flex-1 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{session.student.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="px-2 py-0.5 rounded border border-gray-300 text-xs font-medium text-gray-600 bg-white">
                                            {session.formatted_start_time} - {session.formatted_end_time}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {session.can_join && (
                                        <a
                                            href={`/classroom/${session.id}`}
                                            className="px-4 py-2 bg-[#338078] text-white text-sm font-medium rounded-full hover:bg-[#2b6b64] transition-colors shadow-sm animate-pulse"
                                        >
                                            Join Class
                                        </a>
                                    )}
                                    <button
                                        className="text-[#2c7870] hover:text-[#236158] font-medium text-sm hover:underline cursor-pointer"
                                        onClick={() => setSelectedSession(session)}
                                    >View Details</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <SessionDetailsModal
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                session={selectedSession}
            />
        </div>
    );
}
