import React from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface SubjectProgress {
    name: string;
    status: string;
    color: string; // 'yellow', 'green', 'blue', etc.
}

interface ProgressCardProps {
    goalTitle: string;
    percentage: number;
    subjects: SubjectProgress[];
}

export default function ProgressCard({ goalTitle, percentage, subjects }: ProgressCardProps) {
    // Exact colors from design
    const statusColors: Record<string, string> = {
        yellow: 'bg-[#FABC3F]',
        green: 'bg-[#1DB954]',
        blue: 'bg-[#338078]',
    };

    // SVG Circle Math
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-[40px] p-[clamp(1.5rem,3vw,2.5rem)] shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100/50 w-full relative overflow-hidden group">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mt-4">
                {/* Left: Goal Title */}
                <div className="flex-1 text-center lg:text-left">
                    <h2 className="font-['Poppins'] font-bold text-[clamp(1.5rem,3vw,2.25rem)] text-[#1a1d56] leading-tight">
                        {goalTitle}
                    </h2>
                </div>

                {/* Center: Radial Chart */}
                <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-44 h-44 lg:w-48 lg:h-48 transform -rotate-90">
                        {/* Background Track */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="#f3f4f6"
                            strokeWidth="14"
                            fill="transparent"
                        />
                        {/* Progress Bar with Gradient */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="url(#progressGradient)"
                            strokeWidth="14"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#338078" />
                                <stop offset="50%" stopColor="#4d9b91" />
                                <stop offset="100%" stopColor="#a3b899" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Percentage Content */}
                    <div className="absolute flex flex-col items-center">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Completed</span>
                        <span className="text-3xl lg:text-4xl font-black text-[#1a1d56] tracking-tighter">
                            {percentage}%
                        </span>
                    </div>
                </div>

                {/* Right: Subjects List */}
                <div className="flex-1 w-full lg:max-w-md">
                    <h3 className="font-['Poppins'] font-bold text-[clamp(1.1rem,1.5vw,1.35rem)] text-[#1a1d56] mb-5">
                        Subjects:
                    </h3>
                    <ul className="space-y-4">
                        {subjects.map((sub, idx) => (
                            <li key={idx} className="flex items-start gap-3 group/item">
                                <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow-sm ${statusColors[sub.color] || 'bg-gray-300'}`} />
                                <p className="text-[#1a1d56]/80 font-medium leading-relaxed text-[clamp(0.9rem,1.1vw,1rem)]">
                                    <span className="font-bold text-[#1a1d56]">{sub.name}:</span> {sub.status}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
