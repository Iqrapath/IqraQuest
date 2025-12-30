import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

interface StatsProps {
    stats: {
        total_teachers: number;
        active_students: number;
        active_subscriptions: number;
        pending_verifications: number;
    };
}

export default function AdminStatsCard({ stats }: StatsProps) {
    const statItems = [
        {
            title: 'Total Teachers',
            value: stats.total_teachers.toLocaleString(),
            icon: <Icon icon="ph:chalkboard-teacher-light" className="w-8 h-8" />,
            gradient: 'from-[#ECFDF5] to-white', // Green-50 to white
            textClass: 'text-[#059669]', // Green-600
        },
        {
            title: 'Active Students',
            value: stats.active_students.toLocaleString(),
            icon: <Icon icon="ph:student-light" className="w-8 h-8" />,
            gradient: 'from-[#ECFEFF] to-white', // Cyan-50 to white
            textClass: 'text-[#0891B2]', // Cyan-600

        },
        {
            title: 'Active Subscriptions',
            value: stats.active_subscriptions.toLocaleString(),
            icon: <Icon icon="fluent:calendar-checkmark-20-regular" className="w-8 h-8" />,
            gradient: 'from-[#FAF5FF] to-white', // Purple-50 to white
            textClass: 'text-[#9333EA]', // Purple-600
        },
        {
            title: 'Pending Verifications',
            value: stats.pending_verifications.toLocaleString(),
            icon: <Icon icon="heroicons:ellipsis-horizontal-circle" className="w-8 h-8" />,
            gradient: 'from-[#FFFBEB] to-white', // Amber-50 to white
            textClass: 'text-[#D97706]', // Amber-600
        },
    ];

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-md border border-gray-100 relative mb-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#101928] font-['Nunito']">Your Stats</h2>
                <Link
                    href="/admin/verifications/"
                    className="bg-[#338078] hover:bg-[#2a6b64] text-white px-6 py-2.5 rounded-[16px] text-sm font-bold font-['Nunito'] transition-colors shadow-md hover:shadow-lg"
                >
                    Approve New Teachers
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statItems.map((item, index) => (
                    <div
                        key={index}
                        className={`bg-gradient-to-l ${item.gradient} rounded-full py-5 px-8 relative h-32 border border-white  flex items-center justify-between`}
                    >
                        <div className="flex flex-col justify-center gap-2">
                            <div className={`${item.textClass} opacity-80`}>
                                {item.icon}
                            </div>
                            <div className="text-sm text-gray-600 font-bold font-['Nunito'] leading-tight">
                                {item.title}
                            </div>
                        </div>
                        <div className={`text-4xl font-bold font-['Nunito'] ${item.textClass} drop-shadow-sm`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-left">
                {/* Changed to text-right to match viewing pattern or keep left if desired. Left is usually better for reading flow. */}
                <Link
                    href="/admin/teachers"
                    className="text-[#338078] font-bold text-sm font-['Nunito'] hover:underline"
                >
                    View Profiles
                </Link>
            </div>
        </div>
    );
}
