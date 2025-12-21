import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UpcomingSession {
    id: number;
    start_time: string;
    end_time: string;
    day: string;
    subject: string;
}

interface StudentProfile {
    id: number;
    name: string;
    avatar: string | null;
    email: string;
    level: string;
    location: string | null;
    joined_date: string;
    age: number | null;
    gender: string | null;
    preferred_learning_time: string | null;
    subjects: string[];
    learning_goal: string | null;
    available_days: string[];
    booking_status: string | null;
    upcoming_sessions: UpcomingSession[];
    booking_id: number | null;
}

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentProfile | null;
}

export default function StudentProfileModal({ isOpen, onClose, student }: StudentProfileModalProps) {
    if (!student) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleChat = () => {
        if (student.booking_id) {
            router.post(`/teacher/messages/booking/${student.booking_id}`);
            onClose();
        }
    };

    const handleStartClass = () => {
        if (student.upcoming_sessions.length > 0) {
            router.visit(`/classroom/${student.upcoming_sessions[0].id}`);
            onClose();
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-[#def7e4] text-[#338078]';
            case 'pending': return 'bg-[#fef3c7] text-[#d97706]';
            case 'cancelled': return 'bg-[#fee2e2] text-[#dc2626]';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-[680px] max-h-[90vh] p-0 bg-[#f8fafb] rounded-[24px] overflow-hidden border-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Student Profile - {student.name}</DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6 sm:p-8">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-8">
                            {/* Avatar Column */}
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden bg-[#338078] flex items-center justify-center shadow-sm">
                                    {student.avatar ? (
                                        <img
                                            src={student.avatar.startsWith('http') ? student.avatar : `/storage/${student.avatar}`}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-['Nunito'] font-bold text-[36px] sm:text-[48px] text-white">
                                            {getInitials(student.name)}
                                        </span>
                                    )}
                                </div>
                                {/* Name below avatar */}
                                <h2 className="font-['Nunito'] font-bold text-[20px] sm:text-[24px] text-[#111928] mt-4">
                                    {student.name}
                                </h2>
                            </div>

                            {/* Info Column */}
                            <div className="flex flex-col items-center sm:items-start pt-2">
                                {/* Joined Date */}
                                <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#6b7280] mb-3">
                                    Joined: {student.joined_date}
                                </p>

                                {/* Location with left border */}
                                {student.location && (
                                    <div className="flex items-center gap-2 mb-5 pl-4 border-l-[2px] border-gray-300">
                                        <Icon icon="ph:map-pin" className="w-5 h-5 text-[#338078]" />
                                        <span className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#338078]">
                                            {student.location}
                                        </span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-2 px-4 py-2 border border-gray-200 rounded-full bg-white">
                                    <button
                                        onClick={handleChat}
                                        disabled={!student.booking_id}
                                        className={cn(
                                            "flex items-center gap-2 transition-colors",
                                            student.booking_id
                                                ? "text-[#338078] hover:opacity-80"
                                                : "text-gray-400 cursor-not-allowed"
                                        )}
                                    >
                                        <Icon icon="ph:chat-circle-text" className="w-5 h-5" />
                                        <span className="font-['Nunito'] font-medium text-[14px]">Chat</span>
                                    </button>
                                    <div className="w-px h-5 bg-gray-300 mx-2" />
                                    <button
                                        onClick={handleStartClass}
                                        disabled={student.upcoming_sessions.length === 0}
                                        className={cn(
                                            "flex items-center gap-2 transition-colors",
                                            student.upcoming_sessions.length > 0
                                                ? "text-[#338078] hover:opacity-80"
                                                : "text-gray-400 cursor-not-allowed"
                                        )}
                                    >
                                        <Icon icon="ph:video-camera" className="w-5 h-5" />
                                        <span className="font-['Nunito'] font-medium text-[14px]">Start Class</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {/* Student Details Card */}
                            <div className="bg-white rounded-[16px] border border-gray-100 p-5 sm:p-6">
                                <h3 className="font-['Nunito'] font-semibold text-[18px] sm:text-[20px] text-[#111928] mb-5">
                                    Student Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <span className="font-['Nunito'] text-[14px] text-[#6b7280] w-[140px] sm:w-[160px]">Age:</span>
                                        <span className="font-['Nunito'] font-medium text-[14px] text-[#111928]">
                                            {student.age ? `${student.age} years old` : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-['Nunito'] text-[14px] text-[#6b7280] w-[140px] sm:w-[160px]">Gender:</span>
                                        <span className="font-['Nunito'] font-medium text-[14px] text-[#111928]">
                                            {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-['Nunito'] text-[14px] text-[#6b7280] w-[140px] sm:w-[160px]">Preferred Learning Time:</span>
                                        <span className="font-['Nunito'] font-medium text-[14px] text-[#111928]">
                                            {student.preferred_learning_time || 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Preferences Card */}
                            <div className="bg-white rounded-[16px] border border-gray-100 p-5 sm:p-6">
                                <h3 className="font-['Nunito'] font-semibold text-[18px] sm:text-[20px] text-[#111928] mb-5">
                                    Learning Preferences
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <span className="font-['Nunito'] text-[14px] text-[#6b7280] w-[120px] sm:w-[130px]">Subjects:</span>
                                        <span className="font-['Nunito'] font-medium text-[14px] text-[#338078]">
                                            {student.subjects.length > 0 ? student.subjects.join(', ') : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-['Nunito'] text-[14px] text-[#6b7280] w-[120px] sm:w-[130px]">Learning Goal:</span>
                                        <span className="font-['Nunito'] font-medium text-[14px] text-[#111928]">
                                            {student.learning_goal || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-['Nunito'] text-[14px] text-[#6b7280] w-[120px] sm:w-[130px]">Available Days:</span>
                                        <span className="font-['Nunito'] font-medium text-[14px] text-[#111928]">
                                            {student.available_days.length > 0 ? student.available_days.join(', ') : 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Information Card */}
                        <div className="bg-white rounded-[16px] border border-gray-100 p-5 sm:p-6">
                            <div className="flex items-center gap-4 mb-5">
                                <h3 className="font-['Nunito'] font-semibold text-[18px] sm:text-[20px] text-[#111928]">
                                    Booking Information
                                </h3>
                                {student.booking_status && (
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full font-['Nunito'] font-medium text-[13px]",
                                        getStatusColor(student.booking_status)
                                    )}>
                                        {student.booking_status.charAt(0).toUpperCase() + student.booking_status.slice(1)}
                                    </span>
                                )}
                            </div>

                            {student.upcoming_sessions.length > 0 ? (
                                <>
                                    <p className="font-['Nunito'] font-semibold text-[14px] text-[#111928] mb-4">
                                        Upcoming Sessions:
                                    </p>
                                    <div className="space-y-4">
                                        {student.upcoming_sessions.map((session, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                {/* Time Column */}
                                                <div className="flex flex-col min-w-[50px]">
                                                    <span className="font-['Nunito'] font-bold text-[16px] sm:text-[18px] text-[#338078]">
                                                        {session.start_time}
                                                    </span>
                                                    <span className="font-['Nunito'] text-[13px] text-[#6b7280]">
                                                        {session.end_time}
                                                    </span>
                                                </div>
                                                {/* Vertical Divider */}
                                                <div className="w-[3px] h-12 bg-[#e5e7eb] rounded-full" />
                                                {/* Session Info Card */}
                                                <div className="bg-[#f0fdf9] rounded-[10px] px-5 py-3 flex-1">
                                                    <p className="font-['Nunito'] text-[12px] text-[#6b7280] mb-0.5">
                                                        {session.day}
                                                    </p>
                                                    <p className="font-['Nunito'] font-semibold text-[15px] text-[#111928]">
                                                        {session.subject}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="font-['Nunito'] text-[14px] text-[#6b7280]">
                                    No upcoming sessions scheduled.
                                </p>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
