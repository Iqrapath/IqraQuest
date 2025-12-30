import React from 'react';

interface Props {
    stats: {
        sessions_attended: number;
        missed_classes: number;
        average_engagement: string;
    };
}

export default function AttendanceSummaryCard({ stats }: Props) {
    return (
        <div className="bg-white rounded-[16px] p-6 mb-8 border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="text-[#101928] text-xl font-bold font-['Nunito'] mb-6">Attendance Summary</h2>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-4">
                    <span className="text-[#101928] font-bold font-['Nunito']">Sessions Attended:</span>
                    <span className="text-[#667085] font-medium font-['Nunito'] text-lg">{stats.sessions_attended}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-4">
                    <span className="text-[#101928] font-bold font-['Nunito']">Missed Classes:</span>
                    <span className="text-[#667085] font-medium font-['Nunito'] text-lg">{stats.missed_classes}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <span className="text-[#101928] font-bold font-['Nunito']">Average Engagement:</span>
                    <span className="text-[#667085] font-medium font-['Nunito'] text-lg">{stats.average_engagement}</span>
                </div>
            </div>
        </div>
    );
}
