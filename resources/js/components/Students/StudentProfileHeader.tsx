import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import StudentStatusBadge from '@/components/Students/StudentStatusBadge';

interface StudentProfileHeaderProps {
    student: {
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            avatar?: string;
            avatar_url?: string;
        };
        city: string;
        country: string;
        status: string;
    };
    showProgressButton?: boolean;
}

export default function StudentProfileHeader({ student, showProgressButton = true }: StudentProfileHeaderProps) {
    return (
        <div className="relative w-full mb-8">
            {/* Background Image Header */}
            <div className="w-full h-[120px] md:h-[200px] rounded-t-[24px] overflow-hidden">
                <img
                    src="/images/Group 1000006846.png"
                    alt="Header Background"
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Content Container - Overlapping */}
            <div className="relative px-4 md:px-[48px] z-10 -mt-[60px] md:-mt-[100px]">
                <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-4 md:gap-8">
                    {/* LEFT SIDE - Profile Info */}
                    <div className="flex flex-col gap-3 md:gap-[16px] mb-2 md:mb-4 items-center">
                        {/* Profile Photo */}
                        <div className="w-[100px] h-[100px] md:w-[147px] md:h-[147px] rounded-full overflow-hidden border-4 md:border-[6px] border-white shadow-xl bg-white">
                            {student.user.avatar ? (
                                <img
                                    src={student.user.avatar_url}
                                    alt={student.user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#338078] to-[#FFCC00] flex items-center justify-center">
                                    <span className="text-white font-bold text-3xl md:text-[48px] font-['Nunito']">
                                        {student.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex flex-col items-center">
                            {/* Name */}
                            <h1 className="font-['Nunito'] font-semibold text-2xl md:text-[32px] leading-[1.2] text-[#141522]">
                                {student.user.name}
                            </h1>

                            {/* Role */}
                            <p className="font-['Nunito'] text-sm md:text-[16px] leading-[1.2] text-gray-600 mt-1 uppercase text-center xl:text-left">
                                {student.user.role}
                            </p>

                            {/* Location */}
                            <div className="flex gap-[6px] items-center justify-center xl:justify-start mt-2">
                                <Icon icon="ion:location-outline" className="w-[18px] h-[18px] text-gray-500" />
                                <p className="font-['Nunito'] text-[14px] leading-[1.2] text-gray-500">
                                    {student.city}, {student.country}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-3 flex justify-center xl:justify-start">
                                <StudentStatusBadge status={student.status as any} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - Actions Bar */}
                    <div className="flex items-center gap-4 mt-8 xl:mt-[100px]">
                        {showProgressButton && (
                            <Link
                                href={`/admin/students/${student.user.id}/progress`}
                                className="bg-white hover:bg-gray-50 text-[#338078] border border-[#338078] font-bold text-sm px-6 py-3 rounded-[16px] transition-all shadow-sm flex items-center gap-2"
                            >
                                <Icon icon="solar:chart-square-bold" className="w-5 h-5" />
                                Track Learning Progress
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
