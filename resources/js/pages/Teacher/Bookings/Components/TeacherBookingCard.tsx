import React from 'react';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface BookingData {
    id: number;
    status: string;
    student: {
        id: number;
        name: string;
        avatar: string;
        level?: string;
    };
    subject: {
        id: number;
        name: string;
    };
    start_time: string;
    end_time: string;
    total_price: number | string;
    currency: string;
    formatted_date: string;
    formatted_time: string;
    meeting_link?: string;
    parent_booking_id?: number | null;
}

interface TeacherBookingCardProps {
    booking: BookingData;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    onJoinClass: (booking: BookingData) => void;
    onMessageLearner: (booking: BookingData) => void;
    onViewSummary: (booking: BookingData) => void;
    onCancel: (booking: BookingData) => void;
}

export const TeacherBookingCard: React.FC<TeacherBookingCardProps> = ({
    booking,
    status,
    onJoinClass,
    onMessageLearner,
    onViewSummary,
    onCancel
}) => {
    const isUpcoming = status === 'upcoming';
    const isOngoing = status === 'ongoing';
    const isCompleted = status === 'completed';
    const isCancelled = status === 'cancelled';

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
            {/* Status Decoration for Ongoing */}
            {isOngoing && (
                <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live Now
                    </div>
                </div>
            )}

            {/* Student Header */}
            <div className="flex gap-3 mb-4">
                <Avatar className="w-12 h-12 rounded-full border border-gray-100 shadow-sm">
                    <AvatarImage
                        src={booking.student.avatar ? `/storage/${booking.student.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.student.name)}&background=358D83&color=fff`}
                    />
                    <AvatarFallback className="bg-[#358D83] text-white font-bold text-xs">
                        {booking.student.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-[#192020]">{booking.student.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{booking.student.level || 'Intermediate'}</p>
                </div>
            </div>

            {/* Note Area */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-grow">
                {isCompleted ? 'This session has been completed.' : isCancelled ? 'This session was cancelled.' : `You have a scheduled ${booking.subject.name} session with ${booking.student.name.split(' ')[0]}.`}
            </p>

            {/* Details Grid (Matches Request Page) */}
            <div className="space-y-3 mb-6">
                <div className="bg-gray-50/80 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                        <span className="text-gray-400">Subject</span>
                        <span className="font-bold text-[#358D83]">{booking.subject.name}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                        <span className="text-gray-400">Time</span>
                        <span className="font-medium text-gray-800">{booking.formatted_time}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                        <span className="text-gray-400">Date</span>
                        <span className="font-medium text-gray-800">{booking.formatted_date}</span>
                    </div>
                </div>
            </div>

            {/* Footer: Price & Actions (Matches Request Page) */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <div>
                    <p className="text-[#358D83] font-bold text-lg leading-none">
                        {booking.currency === 'USD' ? '$' : '₦'}{Math.floor(Number(booking.total_price))}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">
                        Session Fee
                    </p>
                </div>

                <div className="flex gap-2">
                    {isOngoing && (
                        <button
                            onClick={() => onJoinClass(booking)}
                            className="px-6 py-2 rounded-full bg-[#358D83] text-white font-bold text-sm hover:bg-[#2b756d] transition-colors shadow-lg shadow-teal-900/10 flex items-center gap-2"
                        >
                            <Icon icon="ph:video-camera-bold" className="w-4 h-4" />
                            Join
                        </button>
                    )}

                    {isUpcoming && (
                        <>
                            <button
                                onClick={() => onMessageLearner(booking)}
                                className="px-4 py-2 rounded-full border border-[#358D83] text-[#358D83] font-bold text-sm hover:bg-teal-50 transition-colors"
                            >
                                Message
                            </button>
                            <button
                                onClick={() => onCancel(booking)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                            >
                                <Icon icon="ph:x-bold" className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {(isCompleted || isCancelled) && (
                        <button
                            onClick={() => onViewSummary(booking)}
                            className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Summary
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
