import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Button } from '@/components/ui/button';
import { BookingTabs, BookingCard, JoinClassModal, SessionSummaryModal, CancelBookingModal, defaultBookingTabs, type BookingData } from '@/components/bookings';
import { SharedData } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    bookings: {
        data: BookingData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
    counts: {
        upcoming: number;
        ongoing: number;
        completed: number;
        cancelled: number;
    };
    currentStatus: string;
}

export default function MyBookings({ bookings, counts, currentStatus }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

    // Sync activeTab with currentStatus from server
    useEffect(() => {
        setActiveTab(currentStatus);
        setIsLoading(false);
    }, [currentStatus]);

    // Update selectedBooking when bookings data changes (e.g., after submitting review)
    useEffect(() => {
        if (selectedBooking) {
            const updatedBooking = bookings.data.find(b => b.id === selectedBooking.id);
            if (updatedBooking) {
                setSelectedBooking(updatedBooking);
            }
        }
    }, [bookings.data]);

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return;

        setActiveTab(tab);
        setIsLoading(true);

        router.get(
            '/guardian/bookings',
            { status: tab },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['bookings', 'counts', 'currentStatus'],
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'upcoming':
                return 'Upcoming Class';
            case 'ongoing':
                return 'Ongoing Class';
            case 'completed':
                return 'Completed Classes';
            case 'cancelled':
                return 'Cancelled Classes';
            default:
                return 'My Bookings';
        }
    };

    const handleViewDetails = (booking: BookingData) => {
        router.visit(`/guardian/bookings/${booking.id}/details`);
    };

    const handleReschedule = (booking: BookingData) => {
        console.log('Guardian handleReschedule called with booking:', booking.id);
        router.visit(`/guardian/booking/${booking.id}/reschedule`, {
            onError: (errors) => {
                console.error('Reschedule navigation error:', errors);
                toast.error('Unable to reschedule this booking');
            },
        });
    };

    const handleViewSummary = (booking: BookingData) => {
        setSelectedBooking(booking);
        setSummaryModalOpen(true);
    };

    const handleRateTeacher = (booking: BookingData) => {
        // Open the summary modal which contains the rating form
        setSelectedBooking(booking);
        setSummaryModalOpen(true);
    };

    const handleMessageTeacher = (booking: BookingData) => {
        // Start a conversation from this booking
        router.post(`/guardian/messages/booking/${booking.id}`);
    };

    const handleJoinClass = (booking: BookingData) => {
        setSelectedBooking(booking);
        setJoinModalOpen(true);
    };

    const handleCancelBooking = (booking: BookingData) => {
        setSelectedBooking(booking);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = (reason?: string, cancelSeries?: boolean) => {
        if (!selectedBooking) return;

        setIsCancelling(true);
        router.post(
            `/guardian/booking/${selectedBooking.id}/cancel`,
            { reason, cancel_series: cancelSeries },
            {
                preserveScroll: true,
                only: ['bookings', 'counts'],
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

    const formatDateTime = (booking: BookingData) => {
        return `${booking.formatted_date} | ${booking.formatted_time}`;
    };

    const handleSubmitReview = (rating: number, feedback: string) => {
        if (!selectedBooking) return;

        router.post(
            `/guardian/bookings/${selectedBooking.id}/review`,
            { rating, feedback },
            {
                preserveScroll: true,
                only: ['bookings', 'counts'],
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

        router.put(
            `/guardian/bookings/${selectedBooking.id}/review`,
            { rating, feedback },
            {
                preserveScroll: true,
                only: ['bookings', 'counts'],
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

    return (
        <GuardianLayout>
            <Head title="My Bookings" />
            <div className="flex flex-col gap-[clamp(1.5rem,3vw,2rem)]">
                {/* Page Title */}
                <h1 className="font-['Poppins'] font-medium text-[clamp(1.25rem,2.5vw,1.5rem)] text-black">
                    My Bookings
                </h1>

                {/* Tab Navigation */}
                <BookingTabs
                    tabs={defaultBookingTabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    counts={counts}
                    disabled={isLoading}
                />

                {/* Bookings Card */}
                <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1.5rem,3vw,2rem)]">
                    {/* Section Title */}
                    <div className="px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1rem,2vw,1.5rem)] border-b border-[#e5e7eb]">
                        <h2 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.25rem)] text-black">
                            {getTabTitle()}
                        </h2>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : bookings.data.length === 0 ? (
                        <EmptyState status={activeTab} />
                    ) : (
                        <div className="flex flex-col">
                            {bookings.data.map((booking, index) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    status={activeTab as 'upcoming' | 'ongoing' | 'completed' | 'cancelled'}
                                    userRole="guardian"
                                    showBorder={index !== bookings.data.length - 1}
                                    onViewDetails={handleViewDetails}
                                    onReschedule={handleReschedule}
                                    onCancel={handleCancelBooking}
                                    onViewSummary={handleViewSummary}
                                    onRateTeacher={handleRateTeacher}
                                    onMessageTeacher={handleMessageTeacher}
                                    onJoinClass={handleJoinClass}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && bookings.last_page > 1 && <Pagination links={bookings.links} />}
                </div>
            </div>

            {/* Join Class Modal */}
            <JoinClassModal
                open={joinModalOpen}
                onOpenChange={setJoinModalOpen}
                booking={selectedBooking}
                studentName={auth.user?.name?.split(' ')[0] || 'Student'}
            />

            {/* Session Summary Modal */}
            <SessionSummaryModal
                open={summaryModalOpen}
                onOpenChange={setSummaryModalOpen}
                booking={selectedBooking}
                userRole="guardian"
                onSubmitReview={handleSubmitReview}
                onUpdateReview={handleUpdateReview}
            />

            {/* Cancel Booking Modal */}
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
                    userRole="guardian"
                />
            )}
        </GuardianLayout>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className={`px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1rem,2vw,1.5rem)] ${i !== 3 ? 'border-b border-[#e5e7eb]' : ''}`}>
                    <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)]">
                        {/* Subject Info Row */}
                        <div className="flex gap-[clamp(0.75rem,1.5vw,1rem)] items-start">
                            <div className="h-[clamp(3.5rem,6vw,4.5rem)] w-[clamp(3.5rem,6vw,4.5rem)] rounded-[clamp(0.5rem,1vw,0.75rem)] bg-gray-200" />
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                                <div className="h-3 w-24 bg-gray-200 rounded" />
                            </div>
                        </div>
                        {/* Date/Time Row */}
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-40 bg-gray-200 rounded" />
                        </div>
                        {/* Actions Row */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-24 bg-gray-200 rounded-full" />
                            <div className="h-8 w-24 bg-gray-200 rounded-full" />
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Pagination({ links }: { links: PaginationLink[] }) {
    return (
        <div className="px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1rem,2vw,1.5rem)] flex justify-center gap-2 border-t border-[#e5e7eb]">
            {links.map((link, i) => (
                <button
                    key={i}
                    onClick={() => link.url && router.get(link.url)}
                    disabled={!link.url}
                    className={`px-3 py-1 rounded-lg text-sm font-['Nunito'] ${link.active
                            ? 'bg-[#338078] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

function EmptyState({ status }: { status: string }) {
    const messages: Record<string, { icon: string; title: string; description: string; action: { label: string; href: string } | null }> = {
        upcoming: {
            icon: 'mdi:calendar-clock',
            title: 'No upcoming classes',
            description: 'Book a session with a teacher for your child!',
            action: { label: 'Browse Teachers', href: '/guardian/courses' },
        },
        ongoing: {
            icon: 'mdi:video-outline',
            title: 'No ongoing classes',
            description: 'Active sessions will appear here.',
            action: null,
        },
        completed: {
            icon: 'mdi:check-circle-outline',
            title: 'No completed classes yet',
            description: 'Finished sessions will appear here.',
            action: { label: 'Browse Teachers', href: '/guardian/courses' },
        },
    };

    const { icon, title, description, action } = messages[status] || messages.upcoming;

    return (
        <div className="flex flex-col items-center justify-center py-[clamp(3rem,6vw,5rem)] px-[clamp(1.5rem,3vw,2rem)]">
            <Icon icon={icon} className="h-16 w-16 text-[#d1d5db] mb-4" />
            <h3 className="font-['Poppins'] font-medium text-lg text-[#374151] mb-2">{title}</h3>
            <p className="font-['Nunito'] text-sm text-[#6b7280] mb-4 text-center">{description}</p>
            {action && (
                <Link href={action.href}>
                    <Button className="bg-[#338078] hover:bg-[#2a6b64] text-white rounded-[56px] font-['Nunito'] font-semibold">
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    );
}
