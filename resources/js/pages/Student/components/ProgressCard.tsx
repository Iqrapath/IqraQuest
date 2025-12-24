import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface ProgressCardProps {
    goalTitle: string;
    percentage: number;
    upcomingGoal?: string;
    showViewProgress?: boolean;
}

export default function ProgressCard({ 
    goalTitle, 
    percentage, 
    upcomingGoal,
    showViewProgress = true 
}: ProgressCardProps) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-[40px] p-[clamp(1.5rem,3vw,2.5rem)] shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100/50 w-full relative overflow-hidden">
            {showViewProgress && (
                <div className="absolute top-8 right-10">
                    <Link
                        href="/student/progress"
                        className="text-[#338078] font-medium text-[clamp(0.85rem,1.2vw,1rem)] hover:underline flex items-center gap-1 opacity-80 hover:opacity-100 transition-all"
                    >
                        View Progress
                        <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                    </Link>
                </div>
            )}
            
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mt-4">
                {/* Left: Goal Title */}
                <div className="text-center lg:text-left">
                    <h2 className="font-['Poppins'] font-bold text-[clamp(1.5rem,3vw,2.25rem)] text-[#1a1d56] leading-tight">
                        {goalTitle}
                    </h2>
                    {upcomingGoal && (
                        <p className="text-gray-500 text-sm mt-2">
                            {upcomingGoal}
                        </p>
                    )}
                </div>

                {/* Right: Radial Chart */}
                <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-44 h-44 lg:w-48 lg:h-48 transform -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="#f3f4f6"
                            strokeWidth="14"
                            fill="transparent"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="url(#progressGradientStudent)"
                            strokeWidth="14"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progressGradientStudent" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#338078" />
                                <stop offset="50%" stopColor="#4d9b91" />
                                <stop offset="100%" stopColor="#a3b899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Completed</span>
                        <span className="text-3xl lg:text-4xl font-black text-[#1a1d56] tracking-tighter">
                            {percentage}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
