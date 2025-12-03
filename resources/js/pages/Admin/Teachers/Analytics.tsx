import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface Teacher {
    id: number;
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}

interface Session {
    id: number;
    date: string;
    time: string;
    student_name: string;
    student_avatar?: string;
    subject: string;
    duration: string;
    rating: number;
    status: 'completed' | 'upcoming' | 'cancelled';
}

interface TopStudent {
    id: number;
    name: string;
    avatar?: string;
    sessions_count: number;
    total_hours: number;
}

interface Props {
    teacher: Teacher;
    overview: {
        total_sessions: number;
        total_students: number;
        average_rating: number;
        total_revenue: number;
        active_students: number;
        completion_rate: number;
    };
    charts: {
        sessions_timeline: { month: string; sessions: number }[];
        subject_distribution: { name: string; value: number }[];
        peak_hours: { hour: string; sessions: number }[];
        rating_timeline: { month: string; rating: number }[];
    };
    recent_sessions: Session[];
    top_students: TopStudent[];
}

const COLORS = ['#338078', '#FF8042', '#00C49F', '#FFBB28', '#8884D8', '#FF6B9D'];

export default function TeacherAnalytics({ teacher, overview, charts, recent_sessions, top_students }: Props) {
    return (
        <>
            <Head title={`Analytics - ${teacher.user.name}`} />

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
                        {teacher.user.name}
                    </Link>
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-[#141522] font-semibold font-['Nunito']" style={{ fontSize: 'clamp(14px,1.11vw,16px)' }}>
                        Performance Analytics
                    </span>
                </div>

                {/* Page Title */}
                <h1 className="font-['Nunito'] font-bold text-2xl md:text-3xl text-[#101928] mb-6">
                    Performance Analytics
                </h1>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-['Nunito'] text-sm text-gray-500">Total Sessions</p>
                            <Icon icon="solar:chart-square-bold" className="w-8 h-8 text-[#338078]" />
                        </div>
                        <p className="font-['Nunito'] font-bold text-3xl text-[#101928]">{overview.total_sessions}</p>
                        <p className="font-['Nunito'] text-xs text-gray-500 mt-1">All time</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-['Nunito'] text-sm text-gray-500">Total Students</p>
                            <Icon icon="solar:users-group-rounded-bold" className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="font-['Nunito'] font-bold text-3xl text-[#101928]">{overview.total_students}</p>
                        <p className="font-['Nunito'] text-xs text-gray-500 mt-1">Unique students taught</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-['Nunito'] text-sm text-gray-500">Average Rating</p>
                            <Icon icon="solar:star-bold" className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="font-['Nunito'] font-bold text-3xl text-[#101928]">{overview.average_rating}</p>
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Icon
                                        key={star}
                                        icon={star <= Math.round(overview.average_rating) ? "mdi:star" : "mdi:star-outline"}
                                        className="w-5 h-5"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-['Nunito'] text-sm text-gray-500">Total Revenue</p>
                            <Icon icon="solar:dollar-minimalistic-bold" className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="font-['Nunito'] font-bold text-3xl text-[#101928]">₦{overview.total_revenue.toLocaleString()}</p>
                        <p className="font-['Nunito'] text-xs text-gray-500 mt-1">Earnings to date</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-['Nunito'] text-sm text-gray-500">Active Students</p>
                            <Icon icon="solar:user-check-bold" className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="font-['Nunito'] font-bold text-3xl text-[#101928]">{overview.active_students}</p>
                        <p className="font-['Nunito'] text-xs text-gray-500 mt-1">Currently enrolled</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-['Nunito'] text-sm text-gray-500">Completion Rate</p>
                            <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-[#338078]" />
                        </div>
                        <p className="font-['Nunito'] font-bold text-3xl text-[#101928]">{overview.completion_rate}%</p>
                        <p className="font-['Nunito'] text-xs text-gray-500 mt-1">Sessions completed</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Sessions Timeline */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-['Nunito'] font-semibold text-lg text-[#101928] mb-4">Sessions Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={charts.sessions_timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sessions" stroke="#338078" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subject Distribution */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-['Nunito'] font-semibold text-lg text-[#101928] mb-4">Subject Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={charts.subject_distribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {charts.subject_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Peak Hours */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-['Nunito'] font-semibold text-lg text-[#101928] mb-4">Peak Teaching Hours</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.peak_hours}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sessions" fill="#338078" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Rating Timeline */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="font-['Nunito'] font-semibold text-lg text-[#101928] mb-4">Rating Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={charts.rating_timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="rating" stroke="#FFBB28" fill="#FFF4E5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Sessions Table */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                    <h3 className="font-['Nunito'] font-semibold text-lg text-[#101928] mb-4">Recent Sessions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Date & Time</th>
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Student</th>
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Subject</th>
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Duration</th>
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Rating</th>
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Status</th>
                                    <th className="text-left py-3 px-4 font-['Nunito'] font-semibold text-sm text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_sessions.map((session) => (
                                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-['Nunito'] text-sm text-gray-700">
                                            {session.date}<br />
                                            <span className="text-xs text-gray-500">{session.time}</span>
                                        </td>
                                        <td className="py-3 px-4 font-['Nunito'] text-sm text-gray-700">{session.student_name}</td>
                                        <td className="py-3 px-4 font-['Nunito'] text-sm text-gray-700">{session.subject}</td>
                                        <td className="py-3 px-4 font-['Nunito'] text-sm text-gray-700">{session.duration}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                <Icon icon="mdi:star" className="w-4 h-4 text-amber-400" />
                                                <span className="font-['Nunito'] text-sm text-gray-700">{session.rating}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-['Nunito'] ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-[#338078] hover:text-[#2a6a63] font-['Nunito'] text-sm">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Students */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-['Nunito'] font-semibold text-lg text-[#101928] mb-4">Top Students</h3>
                    <div className="space-y-4">
                        {top_students.map((student, index) => (
                            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#338078] text-white flex items-center justify-center font-['Nunito'] font-bold">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-['Nunito'] font-semibold text-gray-900">{student.name}</p>
                                        <p className="font-['Nunito'] text-sm text-gray-500">{student.sessions_count} sessions • {student.total_hours} hours</p>
                                    </div>
                                </div>
                                <button className="text-[#338078] hover:text-[#2a6a63] font-['Nunito'] text-sm">
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

TeacherAnalytics.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
