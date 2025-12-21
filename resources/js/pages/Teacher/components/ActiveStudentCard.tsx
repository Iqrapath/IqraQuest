import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import StudentProfileModal from './StudentProfileModal';

interface UpcomingSession {
    id: number;
    start_time: string;
    end_time: string;
    day: string;
    subject: string;
}

interface NextSession {
    id: number;
    date: string;
    time: string;
    subject: string;
}

interface Student {
    id: number;
    name: string;
    avatar: string | null;
    email: string;
    level: string;
    location: string | null;
    sessions_completed: number;
    total_hours?: number;
    subjects?: string[];
    last_session_date?: string | null;
    next_session?: NextSession | null;
    booking_id?: number;
    // Additional fields for modal
    joined_date?: string;
    age?: number | null;
    gender?: string | null;
    preferred_learning_time?: string | null;
    learning_goal?: string | null;
    available_days?: string[];
    booking_status?: string | null;
    upcoming_sessions?: UpcomingSession[];
}

interface ActiveStudentCardProps {
    student: Student;
}

export default function ActiveStudentCard({ student }: ActiveStudentCardProps) {
    const [showMessageTooltip, setShowMessageTooltip] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleMessageClick = () => {
        if (student.booking_id) {
            router.post(`/teacher/messages/booking/${student.booking_id}`);
        } else {
            setShowMessageTooltip(true);
            setTimeout(() => setShowMessageTooltip(false), 3000);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getLevelStyle = (level: string) => {
        const l = level.toLowerCase();
        if (l.includes('beginner')) return { bg: 'bg-[#def7e4]', text: 'text-[#338078]', icon: 'ph:plant-fill' };
        if (l.includes('intermediate')) return { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]', icon: 'ph:star-fill' };
        if (l.includes('advanced')) return { bg: 'bg-[#dbeafe]', text: 'text-[#2563eb]', icon: 'ph:crown-fill' };
        return { bg: 'bg-[#def7e4]', text: 'text-[#338078]', icon: 'ph:plant-fill' };
    };

    const levelStyle = getLevelStyle(student.level);

    return (
        <div className="bg-white rounded-[20px] p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0px_6px_24px_rgba(0,0,0,0.1)] transition-shadow">
            {/* Header - Avatar and Basic Info */}
            <div className="flex gap-4 mb-4">
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-[#338078] flex items-center justify-center">
                        {student.avatar ? (
                            <img
                                src={student.avatar.startsWith('http') ? student.avatar : `/storage/${student.avatar}`}
                                alt={student.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-['Nunito'] font-bold text-[24px] text-white">
                                {getInitials(student.name)}
                            </span>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-[18px] h-[18px] bg-[#22c55e] rounded-full border-[3px] border-white" />
                </div>

                {/* Name and Level */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-['Nunito'] font-bold text-[16px] text-[#111928] mb-1.5" title={student.name}>
                        {student.name}
                    </h3>
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full",
                        levelStyle.bg
                    )}>
                        <Icon icon={levelStyle.icon} className={cn("w-3.5 h-3.5", levelStyle.text)} />
                        <span className={cn("font-['Nunito'] font-medium text-[12px]", levelStyle.text)}>
                            {student.level}
                        </span>
                    </div>
                    {/* Location */}
                    {student.location && (
                        <div className="flex items-center gap-1 mt-1.5">
                            <Icon icon="ph:map-pin" className="w-3.5 h-3.5 text-[#9ca3af]" />
                            <span className="font-['Nunito'] text-[11px] text-[#6b7280] truncate">
                                {student.location}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Subjects */}
            {student.subjects && student.subjects.length > 0 && (
                <div className="mb-4">
                    <p className="font-['Nunito'] font-medium text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1.5">
                        Subjects
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {student.subjects.slice(0, 3).map((subject, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-[#f3f4f6] rounded-full font-['Nunito'] text-[11px] text-[#374151]"
                            >
                                {subject}
                            </span>
                        ))}
                        {student.subjects.length > 3 && (
                            <span className="px-2 py-0.5 bg-[#f3f4f6] rounded-full font-['Nunito'] text-[11px] text-[#6b7280]">
                                +{student.subjects.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Sessions */}
                <div className="bg-[#f9fafb] rounded-xl p-3">
                    <p className="font-['Nunito'] font-medium text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">
                        Sessions
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Icon icon="ph:chalkboard-teacher" className="w-4 h-4 text-[#338078]" />
                        <span className="font-['Nunito'] font-bold text-[18px] text-[#111928]">
                            {student.sessions_completed}
                        </span>
                    </div>
                </div>

                {/* Total Hours */}
                <div className="bg-[#f9fafb] rounded-xl p-3">
                    <p className="font-['Nunito'] font-medium text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1">
                        Total Hours
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Icon icon="ph:clock" className="w-4 h-4 text-[#338078]" />
                        <span className="font-['Nunito'] font-bold text-[18px] text-[#111928]">
                            {student.total_hours ?? 0}h
                        </span>
                    </div>
                </div>
            </div>

            {/* Last Session / Next Session */}
            <div className="flex items-center justify-between mb-4 py-2 border-t border-b border-gray-100 text-[11px]">
                {student.last_session_date ? (
                    <div className="flex items-center gap-1.5">
                        <Icon icon="ph:calendar-check" className="w-4 h-4 text-[#9ca3af]" />
                        <span className="font-['Nunito'] text-[#6b7280]">
                            Last: {student.last_session_date}
                        </span>
                    </div>
                ) : (
                    <span className="font-['Nunito'] text-[#9ca3af]">No past sessions</span>
                )}
                {student.next_session ? (
                    <div className="flex items-center gap-1.5">
                        <Icon icon="ph:calendar-blank" className="w-4 h-4 text-[#338078]" />
                        <span className="font-['Nunito'] text-[#338078] font-medium">
                            Next: {student.next_session.date}
                        </span>
                    </div>
                ) : (
                    <span className="font-['Nunito'] text-[#9ca3af]">No upcoming</span>
                )}
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="font-['Nunito'] font-bold text-[14px] text-[#338078] hover:text-[#2a6962] hover:underline transition-colors"
                >
                    View Profile
                </button>

                <div className="flex items-center gap-2 rounded-full  border-b-2 border-[#e5e7eb]">
                    {/* Message Button */}
                    <div className="relative">
                        <button
                            onClick={handleMessageClick}
                            className="w-[38px] h-[38px] rounded-full  flex items-center justify-center text-[#6b7280] hover:border-[#338078] hover:text-[#338078] hover:bg-[#f0fdf9] transition-all"
                            title="Message Student"
                        >
                            <Icon icon="ph:chat-circle-text" className="w-[18px] h-[18px]" />
                        </button>
                        {showMessageTooltip && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111928] text-white text-[11px] rounded-lg whitespace-nowrap z-10">
                                No booking to message
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111928]" />
                            </div>
                        )}
                    </div>

                    {/* Video Call Button - Links to classroom */}
                    {student.next_session ? (
                        <Link
                            href={`/classroom/${student.next_session.id}`}
                            className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[#6b7280] hover:border-[#338078] hover:text-[#338078] hover:bg-[#f0fdf9] transition-all"
                            title="Join Classroom"
                        >
                            <Icon icon="ph:video-camera" className="w-[18px] h-[18px]" />
                        </Link>
                    ) : (
                        <button
                            className="w-[38px] h-[38px] rounded-full  flex items-center justify-center text-[#d1d5db] cursor-not-allowed"
                            title="No upcoming session"
                            disabled
                        >
                            <Icon icon="ph:video-camera" className="w-[18px] h-[18px]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Student Profile Modal */}
            <StudentProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                student={{
                    id: student.id,
                    name: student.name,
                    avatar: student.avatar,
                    email: student.email,
                    level: student.level,
                    location: student.location,
                    joined_date: student.joined_date || 'N/A',
                    age: student.age ?? null,
                    gender: student.gender ?? null,
                    preferred_learning_time: student.preferred_learning_time ?? null,
                    subjects: student.subjects || [],
                    learning_goal: student.learning_goal ?? null,
                    available_days: student.available_days || [],
                    booking_status: student.booking_status ?? null,
                    upcoming_sessions: student.upcoming_sessions || [],
                    booking_id: student.booking_id ?? null,
                }}
            />
        </div>
    );
}
