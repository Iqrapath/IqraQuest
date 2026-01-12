import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { SessionCard } from './SessionCard';
import { SessionsLoadingSkeleton, PastSessionsLoadingSkeleton } from './Skeletons';

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

interface YourScheduleProps {
    activeSessionTab: 'upcoming' | 'past';
    sessions: Session[];
    counts: { upcoming: number; past: number };
    onSessionTabChange: (tab: 'upcoming' | 'past') => void;
    onJoinSession: (session: Session) => void;
    isLoading: boolean;
    serverDate: string;
}

export function YourSchedule({ activeSessionTab, sessions, counts, onSessionTabChange, onJoinSession, isLoading, serverDate }: YourScheduleProps) {
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
