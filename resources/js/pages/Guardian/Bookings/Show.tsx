import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge, CancelBookingModal } from '@/components/bookings';
import { TeacherProfileModal } from '@/components/Teachers/TeacherProfileModal';
import { CalendarExport } from '@/components/ui/calendar-export';

interface Teacher {
    id: number;
    name: string;
    avatar: string | null;
    specializations: string[];
    location: string | null;
    rating: number;
    total_reviews: number;
    availability_summary: string;
}

interface BookingDetails {
    id: number;
    subject: { id: number; name: string; image?: string };
    teacher: Teacher;
    student: { id: number; name: string };
    start_time: string;
    end_time: string;
    formatted_date: string;
    formatted_time: string;
    duration_minutes: number;
    status: string;
    display_status: string;
    payment_status: string;
    total_price: number;
    currency: string;
    can_cancel: boolean;
    can_reschedule: boolean;
    meeting_link: string | null;
    meeting_platform: string;
    notes: string | null;
}

interface Props {
    booking: BookingDetails;
}

export default function BookingShow({ booking }: Props) {
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const formatDate = () => booking.formatted_date;
    const formatTime = () => booking.formatted_time;

    const formatDuration = () => {
        const minutes = booking.duration_minutes;
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours} Hour${hours > 1 ? 's' : ''}`;
            }
            return `${hours} Hour${hours > 1 ? 's' : ''} ${remainingMinutes} Min`;
        }
        return `${minutes} Minutes`;
    };

    const handleReschedule = () => {
        router.visit(`/guardian/booking/${booking.id}/reschedule`);
    };

    const handleCancel = () => {
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = (reason?: string, cancelSeries?: boolean) => {
        setIsCancelling(true);
        router.post(
            `/guardian/booking/${booking.id}/cancel`,
            { reason, cancel_series: cancelSeries },
            {
                onSuccess: () => {
                    setCancelModalOpen(false);
                    setIsCancelling(false);
                },
                onError: () => {
                    setIsCancelling(false);
                },
            },
        );
    };

    const formatDateTime = () => `${booking.formatted_date} | ${booking.formatted_time}`;

    const handleViewProfile = () => {
        setProfileModalOpen(true);
    };

    const handleMessage = () => {
        // Start a conversation from this booking
        router.post(`/guardian/messages/booking/${booking.id}`);
    };

    return (
        <GuardianLayout>
            <Head title="Class Details" />

            <div className="flex flex-col gap-[clamp(1.5rem,3vw,2rem)]">
                {/* Page Title */}
                <h1 className="font-['Poppins'] font-medium text-[clamp(1.25rem,2.5vw,1.5rem)] text-black">
                    Class Details
                </h1>

                {/* Class Details Card */}
                <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1.5rem,3vw,2rem)]">
                    <div className="flex flex-col sm:flex-row gap-[clamp(1rem,2vw,1.5rem)]">
                        {/* Subject Image */}
                        <div className="w-[clamp(6rem,12vw,8rem)] h-[clamp(6rem,12vw,8rem)] rounded-xl bg-[#f3f4f6] overflow-hidden flex-shrink-0">
                            {booking.subject.image ? (
                                <img
                                    src={booking.subject.image}
                                    alt={booking.subject.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9]">
                                    <Icon icon="mdi:book-open-page-variant" className="h-12 w-12 text-[#338078]" />
                                </div>
                            )}
                        </div>

                        {/* Class Info */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                <h2 className="font-['Poppins'] font-semibold text-[clamp(1.25rem,2.5vw,1.5rem)] text-[#181818]">
                                    {booking.subject.name}
                                </h2>
                                <StatusBadge status={booking.display_status} />
                            </div>

                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-['Poppins'] text-sm text-[#6b7280]">Teacher:</span>
                                    <span className="font-['Poppins'] text-sm text-[#181818]">
                                        Ustadh {booking.teacher.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-['Poppins'] text-sm text-[#6b7280]">Student:</span>
                                    <span className="font-['Poppins'] text-sm text-[#181818]">
                                        {booking.student.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-['Poppins'] text-sm text-[#6b7280]">Class Duration:</span>
                                    <span className="font-['Poppins'] text-sm font-medium text-[#181818]">
                                        {formatDuration()}
                                    </span>
                                </div>
                            </div>

                            {/* Date/Time Badge */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <div className="bg-[#fff9e9] flex flex-col xs:flex-row items-start xs:items-center rounded-lg px-4 py-2 gap-1 xs:gap-0">
                                    <span className="font-['Nunito'] text-sm text-[#338078]">{formatDate()}</span>
                                    <span className="hidden xs:inline mx-3 text-[#338078] opacity-30">|</span>
                                    <span className="font-['Nunito'] text-sm text-[#338078]">{formatTime()}</span>
                                </div>
                            </div>

                            {/* Mode Badge */}
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                                <span className="font-['Poppins'] text-sm text-[#6b7280]">Mode:</span>
                                <div className="bg-[#e4f7f4] border border-[#338078]/20 rounded-full px-4 py-1.5 flex items-center gap-2 w-fit">
                                    <Icon icon="mdi:video-vintage" className="h-4 w-4 text-[#338078]" />
                                    <span className="font-['Nunito'] text-sm font-medium text-[#338078]">IqraClass</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Teacher Details Card */}
                <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1rem,2vw,1.5rem)] p-[clamp(1.5rem,3vw,2rem)]">
                    <h3 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.25rem)] text-[#181818] mb-4">
                        Teacher Details
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-[clamp(1rem,2vw,1.5rem)]">
                        {/* Teacher Avatar */}
                        <div className="w-[clamp(5rem,10vw,6rem)] h-[clamp(5rem,10vw,6rem)] rounded-xl bg-[#f3f4f6] overflow-hidden flex-shrink-0">
                            {booking.teacher.avatar ? (
                                <img
                                    src={booking.teacher.avatar}
                                    alt={booking.teacher.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9]">
                                    <Icon icon="mdi:account" className="h-10 w-10 text-[#338078]" />
                                </div>
                            )}
                        </div>

                        {/* Teacher Info */}
                        <div className="flex-1">
                            <h4 className="font-['Poppins'] font-semibold text-lg text-[#181818] mb-2">
                                Ustadah {booking.teacher.name}
                            </h4>

                            <div className="flex flex-col gap-1.5 mb-3">
                                {booking.teacher.specializations.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-['Poppins'] text-xs text-[#6b7280]">Specialization:</span>
                                        <span className="font-['Poppins'] text-xs text-[#181818]">
                                            {booking.teacher.specializations.join(', ')}
                                        </span>
                                    </div>
                                )}

                                {booking.teacher.location && (
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="mdi:map-marker-outline" className="h-4 w-4 text-[#6b7280]" />
                                        <span className="font-['Poppins'] text-xs text-[#6b7280]">
                                            {booking.teacher.location}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Icon
                                                key={star}
                                                icon={star <= Math.round(booking.teacher.rating) ? 'mdi:star' : 'mdi:star-outline'}
                                                className={`h-4 w-4 ${star <= Math.round(booking.teacher.rating) ? 'text-[#f5ad7e]' : 'text-[#d1d5db]'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-['Poppins'] text-xs text-[#6b7280]">
                                        {booking.teacher.rating.toFixed(1)}/5
                                    </span>
                                </div>

                                {booking.teacher.availability_summary && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-['Poppins'] text-xs text-[#6b7280]">Availability:</span>
                                        <span className="font-['Poppins'] text-xs text-[#181818]">
                                            {booking.teacher.availability_summary}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Teacher Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleViewProfile}
                                    className="font-['Nunito'] text-sm text-[#338078] hover:underline cursor-pointer"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="w-8 h-8 rounded-lg border-b-2 border-[#338078] flex items-center justify-center hover:bg-[#f9fafb] cursor-pointer"
                                >
                                    <Icon icon="fluent:chat-24-regular" className="h-4 w-4 text-[#338078]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {booking.can_reschedule && (
                        <Button
                            onClick={handleReschedule}
                            className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm px-6 h-11 cursor-pointer w-full sm:w-auto"
                        >
                            Reschedule
                        </Button>
                    )}
                    {booking.can_cancel && (
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-sm px-6 h-11 cursor-pointer w-full sm:w-auto"
                        >
                            Cancel Booking
                        </Button>
                    )}
                    <CalendarExport
                        bookingId={booking.id}
                        className="rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-sm px-6 h-11 w-full sm:w-auto"
                    />
                </div>
            </div>

            {/* Teacher Profile Modal */}
            <TeacherProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                teacherId={booking.teacher.id}
                hideBookNow
            />

            {/* Cancel Booking Modal */}
            <CancelBookingModal
                open={cancelModalOpen}
                onOpenChange={setCancelModalOpen}
                onConfirm={handleConfirmCancel}
                bookingId={booking.id}
                subjectName={booking.subject.name}
                teacherName={booking.teacher.name}
                dateTime={formatDateTime()}
                isLoading={isCancelling}
                userRole="guardian"
            />
        </GuardianLayout>
    );
}
