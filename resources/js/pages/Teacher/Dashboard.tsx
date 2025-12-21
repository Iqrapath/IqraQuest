import { Head, usePage, Link } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import TeacherStatsCard from './components/TeacherStatsCard';
import TeacherUpcomingSessions from './components/TeacherUpcomingSessions';
import { Icon } from '@iconify/react';
import { SharedData } from '@/types';

interface DashboardProps {
    stats: {
        active_students: number;
        upcoming_sessions: number;
        pending_requests: number;
    };
    sessions: any[]; // Using specific type in component
    serverDate: string;
}

export default function Dashboard({ stats, sessions, serverDate }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const userName = auth.user.name.split(' ')[0]; // First name

    const statItems = [
        {
            title: 'Active Students:',
            value: stats.active_students,
            icon: <Icon icon="ph:student" className="w-6 h-6" />,
            gradient: 'from-[#f0fdf4] to-transparent', // Light Mint
        },
        {
            title: 'Upcoming Sessions:',
            value: stats.upcoming_sessions,
            icon: <Icon icon="material-symbols-light:event-note" className="w-6 h-6" />,
            gradient: 'from-[#fdf4ff] to-transparent', // Light purple/yellow mix
        },
        {
            title: 'Pending Request',
            value: stats.pending_requests > 0 ? stats.pending_requests : '-',
            icon: <Icon icon="material-symbols-light:pending-outline" className="w-6 h-6" />,
            gradient: 'from-[#fffbeb] to-transparent', // Light orange/yellow
        },
    ];

    return (
        <TeacherLayout>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-8 pb-10">
                {/* Welcome Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="font-['Poppins'] text-[32px] font-normal text-[#181818]">
                        Welcome <span className="font-semibold">{userName}</span>
                    </h1>
                </div>

                {/* Stats Card */}
                <TeacherStatsCard
                    stats={statItems}
                    headerAction={
                        <Link href="/teacher/requests" className="bg-[#338078] hover:bg-[#2a6b64] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                            View Requests
                        </Link>
                    }
                />

                {/* Upcoming Sessions */}
                <TeacherUpcomingSessions
                    sessions={sessions}
                    serverDate={serverDate}
                />
            </div>
        </TeacherLayout>
    );
}
