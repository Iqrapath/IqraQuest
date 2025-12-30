import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import AdminStatsCard from './components/AdminStatsCard';
import RevenueChart from './components/RevenueChart';
import RecentStudentsList from './components/RecentStudentsList';
import RecentBookingsList from './components/RecentBookingsList';

interface DashboardProps {
    stats: {
        total_teachers: number;
        active_students: number;
        active_subscriptions: number;
        pending_verifications: number;
    };
    revenue_data: { label: string; total: number }[];
    current_filter: string;
    recent_students: any[];
    recent_bookings: any[];
}

export default function Dashboard({ stats, revenue_data, current_filter, recent_students, recent_bookings }: DashboardProps) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold font-['Nunito'] text-[#101928]">Overview</h1>
                </div>

                {/* Stats Section */}
                <AdminStatsCard stats={stats} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Revenue Chart */}
                    <div className="lg:col-span-8 self-stretch">
                        <RevenueChart data={revenue_data} currentFilter={current_filter} />
                    </div>

                    {/* Right Column: Recent Activity */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <RecentStudentsList
                            students={recent_students}
                            totalStudents={stats.active_students}
                        />
                        <RecentBookingsList bookings={recent_bookings} />
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
