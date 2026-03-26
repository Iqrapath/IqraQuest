import { router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarExport } from '@/components/ui/calendar-export';
import { useFormatDate } from '@/lib/format';
import { useCountdown } from '@/hooks/use-countdown';

export interface BookingReview {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface BookingData {
    id: number;
    subject: { id: number; name: string; image?: string };
    teacher: { id: number; name: string; avatar: string | null };
    student: { id: number; name: string; avatar: string | null };
    formatted_date: string;
    formatted_time: string;
    display_status: string;
    can_cancel: boolean;
    can_reschedule: boolean;
    can_rate: boolean;
    has_review?: boolean;
    review?: BookingReview | null;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: string;
    payment_status: string;
    total_price: number;
    currency: string;
    can_join: boolean;
    can_dispute: boolean;
    can_confirm_release?: boolean;
    meeting_link: string | null;
    judgment_reason?: string | null;
    payment_info?: {
        status: string;
        label: string;
        description: string;
        color: 'teal' | 'amber' | 'green' | 'red' | 'orange' | 'gray';
    };
}

type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'in_review' | 'disputed' | 'rescheduling' | 'awaiting_approval';
type UserRole = 'student' | 'guardian' | 'teacher';

interface BookingCardProps {
    booking: BookingData;
    status: BookingStatus;
    userRole?: UserRole;
    showBorder?: boolean;
    onViewDetails?: (booking: BookingData) => void;
    onReschedule?: (booking: BookingData) => void;
    onCancel?: (booking: BookingData) => void;
    onViewSummary?: (booking: BookingData) => void;
    onRateTeacher?: (booking: BookingData) => void;
    onMessageTeacher?: (booking: BookingData) => void;
    onJoinClass?: (booking: BookingData) => void;
    onRebook?: (booking: BookingData) => void;
    onRaiseDispute?: (booking: BookingData) => void;
    onConfirmRelease?: (booking: BookingData) => void;
}

export function BookingCard(props: BookingCardProps) {
    const { booking, status, userRole = 'student', showBorder = true } = props;
    const { formatDate } = useFormatDate();
    const countdown = useCountdown(booking.start_time, booking.duration_minutes);

    const isTeacher = userRole === 'teacher';
    const isGuardian = userRole === 'guardian';
    const person = isTeacher ? booking.student : booking.teacher;

    const displayTime = booking.formatted_time || `${formatDate(booking.start_time, 'p')} - ${formatDate(booking.end_time, 'p')}`;

    return (
        <div className={cn('px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1rem,2vw,1.5rem)]', showBorder && 'border-b border-[#e5e7eb]')}>
            <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)]">
                {/* Subject Info Row */}
                <div className="flex gap-[clamp(0.75rem,1.5vw,1rem)] items-start">
                    <SubjectImage name={booking.subject.name} image={booking.subject.image} />
                    <div className="flex flex-col gap-1 flex-1">
                        <h3 className="font-['Poppins'] font-medium text-[clamp(0.875rem,1.5vw,1rem)] text-[#181818]">
                            {booking.subject.name}
                        </h3>
                        <p className="font-['Poppins'] font-normal text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#6b7280]">
                            {isTeacher ? booking.student.name : `Ustadh ${person.name}`}
                            {isGuardian && booking.student?.name && (
                                <span className="ml-2 pl-2 border-l border-gray-300 text-gray-500">
                                    For: <span className="font-medium text-gray-700">{booking.student.name}</span>
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Date/Time and Status Row */}
                <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] flex-wrap">
                    <DateTimeBadge date={booking.formatted_date || formatDate(booking.start_time)} time={displayTime} />
                    <StatusBadge status={booking.display_status} />
                    {isTeacher && booking.payment_info && (
                        <PaymentStatusBadge info={booking.payment_info} />
                    )}

                    {/* Real-time Countdown for Upcoming */}
                    {status === 'upcoming' && countdown.isSoon && !countdown.isLive && !countdown.isExpired && (
                        <div className="flex items-center gap-1.5 px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.125rem,0.25vw,0.25rem)] rounded-[clamp(0.25rem,0.5vw,0.375rem)] bg-[#338078]/10 text-[#338078] font-['Nunito'] font-bold text-[clamp(0.625rem,1vw,0.75rem)] animate-pulse">
                            <Icon icon="solar:alarm-bold-duotone" className="w-4 h-4" />
                            <span>Starts in: {countdown.formatted}</span>
                        </div>
                    )}
                </div>

