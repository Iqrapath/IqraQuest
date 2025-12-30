import { Head, usePage, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AdminLayout from '@/layouts/AdminLayout';
import StudentActionButtons from '@/components/Students/StudentActionButtons';
import StudentStatusBadge from '@/components/Students/StudentStatusBadge';
import StudentProfileHeader from '@/components/Students/StudentProfileHeader';
import StudentContactBar from '@/components/Students/StudentContactBar';
import LearningPreferencesCard from '@/components/Students/LearningPreferencesCard';
import BookingActivityCard from '@/components/Students/BookingActivityCard';

interface Booking {
    id: number;
    subject: { name: string };
    teacher: { user: { name: string } };
    start_time: string;
    status: string;
    category?: string;
}

interface StudentData {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
        avatar_url?: string;
        role: string;
    };
    city: string;
    country: string;
    status: string;
    joined_at: string;
    sessions_count: number;
    subjects: string;
    preferred_times: string;
    age_group: string;
    related_users: Array<{ name: string; avatar?: string; age?: number }>;
}

interface PageProps {
    [key: string]: unknown;
    student: StudentData;
    bookings: Booking[];
    stats: {
        attendance_rate: number;
        missed_sessions: number;
        first_session_date?: string;
        upcoming_sessions?: number;
    };
    all_subjects: string[];
}


function StudentShow() {
    const { student, bookings, stats, all_subjects } = usePage<PageProps>().props;

    const isGuardian = student.user.role === 'guardian';

    return (
        <>
            <Head title={`${student.user.name} - Profile`} />

            <div className="">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-3 text-lg mb-6 px-4 md:px-8">
                    <Link href="/admin/students" className="text-gray-500 font-light font-['Nunito'] hover:text-[#338078] transition-colors">
                        Dashboard
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-[#141522] font-semibold font-['Nunito']">Student/Parent Profile</span>
                </nav>

                {/* Profile Header - Using the StudentProfileHeader component */}
                <StudentProfileHeader student={student} />

                {/* Contact Info Bar - Using the StudentContactBar component */}

                <StudentContactBar student={student} />

                {/* Learning Preferences Card */}
                <LearningPreferencesCard student={student} availableSubjects={all_subjects} />



                {/* Learning Progress Link */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-[0px_4px_16px_rgba(75,112,245,0.08)] border border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="font-['Nunito'] text-gray-500">Learning Progress</span>
                        <button className="text-[#338078] text-sm font-['Nunito'] hover:underline">
                            Track Learning Progress
                        </button>
                    </div>
                </div>

                {/* Booking Activity */}
                <BookingActivityCard bookings={bookings} stats={stats} studentId={student.id} />

                {/* Action Buttons */}
                <StudentActionButtons student={student} />
            </div>
        </>
    );
}

StudentShow.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;

export default StudentShow;
