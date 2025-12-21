import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import ActiveStudentCard from '../components/ActiveStudentCard';
import TeacherUpcomingSessions from '../components/TeacherUpcomingSessions';

// Shared type definition 
export interface Student {
    id: number;
    name: string;
    avatar: string | null;
    email: string;
    level: string;
    location: string | null;
    sessions_completed: number;
    total_hours: number;
    subjects: string[];
    last_session_date: string | null;
    next_session: {
        id: number;
        date: string;
        time: string;
        subject: string;
    } | null;
    booking_id?: number;
    joined_date?: string;
    age?: number | null;
    gender?: string | null;
    preferred_learning_time?: string | null;
    learning_goal?: string | null;
    available_days?: string[];
    booking_status?: string | null;
    upcoming_sessions?: {
        id: number;
        start_time: string;
        end_time: string;
        day: string;
        subject: string;
    }[];
}

interface Session {
    id: number;
    student: { id: number; name: string; avatar: string | null };
    subject: { id: number; name: string };
    start_time: string;
    end_time: string;
    date_key: string;
    formatted_date: string;
    formatted_day: string;
    formatted_month: string;
    formatted_start_time: string;
    formatted_end_time: string;
    status: string;
    can_join: boolean;
    meeting_link: string | null;
    notes?: string | null;
}

interface Props {
    stats: {
        active_students: number;
        upcoming_sessions: number;
        pending_requests: number;
    };
    activeStudents: Student[];
    sessions: Session[];
    serverDate: string;
}

export default function QuickStart({ stats, activeStudents, sessions, serverDate }: Props) {
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'pending'>('active');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = activeStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <TeacherLayout>
            <Head title="Teacher Quick Start" />

            <div className="space-y-6">
                {/* Header Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/teacher/dashboard" className="hover:text-[#338078]">Dashboard</Link>
                    <span>&gt;</span>
                    <span className="font-medium text-gray-900">Quick start</span>
                </div>

                {/* Tabs - Underlined Style */}
                <div className="flex items-center gap-8 border-b border-gray-100 pb-0 mb-6 bg-white px-6 rounded-2xl pt-4">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={cn(
                            "pb-4 font-medium text-[16px] transition-all relative",
                            activeTab === 'active' ? "text-[#338078]" : "text-[#9CA3AF]"
                        )}
                    >
                        Active Student ({stats.active_students})
                        {activeTab === 'active' && (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#338078] rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={cn(
                            "pb-4 font-medium text-[16px] transition-all relative",
                            activeTab === 'upcoming' ? "text-[#338078]" : "text-[#9CA3AF]"
                        )}
                    >
                        Upcoming Session ({stats.upcoming_sessions})
                        {activeTab === 'upcoming' && (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#338078] rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={cn(
                            "pb-4 font-medium text-[16px] transition-all relative",
                            activeTab === 'pending' ? "text-[#338078]" : "text-[#9CA3AF]"
                        )}
                    >
                        Pending Request ({stats.pending_requests})
                        {activeTab === 'pending' && (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#338078] rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Active Students Tab */}
                {activeTab === 'active' && (
                    <>
                        {/* Search Bar */}
                        <div className="relative max-w-lg mb-8">
                            <Icon icon="ph:magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#338078]/20 focus:border-[#338078]"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                                <Icon icon="ph:sliders-horizontal" className="w-5 h-5 text-[#338078]" />
                            </button>
                        </div>

                        {/* Student Grid */}
                        {filteredStudents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {filteredStudents.map(student => (
                                    <ActiveStudentCard key={student.id} student={student} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                                <Icon icon="ph:users" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No Active Students</h3>
                                <p className="text-gray-500">Students will appear here after completing sessions with you.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Upcoming Sessions Tab */}
                {activeTab === 'upcoming' && (
                    <TeacherUpcomingSessions sessions={sessions} serverDate={serverDate} />
                )}

                {/* Pending Requests Tab */}
                {activeTab === 'pending' && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Icon icon="ph:clock" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
                        <p className="text-gray-500 mb-4">View and manage booking requests from students.</p>
                        <Link
                            href="/teacher/requests"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#338078] text-white rounded-full font-medium text-sm hover:bg-[#2a6962] transition-colors"
                        >
                            <Icon icon="ph:arrow-right" className="w-4 h-4" />
                            Go to Requests
                        </Link>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