                {/* Actions Row */}
                <Actions {...props} />

                {isTeacher && booking.judgment_reason && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-start gap-2 max-w-2xl">
                        <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-[#338078] mt-0.5 flex-shrink-0" />
                        <p className="text-[clamp(0.7rem,1.1vw,0.8rem)] text-[#4b5563] leading-relaxed italic">
                            <span className="font-bold text-[#374151] not-italic">Arbiter Ruling:</span> {booking.judgment_reason}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SubjectImage({ name, image }: { name: string; image?: string }) {
    return (
        <div className="h-[clamp(3.5rem,6vw,4.5rem)] w-[clamp(3.5rem,6vw,4.5rem)] rounded-[clamp(0.5rem,1vw,0.75rem)] bg-[#f3f4f6] overflow-hidden flex-shrink-0">
            {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9]">
                    <Icon icon="mdi:book-open-page-variant" className="h-8 w-8 text-[#338078]" />
                </div>
            )}
        </div>
    );
}

function DateTimeBadge({ date, time }: { date: string; time: string }) {
    return (
        <div className="bg-[#fff9e9] flex items-center rounded-[clamp(0.25rem,0.5vw,0.375rem)] overflow-hidden">
            <span className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.125rem,0.25vw,0.25rem)] font-['Nunito'] text-[clamp(0.625rem,1vw,0.75rem)] text-[#338078]">
                {date}
            </span>
            <span className="text-[#338078] opacity-30">|</span>
            <span className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.125rem,0.25vw,0.25rem)] font-['Nunito'] text-[clamp(0.625rem,1vw,0.75rem)] text-[#338078]">
                {time}
            </span>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        upcoming: { bg: 'bg-[#fff9e9]', text: 'text-[#338078]', label: 'Upcoming' },
        ongoing: { bg: 'bg-[#e4f7f4]', text: 'text-[#338078]', label: 'In Progress' },
        completed: { bg: 'bg-[#e4f7f4]', text: 'text-[#338078]', label: 'Completed' },
        cancelled: { bg: 'bg-[#fde8e8]', text: 'text-[#771d1d]', label: 'Cancelled' },
        awaiting_approval: { bg: 'bg-[#fff9e9]', text: 'text-[#f5ad7e]', label: 'Awaiting Approval' },
        in_review: { bg: 'bg-[#fff9e9]', text: 'text-[#f5ad7e]', label: 'In Review' },
        disputed: { bg: 'bg-[#fde8e8]', text: 'text-[#771d1d]', label: 'Disputed' },
        rescheduling: { bg: 'bg-[#fff9e9]', text: 'text-[#f5ad7e]', label: 'Rescheduling' },
    };

    const { bg, text, label } = config[status] || config.upcoming;

    return (
        <span className={cn('px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.125rem,0.25vw,0.25rem)] rounded-[clamp(0.25rem,0.5vw,0.375rem)] font-["Nunito"] font-medium text-[clamp(0.625rem,1vw,0.75rem)]', bg, text)}>
            {label}
        </span>
    );
}

