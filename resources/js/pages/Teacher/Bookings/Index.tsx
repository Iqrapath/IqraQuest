import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import TeacherLayout from '@/layouts/TeacherLayout';
import { TeacherBookingCard, BookingData } from './Components/TeacherBookingCard';
import { TeacherBookingTabs, defaultTeacherBookingTabs } from './Components/TeacherBookingTabs';
import { JoinClassModal, SessionSummaryModal, CancelBookingModal } from '@/components/bookings';
import { SharedData } from '@/types';
import { cn } from '@/lib/utils';

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

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return;

        setActiveTab(tab);
        setIsLoading(true);

        router.get(
            '/teacher/bookings',
            { status: tab },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['bookings', 'counts', 'currentStatus'],
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleMessageLearner = (booking: BookingData) => {
        router.post(`/teacher/messages/booking/${booking.id}`);
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

    const handleConfirmCancel = (reason?: string) => {
        if (!selectedBooking) return;

        setIsCancelling(true);
        router.post(
            `/teacher/booking/${selectedBooking.id}/cancel`,
            { reason },
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

    return (
        <>
            <Head title="My Bookings" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-[#192020] font-primary mb-2">My Bookings</h1>
                    <p className="text-gray-600">
                        Manage your teaching schedule and student sessions. Track upcoming, ongoing, and completed classes.
                    </p>
                </div>

                {/* Filter/Tab Section (Styled like Request Filters) */}
                <div>
                    <TeacherBookingTabs
                        tabs={defaultTeacherBookingTabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        counts={counts}
                        disabled={isLoading}
                    />
                </div>

                {/* Subheader */}
                <div className="flex justify-between items-center mb-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab} Classes</h2>
                        <p className="text-gray-500 text-sm mt-1">{bookings.total} Sessions found</p>
                    </div>
                </div>

                {/* Grid (Matches Request Page Grid) */}
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <BookingSkeleton key={n} />
                            ))}
                        </div>
                    ) : bookings.data.length === 0 ? (
                        <EmptyState status={activeTab} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.data.map((booking) => (
                                <TeacherBookingCard
                                    key={booking.id}
                                    booking={booking}
                                    status={activeTab as any}
                                    onJoinClass={handleJoinClass}
                                    onMessageLearner={handleMessageLearner}
                                    onViewSummary={handleViewSummary}
                                    onCancel={handleCancelBooking}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && bookings.last_page > 1 && (
                    <div className="flex justify-center pt-8 border-t border-gray-100">
                        <Pagination links={bookings.links} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <JoinClassModal
                open={joinModalOpen}
                onOpenChange={setJoinModalOpen}
                booking={selectedBooking as any}
                studentName={auth.user?.name?.split(' ')[0] || 'Teacher'}
            />

            <SessionSummaryModal
                open={summaryModalOpen}
                onOpenChange={setSummaryModalOpen}
                booking={selectedBooking as any}
                userRole="teacher"
            />

            {selectedBooking && selectedBooking.subject && (
                <CancelBookingModal
                    open={cancelModalOpen}
                    onOpenChange={setCancelModalOpen}
                    onConfirm={handleConfirmCancel}
                    bookingId={selectedBooking.id}
                    subjectName={selectedBooking.subject.name}
                    teacherName={selectedBooking.student.name}
                    dateTime={`${selectedBooking.formatted_date} | ${selectedBooking.formatted_time}`}
                    isLoading={isCancelling}
                    userRole="teacher"
                />
            )}
        </>
    );
}

function BookingSkeleton() {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
            <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 shadow-sm" />
                <div className="space-y-2 py-1">
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-3 w-16 bg-gray-50 rounded" />
                </div>
            </div>
            <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-gray-50 rounded" />
                <div className="h-4 w-3/4 bg-gray-50 rounded" />
            </div>
            <div className="space-y-3 mb-6">
                <div className="bg-gray-50/50 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <div className="h-3 w-12 bg-gray-100 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <div className="h-3 w-12 bg-gray-100 rounded" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                <div className="space-y-2">
                    <div className="h-6 w-16 bg-gray-100 rounded" />
                    <div className="h-2 w-12 bg-gray-50 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="w-24 h-9 bg-gray-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}

function Pagination({ links }: { links: PaginationLink[] }) {
    return (
        <div className="flex items-center gap-2">
            {links.map((link, i) => (
                <button
                    key={i}
                    onClick={() => link.url && router.get(link.url)}
                    disabled={!link.url}
                    className={cn(
                        "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                        link.active
                            ? 'bg-[#358D83] text-white shadow-lg shadow-teal-900/10'
                            : 'bg-white border border-gray-100 text-gray-500 hover:border-teal-200 hover:text-[#358D83]',
                        !link.url && 'opacity-30 cursor-not-allowed grayscale'
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

function EmptyState({ status }: { status: string }) {
    const messages: Record<string, { icon: string; title: string; description: string }> = {
        upcoming: {
            icon: 'ph:calendar-x-bold',
            title: 'No upcoming classes',
            description: 'Your upcoming teaching sessions will appear here.',
        },
        ongoing: {
            icon: 'ph:video-camera-slash-bold',
            title: 'No ongoing classes',
            description: 'Classes currently in progress will be shown here.',
        },
        completed: {
            icon: 'ph:check-circle-bold',
            title: 'No completed classes',
            description: 'History of your finished classes will be kept here.',
        },
        cancelled: {
            icon: 'ph:prohibit-bold',
            title: 'No cancelled classes',
            description: 'Details of any cancelled sessions will appear here.',
        },
    };

    const { icon, title, description } = messages[status] || messages.upcoming;

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[32px] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Icon icon={icon} className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#192020] mb-2">{title}</h3>
            <p className="text-gray-400 font-medium text-center max-w-sm leading-relaxed">{description}</p>
        </div>
    );
}

MyBookings.layout = (page: React.ReactNode) => <TeacherLayout children={page} hideRightSidebar={true} />;
