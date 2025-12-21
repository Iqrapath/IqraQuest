import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Props {
    attendance: Record<string, 'checked' | 'missed' | 'none'>;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AttendanceTracker({ attendance }: Props) {
    return (
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.05)] p-8 border border-gray-100">
            <div className="flex flex-col gap-8">
                {/* Days Label Header */}
                <div className="grid grid-cols-7 gap-4">
                    {DAYS.map(day => (
                        <div key={day} className="text-center font-['Nunito'] font-bold text-[14px] text-[#1a1d56]">
                            {day.substring(0, 3)}
                        </div>
                    ))}
                </div>

                <div className="h-[1px] bg-gray-100 w-full" />

                {/* Status Icons Row */}
                <div className="grid grid-cols-7 gap-4">
                    {DAYS.map(day => {
                        const status = attendance[day];
                        return (
                            <div key={`status-${day}`} className="flex justify-center">
                                {status === 'checked' && (
                                    <div className="w-6 h-6 rounded-md bg-[#EDF7F6] flex items-center justify-center border border-[#338078]/20">
                                        <Icon icon="mdi:check-bold" className="text-[#338078] w-4 h-4" />
                                    </div>
                                )}
                                {status === 'missed' && (
                                    <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center border border-red-200">
                                        <Icon icon="mdi:close-thick" className="text-red-500 w-4 h-4" />
                                    </div>
                                )}
                                {status === 'none' && (
                                    <div className="text-gray-300 font-bold">-</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
