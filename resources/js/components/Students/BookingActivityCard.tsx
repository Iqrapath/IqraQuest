import { Link } from '@inertiajs/react';

interface BookingActivityCardProps {
    bookings: Array<{
        id: number;
        status: string;
        start_time: string;
        teacher: { user: { name: string } };
        subject: { name: string };
    }>;
    stats: {
        upcoming_sessions?: number;
        missed_sessions: number;
    };
    studentId: number;
}

export default function BookingActivityCard({ bookings, stats, studentId }: BookingActivityCardProps) {
    const rescheduledCount = bookings.filter(b => b.status === 'rescheduled').length;
    const completedCount = bookings.filter(b => b.status === 'completed').length; // Or use stats if available

    return (
        <div className="bg-[#EFFEFD] rounded-xl p-6 mb-6">
            <h2 className="font-['Nunito'] font-bold text-xl text-[#101928] mb-6">
                Booking Activity
            </h2>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 font-['Nunito'] text-sm font-semibold text-gray-500 w-1/3">Category</th>
                            <th className="text-left px-6 py-4 font-['Nunito'] text-sm font-semibold text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Past Sessions */}
                        <tr>
                            <td className="px-6 py-4 font-['Nunito'] text-[#101928] font-medium">Past Sessions</td>
                            <td className="px-6 py-4 font-['Nunito'] text-[#101928]">
                                {bookings.length > 0 ? `${bookings.length} completed sessions` : 'No sessions yet'}
                            </td>
                        </tr>

                        {/* Upcoming Sessions */}
                        <tr>
                            <td className="px-6 py-4 font-['Nunito'] text-[#101928] font-medium">Upcoming Sessions</td>
                            <td className="px-6 py-4 font-['Nunito'] text-[#101928]">
                                {stats.upcoming_sessions ? (
                                    <>
                                        Next class: <span className="text-[#338078] font-medium">{stats.upcoming_sessions} upcoming</span>
                                        {/* Ideally we would show the actual next class details here if available from backend */}
                                    </>
                                ) : (
                                    'No upcoming sessions'
                                )}
                            </td>
                        </tr>

                        {/* Missed Sessions */}
                        <tr>
                            <td className="px-6 py-4 font-['Nunito'] text-[#101928] font-medium">Missed Sessions</td>
                            <td className="px-6 py-4 font-['Nunito'] text-[#101928]">
                                <span className="text-[#FF3B30]">{stats.missed_sessions} missed</span>, {rescheduledCount} rescheduled
                                {(stats.missed_sessions > 0 || rescheduledCount > 0) && (
                                    <Link
                                        href={`/admin/bookings?user_id=${studentId}`}
                                        className="text-[#338078] text-sm ml-2 hover:underline font-medium"
                                    >
                                        (View details →)
                                    </Link>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
