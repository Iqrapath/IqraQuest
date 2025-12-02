import { Icon } from '@iconify/react';

interface Session {
    id: number;
    date: string; // Formatted date string e.g. "Apr 15"
    time: string; // Formatted time string e.g. "10:00AM"
    student_name: string;
    subject: string;
}

interface TeacherPerformanceStatsProps {
    stats: {
        total_sessions_taught: number;
        average_rating: number;
        upcoming_sessions: Session[];
    };
}

export default function TeacherPerformanceStats({ stats }: TeacherPerformanceStatsProps) {
    return (
        <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[16px] p-[32px] w-full mb-8">
            {/* Title */}
            <h3 className="font-['Nunito'] font-semibold text-[24px] text-[#101928] leading-[1.2] mb-[35px]">
                Performance Stats
            </h3>

            <div className="flex flex-col gap-[15px]">
                {/* Total Sessions Taught */}
                <div className="flex items-center gap-[47px]">
                    <p className="font-['Outfit'] font-normal text-[17.3px] text-[#101928] leading-[1.45]">
                        Total Sessions Taught:
                    </p>
                    <p className="font-['Outfit'] font-light text-[17.3px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                        {stats.total_sessions_taught}
                    </p>
                </div>

                {/* Average Rating */}
                <div className="flex items-center gap-[92px]">
                    <p className="font-['Outfit'] font-normal text-[17.3px] text-[#101928] leading-[1.45]">
                        Average Rating:
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="font-['Outfit'] font-light text-[17.3px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                            {stats.average_rating}
                        </p>
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Icon
                                    key={star}
                                    icon={star <= Math.round(stats.average_rating) ? "mdi:star" : "mdi:star-outline"}
                                    className="w-4 h-4"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="flex items-start gap-[65px]">
                    <p className="font-['Outfit'] font-normal text-[17.3px] text-[#101928] leading-[1.45] whitespace-nowrap">
                        Upcoming Sessions:
                    </p>
                    <div className="font-['Outfit'] font-light text-[17.3px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                        {stats.upcoming_sessions.length > 0 ? (
                            stats.upcoming_sessions.map((session, index) => (
                                <p key={session.id} className="mb-0">
                                    - {session.date}, {session.time} – {session.student_name} ({session.subject})
                                </p>
                            ))
                        ) : (
                            <p>No upcoming sessions</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
