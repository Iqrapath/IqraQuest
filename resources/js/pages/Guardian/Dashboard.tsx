import { Head, Link, router } from '@inertiajs/react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { toast } from 'sonner';
import GuardianOnboardingModal from '@/components/GuardianOnboardingModal';
import HeroBanner from './components/HeroBanner';
import GuardianStatsCard from './components/GuardianStatsCard';
import ProfileInfoCard from './components/ProfileInfoCard';
import ProgressCard from './components/ProgressCard';
import { BookingCard, JoinClassModal, CancelBookingModal, type BookingData } from '@/components/bookings';
import { TopRatedTeachers } from '@/components/Teachers/TopRatedTeachers';
import { TeacherProfileModal } from '@/components/Teachers/TeacherProfileModal';
import { Button } from '@/components/ui/button';

interface DashboardProps {
    guardian: {
        name: string;
        email: string;
        children_count: number;
        active_plan: string;
    };
    stats: {
        total_classes: number;
        completed: number;
        upcoming_count: number;
    };
    upcomingClasses: BookingData[];
    topTeachers: any[];
    progress: {
        label: string;
        percentage: number;
        subjects: Array<{ name: string; status: string; color: string }>;
    };
}

export default function Dashboard({ guardian, stats, upcomingClasses, topTeachers, progress }: DashboardProps) {
    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

    const statsItems = [
        {
            title: 'Total Class',
            value: stats.total_classes,
            icon: <Icon icon="healthicons:i-training-class-outline" className="w-8 h-8" />,
            gradient: 'from-[#EDF7F6] to-[#EDF7F6]'
        },
        {
            title: 'Class Completed',
            value: stats.completed,
            icon: <Icon icon="ph:student" className="w-8 h-8" />,
            gradient: 'from-[#F0F7FF] to-[#F0F7FF]'
        },
        {
            title: 'Upcoming Class',
            value: stats.upcoming_count,
            icon: <Icon icon="material-symbols-light:pending-outline" className="w-8 h-8" />,
            gradient: 'from-[#FFF9E6] to-[#FFF9E6]'
        }
    ];

    const handleViewDetails = (booking: BookingData) => {
        router.visit(`/guardian/bookings/${booking.id}/details`);
    };

    const handleReschedule = (booking: BookingData) => {
        router.visit(`/guardian/booking/${booking.id}/reschedule`);
    };

    const handleTeacherClick = (teacherId: number) => {
        setSelectedTeacherId(teacherId);
        setTeacherModalOpen(true);
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

    return (
        <div className="flex flex-col gap-0 -mt-0">
            <Head title="Guardian Dashboard" />

            {/* Top Banner Section */}
            <div className="w-full">
                <HeroBanner
                    name={guardian.name}
                    subtitle="Easily manage your children's Quran learning journey - add, book, and track each child's progress from one place."
                />
            </div>

            {/* Main Content Area - Overlapping with Banner */}
            <div className="container mx-auto px-6 -mt-25 relative z-20 pb-12">
                {/* Stats Row - The Overlapping Card */}
                <GuardianStatsCard
                    stats={statsItems}
                    headerAction={
                        <Link href="/guardian/teachers" className="text-[#338078] font-bold text-sm hover:underline transition-all">Browse Teachers</Link>
                    }
                />

                <div className="mt-10 flex flex-col gap-10">
                    {/* Profile Info Card - Matches Figma exactly */}
                    <ProfileInfoCard
                        guardian={guardian}
                        onAddChild={() => setIsAddChildOpen(true)}
                    />

                    {/* Progress Card Section - High Fidelity with Mock Data */}
                    <ProgressCard
                        goalTitle={progress.label}
                        percentage={progress.percentage}
                        subjects={progress.subjects}
                    />

                    {/* Upcoming Classes Section */}
                    <div className="bg-white border border-[#e5e7eb] rounded-[clamp(1.5rem,3vw,2rem)] overflow-hidden shadow-sm">
                        <div className="px-[clamp(1.5rem,3vw,2rem)] py-[clamp(1rem,2vw,1.5rem)] border-b border-[#e5e7eb] flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-['Poppins'] font-medium text-[clamp(1rem,2vw,1.25rem)] text-black">
                                Upcoming Class
                            </h2>
                            <Link href="/guardian/bookings?status=upcoming" className="text-[#338078] font-bold text-sm hover:underline">
                                View All
                            </Link>
                        </div>

                        {upcomingClasses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <Icon icon="mdi:calendar-clock" className="h-16 w-16 text-[#d1d5db] mb-4" />
                                <h3 className="font-['Poppins'] font-medium text-lg text-[#374151] mb-2">No upcoming classes</h3>
                                <p className="font-['Nunito'] text-sm text-[#6b7280] mb-4 text-center">Book a session with a teacher for your child!</p>
                                <Link href="/guardian/teachers">
                                    <Button className="bg-[#338078] hover:bg-[#2a6b64] text-white rounded-[56px] font-['Nunito'] font-semibold">
                                        Browse Teachers
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {upcomingClasses.slice(0, 3).map((booking, index) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        status="upcoming"
                                        userRole="guardian"
                                        showBorder={index !== Math.min(upcomingClasses.length, 3) - 1}
                                        onViewDetails={handleViewDetails}
                                        onReschedule={handleReschedule}
                                        onCancel={handleCancelBooking}
                                        onJoinClass={handleJoinClass}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Rated Teachers */}
                    <TopRatedTeachers
                        teachers={topTeachers}
                        onTeacherClick={handleTeacherClick}
                    />
                </div>
            </div>

            <GuardianOnboardingModal
                isOpen={isAddChildOpen}
                initialStep={2}
                onComplete={() => {
                    setIsAddChildOpen(false);
                    router.reload();
                }}
                onSkip={() => setIsAddChildOpen(false)}
            />

            {/* Modals for Booking Actions */}
            <JoinClassModal
                open={joinModalOpen}
                onOpenChange={setJoinModalOpen}
                booking={selectedBooking}
                studentName={guardian.name.split(' ')[0]}
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
                    userRole="guardian"
                />
            )}

            {/* Teacher Profile Modal */}
            {selectedTeacherId && (
                <TeacherProfileModal
                    isOpen={teacherModalOpen}
                    onClose={() => {
                        setTeacherModalOpen(false);
                        setSelectedTeacherId(null);
                    }}
                    teacherId={selectedTeacherId}
                />
            )}
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <GuardianLayout children={page} />;