export function PaymentStatusBadge({ info }: { info: NonNullable<BookingData['payment_info']> }) {
    const colorMap = {
        teal: 'bg-[#e4f7f4] text-[#338078]',
        amber: 'bg-[#fff9e9] text-[#f5ad7e]',
        green: 'bg-[#ecfdf5] text-[#059669]',
        red: 'bg-[#fef2f2] text-[#dc2626]',
        orange: 'bg-[#fff7ed] text-[#ea580c]',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <div className="group relative flex items-center">
            <span className={cn(
                'px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.125rem,0.25vw,0.25rem)] rounded-[clamp(0.25rem,0.5vw,0.375rem)] font-["Nunito"] font-medium text-[clamp(0.625rem,1vw,0.75rem)] flex items-center gap-1 cursor-help',
                colorMap[info.color] || colorMap.gray
            )}>
                <Icon icon="solar:wallet-bold-duotone" className="w-3 h-3" />
                {info.label}
            </span>
            {info.description && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl">
                    {info.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}


function Actions(props: BookingCardProps) {
    const { booking, status, userRole = 'student' } = props;
    const { onViewDetails, onReschedule, onCancel, onViewSummary, onRateTeacher, onMessageTeacher, onJoinClass, onRebook, onRaiseDispute, onConfirmRelease } = props;
    const isTeacher = userRole === 'teacher';

    const handleCancel = () => {
        if (onCancel) {
            onCancel(booking);
        } else if (confirm('Are you sure you want to cancel this booking?')) {
            router.post(`/${userRole}/booking/${booking.id}/cancel`);
        }
    };

    const handleJoinClass = () => {
        if (onJoinClass) {
            onJoinClass(booking);
        } else if (booking.meeting_link) {
            window.open(booking.meeting_link, '_blank');
        }
    };

    const handleRebook = () => {
        if (onRebook) {
            onRebook(booking);
        } else {
            // Navigate with rebook_from param to pre-fill subject and duration
            router.visit(`/${userRole}/book/${booking.teacher.id}?rebook_from=${booking.id}`);
        }
    };

    // Upcoming: View Details (filled), Reschedule (outline), Add to Calendar, Cancel Booking (text link)
    if (status === 'upcoming') {
        return (
            <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] flex-wrap">
                <Button
                    size="sm"
                    onClick={() => onViewDetails?.(booking)}
                    className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)] cursor-pointer"
                >
                    View Details
                </Button>
                {booking.can_reschedule && onReschedule && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            console.log('Reschedule button clicked for booking:', booking.id);
                            e.preventDefault();
                            e.stopPropagation();
                            onReschedule(booking);
                        }}
                        className="rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)] cursor-pointer"
                    >
                        Reschedule
                    </Button>
                )}
                <CalendarExport
                    bookingId={booking.id}
                    size="sm"
                    className="rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)]"
                />
                {booking.can_cancel && (
                    <button
                        onClick={handleCancel}
                        className="font-['Nunito'] font-normal text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#338078] hover:text-[#2a6b64] hover:underline cursor-pointer"
                    >
                        Cancel Booking
                    </button>
                )}
            </div>
        );
    }

    // Ongoing: Join Class (filled), Message Teacher (outline with icon)
    if (status === 'ongoing') {
        return (
            <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] flex-wrap">
                {booking.can_join && (
                    <Button
                        size="sm"
                        onClick={handleJoinClass}
                        className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)] cursor-pointer"
                    >
                        Join Class
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMessageTeacher?.(booking)}
                    className="rounded-[56px] border-b-2  border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)] gap-2 cursor-pointer"
                >
                    <Icon icon="fluent:chat-24-regular" className="h-4 w-4" />
                    {isTeacher ? 'Message Learner' : 'Message Teacher'}
                </Button>
            </div>
        );
    }

    // Completed & In Review: View Summary (filled), Rebook (outline), Rate Teacher (text link)
    if (status === 'completed' || status === 'in_review') {
        return (
            <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] flex-wrap">
                <Button
                    size="sm"
                    onClick={() => onViewSummary?.(booking)}
                    className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)] cursor-pointer"
                >
                    View Summary
                </Button>
                {!isTeacher && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRebook}
                            className="rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-[clamp(0.75rem,1.25vw,0.875rem)] px-[clamp(1rem,2vw,1.25rem)] h-[clamp(2rem,3.5vw,2.5rem)] cursor-pointer"
                        >
                            Rebook
                        </Button>
                        {booking.can_rate && (
                            <button
                                onClick={() => onRateTeacher?.(booking)}
                                className="font-['Nunito'] font-normal text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#338078] hover:text-[#2a6b64] hover:underline cursor-pointer"
                            >
                                Rate Teacher
                            </button>
                        )}
                        {booking.can_confirm_release && onConfirmRelease && (
                            <button
                                onClick={() => onConfirmRelease?.(booking)}
                                className="font-['Nunito'] font-normal text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#f5ad7e] hover:text-[#e49b6d] hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <Icon icon="solar:wallet-bold-duotone" className="w-4 h-4" />
                                Release Funds
                            </button>
                        )}
                        {booking.can_dispute && (
                            <button
                                onClick={() => onRaiseDispute?.(booking)}
                                className="font-['Nunito'] font-normal text-[clamp(0.75rem,1.25vw,0.875rem)] text-[#dc2626] hover:text-[#b91c1c] hover:underline cursor-pointer"
                            >
                                Raise Dispute
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    }

    return null;
}
