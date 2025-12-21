import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SubjectStatus {
    name: string;
    level: string;
    color: string;
}

interface Props {
    goal: string;
    percentage: number;
    subjects: SubjectStatus[];
}

export default function MemorizationProgress({ goal, percentage, subjects }: Props) {
    // Circle constants
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.05)] p-10 border border-gray-100 flex flex-col md:flex-row items-center gap-12">
            {/* Circular Progress Area */}
            <div className="relative flex flex-col items-center justify-center">
                <h4 className="absolute -left-20 top-1/2 -translate-y-1/2 font-['Nunito'] font-bold text-[24px] text-[#1a1d56] hidden lg:block">
                    {goal}
                </h4>

                <div className="relative w-[220px] h-[220px]">
                    <svg className="w-full h-full -rotate-90">
                        {/* Background Track */}
                        <circle
                            cx="110"
                            cy="110"
                            r={radius}
                            fill="transparent"
                            stroke="#f3f4f6"
                            strokeWidth="16"
                        />
                        {/* Progress Bar */}
                        <circle
                            cx="110"
                            cy="110"
                            r={radius}
                            fill="transparent"
                            stroke="#338078"
                            strokeWidth="16"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[14px] text-gray-400 font-medium">Completed</span>
                        <span className="text-[40px] font-['Nunito'] font-bold text-[#1a1d56] leading-none">{percentage}%</span>
                    </div>
                </div>
            </div>

            {/* Subjects Info Area */}
            <div className="flex-1 flex flex-col gap-6">
                <h3 className="font-['Nunito'] font-bold text-[22px] text-[#1a1d56]">Subjects:</h3>

                <ul className="flex flex-col gap-4">
                    {subjects.map((sub, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1a1d56]" />
                            <p className="text-[15px] font-['Nunito'] text-gray-600">
                                <span className="font-semibold">{sub.name}:</span> {sub.level}
                            </p>
                            {sub.color === 'yellow' && <span>🟡</span>}
                            {sub.color === 'green' && <span>🟢</span>}
                        </li>
                    ))}
                </ul>

                <button className="text-[#338078] font-semibold text-[15px] hover:underline flex items-center gap-2 mt-2">
                    Download Progress Report PDF
                    <Icon icon="solar:download-minimalistic-bold" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
