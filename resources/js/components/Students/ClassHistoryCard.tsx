import React from 'react';

interface Booking {
    id: number;
    start_time: string;
    subject?: { name: string };
    teacher?: { user: { name: string } };
    status: string;
}

interface Props {
    bookings: Booking[];
}

export default function ClassHistoryCard({ bookings }: Props) {
    // Helper to format date "Jan 3, 2025"
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'text-[#17B26A]'; // Green
            case 'missed':
                return 'text-[#F79009]'; // Yellow/Orange
            case 'cancelled':
                return 'text-[#F04438]'; // Red
            default:
                return 'text-[#667085]'; // Gray
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="bg-white rounded-[16px] p-6 mb-8 border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="text-[#101928] text-xl font-bold font-['Nunito'] mb-6">Class History</h2>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-[#F9FAFB] border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs font-['Nunito'] tracking-wider uppercase">Date</th>
                            <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs font-['Nunito'] tracking-wider uppercase">Class Type</th>
                            <th className="text-left py-3 px-4 text-[#667085] font-semibold text-xs font-['Nunito'] tracking-wider uppercase">Teacher</th>
                            <th className="text-right py-3 px-4 text-[#667085] font-semibold text-xs font-['Nunito'] tracking-wider uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 text-[#101928] font-medium font-['Nunito'] text-sm">
                                    {formatDate(booking.start_time)}
                                </td>
                                <td className="py-4 px-4 text-[#101928] font-medium font-['Nunito'] text-sm">
                                    {booking.subject?.name || 'N/A'}
                                </td>
                                <td className="py-4 px-4 text-[#101928] font-medium font-['Nunito'] text-sm">
                                    {booking.teacher?.user?.name || 'Unknown'}
                                </td>
                                <td className={`py-4 px-4 text-right font-bold font-['Nunito'] text-sm ${getStatusStyle(booking.status)}`}>
                                    {formatStatus(booking.status)}
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-500 font-medium">
                                    No class history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
