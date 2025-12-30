import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import StudentProfileHeader from '@/components/Students/StudentProfileHeader';
import PlanOverviewCard from '@/components/Students/PlanOverviewCard';
import ClassHistoryCard from '@/components/Students/ClassHistoryCard';
import AttendanceSummaryCard from '@/components/Students/AttendanceSummaryCard';
import StudentActionButtons from '@/components/Students/StudentActionButtons';

interface ProgressProps {
    student: any;
    user: any; // User object passed explicitly (unused but part of Inertia props)
    bookings: any[];
    stats: any;
    plan: any;
    auth: any;
}

export default function Progress({ student, bookings, stats, plan, auth }: ProgressProps) {
    // Construct student object with status for components that expect it at root
    const studentWithStatus = {
        ...student,
        status: student.user.status
    };

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title={`${student.user.name} - Learning Progress`} />

            <div className="">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-['Nunito']">
                    <Link href="/admin/dashboard" className="hover:text-[#338078]">Dashboard</Link>
                    <span>•</span>
                    <Link href="/admin/students" className="hover:text-[#338078]">Students</Link>
                    <span>•</span>
                    <Link href={`/admin/students/${student.user.id}`} className="hover:text-[#338078]">Profile</Link>
                    <span>•</span>
                    <span className="text-[#101928] font-bold">Learning Progress</span>
                </div>

                <StudentProfileHeader student={studentWithStatus} showProgressButton={false} />

                <div className="space-y-8">
                    <PlanOverviewCard plan={plan} />
                    <ClassHistoryCard bookings={bookings} />
                    <AttendanceSummaryCard stats={stats} />
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center md:justify-start">
                    <StudentActionButtons student={studentWithStatus} />
                </div>
            </div>
        </AdminLayout>
    );
}
