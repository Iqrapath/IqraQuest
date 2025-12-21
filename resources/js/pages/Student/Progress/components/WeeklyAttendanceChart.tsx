import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Stat {
    day: string;
    percentage: number;
}

interface Props {
    stats: Stat[];
}

export default function WeeklyAttendanceChart({ stats }: Props) {
    const totalAttended = 4; // Mock logic for the caption

    return (
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.05)] p-8 border border-gray-100 flex flex-col gap-8 h-full">
            <div className="flex justify-between items-center">
                <h3 className="font-['Nunito'] font-bold text-[18px] text-[#1a1d56]">Weekly Class Attendance</h3>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-[14px] text-gray-500 font-medium">This Week</span>
                    <Icon icon="tabler:chevron-down" className="text-gray-400 w-4 h-4" />
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[240px] w-full flex items-end justify-between px-4 pb-8">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-300 font-medium pb-8">
                    {[100, 80, 60, 40, 20, 0].map(val => (
                        <div key={val} className="flex items-center gap-4 w-full">
                            <span className="w-8 text-right">{val}%</span>
                            <div className="h-[1px] bg-gray-50 flex-1" />
                        </div>
                    ))}
                </div>

                {/* Bars */}
                {stats.map((item, index) => {
                    const isMissed = item.percentage > 0 && item.percentage < 60; // Mock coloring for Wednesday
                    const isEmpty = item.percentage <= 5;

                    return (
                        <div key={item.day} className="relative group flex flex-col items-center gap-4 z-10">
                            <div
                                className={cn(
                                    "w-[40px] rounded-md transition-all duration-500 origin-bottom",
                                    isMissed ? "bg-[#ff9a9e] opacity-80" : "bg-[#338078] opacity-50",
                                    isEmpty && "bg-gray-200"
                                )}
                                style={{ height: `${item.percentage * 1.8}px` }}
                            />
                            <span className="text-[12px] text-gray-400 font-medium">{item.day}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#338078]/50" />
                <p className="text-[14px] text-gray-500">
                    <span className="font-bold text-[#338078]">{totalAttended}/5 sessions</span> attended this week. Keep it up!
                </p>
            </div>
        </div>
    );
}
