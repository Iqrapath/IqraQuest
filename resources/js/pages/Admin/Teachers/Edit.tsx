import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import TeacherProfileHeader from '@/components/Teachers/TeacherProfileHeader';
import TeacherContactBar from '@/components/Teachers/TeacherContactBar';
import TeacherAboutSection from '@/components/Teachers/TeacherAboutSection';
import TeacherSubjectsSection from '@/components/Teachers/TeacherSubjectsSection';
import TeacherDocumentsSection from '@/components/Teachers/TeacherDocumentsSection';
import TeacherPerformanceStats from '@/components/Teachers/TeacherPerformanceStats';
import TeacherActionButtons from '@/components/Teachers/TeacherActionButtons';

interface Teacher {
    id: number;
    status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
    country: string;
    city: string;
    experience_years: number;
    hourly_rate: number;
    preferred_currency: string;
    bio: string;
    qualifications: string;
    qualification_level: string;
    timezone: string;
    teaching_mode: string;
    teaching_type?: string;
    preferred_language?: string;
    created_at: string;
    user: {
        name: string;
        email: string;
        phone?: string;
        role: string;
        avatar?: string;
    };
    subjects: {
        id: number;
        name: string;
    }[];
    certificates?: {
        id: number;
        name: string;
        title: string;
        file_path: string;
        file_name: string;
        verification_status: string;
        certificate_type: string;
    }[];
    availability?: {
        day_of_week: string;
        start_time: string;
        end_time: string;
        is_available: boolean;
    }[];
    rating?: number;
    review_count?: number;
}

interface Props {
    teacher: Teacher;
    stats: {
        total_subjects: number;
        total_certificates: number;
        verified_certificates: number;
        availability_days: number;
        total_sessions_taught: number;
        average_rating: number;
        upcoming_sessions: {
            id: number;
            date: string;
            time: string;
            student_name: string;
            subject: string;
        }[];
    };
    availableSubjects: {
        id: number;
        name: string;
    }[];
}

export default function TeacherEdit({ teacher, stats, availableSubjects }: Props) {
    // Prepare earnings data for the header component
    const earnings = {
        wallet_balance: 18500, // TODO: Get from backend
        total_earned: 210000, // TODO: Get from backend
        pending_payouts: 15000, // TODO: Get from backend
        currency: '₦', // TODO: Get from teacher's currency
    };

    const subjectsList = teacher.subjects.map(s => s.name).join(', ');

    return (
        <>
            <Head title={`Edit Teacher - ${teacher.user.name}`} />

            <div className="w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3.5 mb-8">
                    <Link
                        href="/admin/teachers"
                        className="text-gray-500 font-light font-['Nunito'] hover:text-gray-700 transition-colors flex items-center gap-2 group"
                        style={{ fontSize: 'clamp(14px,1.11vw,16px)' }}
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Teacher Management
                    </Link>
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <Link
                        href={`/admin/teachers/${teacher.id}`}
                        className="text-gray-500 font-light font-['Nunito'] hover:text-gray-700 transition-colors"
                        style={{ fontSize: 'clamp(14px,1.11vw,16px)' }}
                    >
                        Teacher Profile
                    </Link>
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-[#141522] font-semibold font-['Nunito']" style={{ fontSize: 'clamp(14px,1.11vw,16px)' }}>
                        Edit Teacher
                    </span>
                </div>

                {/* Profile Header */}
                <TeacherProfileHeader teacher={teacher} earnings={earnings} />

                {/* Contact & Info Bar */}
                <TeacherContactBar
                    teacher={teacher}
                    subjects={subjectsList}
                    sessions_count={stats.total_sessions_taught}
                />

                {/* About Section */}
                <TeacherAboutSection teacher={teacher} />

                {/* Subjects & Specialization Section */}
                <TeacherSubjectsSection teacher={teacher} availableSubjects={availableSubjects} />

                {/* Documents Section */}
                <TeacherDocumentsSection teacher={teacher} />

                {/* Performance Stats Section */}
                <TeacherPerformanceStats stats={stats} />

                {/* Action Buttons */}
                <TeacherActionButtons teacher={teacher} />
            </div>
        </>
    );
}

TeacherEdit.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
