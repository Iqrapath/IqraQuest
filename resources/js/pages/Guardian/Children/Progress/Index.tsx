import { Head, Link } from '@inertiajs/react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Icon } from '@iconify/react';
import AttendanceTracker from './components/AttendanceTracker';
import WeeklyAttendanceChart from './components/WeeklyAttendanceChart';
import ProgressCard from '@/pages/Guardian/components/ProgressCard';
import TeacherFeedbackCard from './components/TeacherFeedbackCard';

interface Props {
    child: {
        id: number;
        name: string;
        avatar: string | null;
    };
    stats: {
        attendance: any;
        weekly_stats: any[];
        memorization: {
            goal: string;
            completed_percentage: number;
            subjects_status: any[];
            upcoming_goal: string;
        };
        feedback: any[];
    };
}

export default function ProgressIndex({ child, stats }: Props) {
    return (
        <div className="flex flex-col gap-8 pb-20">
            <Head title={`Progress - ${child.name}`} />

            {/* Breadcrumb / Header */}
            <div className="flex items-center gap-2 text-[clamp(1rem,2vw,1.15rem)] font-medium">
                <Link href="/guardian/dashboard" className="text-[#374151] hover:underline">Dashboard</Link>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-1" />
                <span className="text-[#338078]">View Progress</span>
            </div>

            <div className="max-w-[1000px] flex flex-col gap-8">
                {/* Section Title */}
                <div className="flex flex-col gap-2">
                    <h1 className="font-['Nunito'] font-bold text-[32px] text-[#1a1d56]">Progress Overview</h1>
                    <p className="text-gray-500 text-[18px] max-w-[700px] leading-relaxed">
                        Track your child's Quran learning journey — attendance, memorization, and teacher feedback all in one glance.
                    </p>
                </div>

                {/* 1. Attendance Tracker */}
                <AttendanceTracker attendance={stats.attendance} />

                {/* 2. Weekly Class Attendance (Full Width) */}
                <WeeklyAttendanceChart stats={stats.weekly_stats} />

                {/* 3. Upcoming Goal Card (Full Width) */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.05)] p-6 border border-gray-100 flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#338078] shrink-0" />
                    <p className="font-['Nunito'] text-[clamp(1rem,1.5vw,1.15rem)]">
                        <span className="font-bold text-[#1a1d56]">Upcoming Goal:</span>
                        <span className="text-gray-500 ml-2">{stats.memorization.upcoming_goal}</span>
                    </p>
                </div>

                {/* 4. Memorization Progress (Using Existing ProgressCard for Premium look) */}
                <div className="flex flex-col gap-6">
                    <h2 className="font-['Nunito'] font-bold text-[28px] text-[#1a1d56]">Memorization Progress</h2>
                    <ProgressCard
                        goalTitle={stats.memorization.goal}
                        percentage={stats.memorization.completed_percentage}
                        subjects={stats.memorization.subjects_status.map(s => ({
                            name: s.name,
                            status: s.level,
                            color: s.color
                        }))}
                    />
                    <button className="text-[#338078] font-semibold text-[15px] hover:underline flex items-center gap-2 mt-[-8px]">
                        Download Progress Report PDF
                        <Icon icon="solar:download-minimalistic-bold" className="w-5 h-5" />
                    </button>
                </div>

                {/* Feedback Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-['Nunito'] font-bold text-[28px] text-[#1a1d56]">Feedback from Teachers</h2>
                        <p className="text-gray-400 text-[15px]">Latest Feedback (Apr 12, Ustadh Kareem):</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {stats.feedback.map((f, i) => (
                            <TeacherFeedbackCard key={i} feedback={f} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

ProgressIndex.layout = (page: React.ReactNode) => <GuardianLayout children={page} />;
