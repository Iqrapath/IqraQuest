import { Head, Link, router, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { useState } from 'react';
import { toast } from 'sonner';
import { BookingCard, JoinClassModal, SessionSummaryModal, CancelBookingModal, type BookingData } from '@/components/bookings';
import { SharedData } from '@/types';

interface Props {
    stats: {
        total: number;
        completed: number;
        upcoming: number;
    };
    allBookings: BookingData[];
    upcomingBookings: BookingData[];
}

export default function QuickStart({ stats, allBookings, upcomingBookings }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState<'total' | 'completed' | 'upcoming'>('total');
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

    const tabs = [
        { id: 'total' as const, label: 'Total Class', count: stats.total },
        { id: 'completed' as const, label: 'Completed Class', count: stats.completed },
        { id: 'upcoming' as const, label: 'Upcoming class', count: stats.upcoming },
    ];

    // Determine which bookings to show
    let displayedBookings: BookingData[] = [];
    if (activeTab === 'upcoming') {
        displayedBookings = upcomingBookings;
    } else if (activeTab === 'completed') {
        displayedBookings = allBookings.filter(b => b.status === 'completed');
    } else {
        // Total - show all
        displayedBookings = allBookings;
    }

    // Booking Card Handlers
    const handleViewDetails = (booking: BookingData) => {
        router.visit(`/student/bookings/${booking.id}/details`);
    };

    const handleReschedule = (booking: BookingData) => {
        router.visit(`/student/booking/${booking.id}/reschedule`);
    };

    const handleJoinClass = (booking: BookingData) => {
        setSelectedBooking(booking);
        setJoinModalOpen(true);
    };

    const handleCancelBooking = (booking: BookingData) => {
        setSelectedBooking(booking);
        setCancelModalOpen(true);
    };

    const handleViewSummary = (booking: BookingData) => {
        setSelectedBooking(booking);
        setSummaryModalOpen(true);
    };

    const handleRateTeacher = (booking: BookingData) => {
        setSelectedBooking(booking);
        setSummaryModalOpen(true);
    };

    const handleMessageTeacher = (booking: BookingData) => {
        router.post(`/student/messages/booking/${booking.id}`);
    };

    const handleConfirmCancel = (reason?: string, cancelSeries?: boolean) => {
        if (!selectedBooking) return;

        setIsCancelling(true);
        router.post(
            `/student/booking/${selectedBooking.id}/cancel`,
            { reason, cancel_series: cancelSeries },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCancelModalOpen(false);
                    setIsCancelling(false);
                    toast.success('Booking cancelled successfully');
                },
                onError: () => {
                    setIsCancelling(false);
                    toast.error('Failed to cancel booking');
                },
            },
        );
    };

    const handleSubmitReview = (rating: number, feedback: string) => {
        if (!selectedBooking) return;

        const bookingId = selectedBooking.id;

        router.post(
            `/student/bookings/${bookingId}/review`,
            { rating, feedback },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Thank you for your review!', {
                        description: 'Your feedback helps other students find great teachers.',
                    });
                },
                onError: (errors: Record<string, string>) => {
                    toast.error(errors.error || 'Failed to submit review');
                },
            }
        );
    };

    const handleUpdateReview = (rating: number, feedback: string) => {
        if (!selectedBooking) return;

        const bookingId = selectedBooking.id;

        router.put(
            `/student/bookings/${bookingId}/review`,
            { rating, feedback },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Review updated!', {
                        description: 'Your changes have been saved.',
                    });
                },
                onError: (errors: Record<string, string>) => {
                    toast.error(errors.error || 'Failed to update review');
                },
            }
        );
    };

    const formatDateTime = (booking: BookingData) => {
        return `${booking.formatted_date} | ${booking.formatted_time}`;
    };

    return (
        <StudentLayout>
        <div className="flex flex-col gap-8 pb-20">
            <Head title="Quick Start" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[clamp(1rem,2vw,1.15rem)] font-medium">
                <Link href="/student/dashboard" className="text-[#374151] hover:underline">Dashboard</Link>
                <span className="text-[#374151]">&gt;</span>
                <span className="text-[#374151]">Quick start</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-100 pb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative pb-4 font-['Poppins'] font-medium text-[clamp(0.9rem,1.5vw,1.1rem)] transition-colors ${activeTab === tab.id
                            ? 'text-[#1a1d56]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.label} ({tab.count})
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#338078] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content based on active tab */}
            <div className="flex flex-col gap-6">
                {displayedBookings.length === 0 ? (
                    <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1.5rem,3vw,2rem)] p-8 text-center text-gray-500">
                        No classes found in this category.
                    </div>
                ) : (
                    <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1.5rem,3vw,2rem)]">
                        <div className="px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1rem,2vw,1.5rem)] border-b border-[#e5e7eb]">
                            <h2 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.25rem)] text-black capitalize">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                        </div>
                        <div className="flex flex-col">
                            {displayedBookings.map((booking, index) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    status={booking.status === 'confirmed' ? 'upcoming' : booking.status as any}
                                    userRole="student"
                                    showBorder={index !== displayedBookings.length - 1}
                                    onViewDetails={handleViewDetails}
                                    onReschedule={handleReschedule}
                                    onCancel={handleCancelBooking}
                                    onJoinClass={handleJoinClass}
                                    onViewSummary={handleViewSummary}
                                    onRateTeacher={handleRateTeacher}
                                    onMessageTeacher={handleMessageTeacher}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <JoinClassModal
                open={joinModalOpen}
                onOpenChange={setJoinModalOpen}
                booking={selectedBooking}
                studentName={auth?.user?.name?.split(' ')[0] || 'Student'}
            />

            <SessionSummaryModal
                open={summaryModalOpen}
                onOpenChange={setSummaryModalOpen}
                booking={selectedBooking}
                userRole="student"
                onSubmitReview={handleSubmitReview}
                onUpdateReview={handleUpdateReview}
            />

            {selectedBooking && (
                <CancelBookingModal
                    open={cancelModalOpen}
                    onOpenChange={setCancelModalOpen}
                    onConfirm={handleConfirmCancel}
                    bookingId={selectedBooking.id}
                    subjectName={selectedBooking.subject.name}
                    teacherName={selectedBooking.teacher.name}
                    dateTime={formatDateTime(selectedBooking)}
                    isLoading={isCancelling}
                    userRole="student"
                />
            )}
        </div>
</StudentLayout>
    );
}
