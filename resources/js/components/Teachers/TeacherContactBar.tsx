import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

interface TeacherContactBarProps {
    teacher: {
        id: number;
        user: {
            email: string;
            phone?: string;
        };
        experience_years: number;
        rating?: number;
        review_count?: number;
    };
    subjects?: string;
    sessions_count?: number;
}

export default function TeacherContactBar({ teacher, subjects = "Tajweed, Quran Recitation", sessions_count = 345 }: TeacherContactBarProps) {
    return (
        <div className="bg-white rounded-[12px] shadow-[0px_0px_25px_0px_rgba(51,128,120,0.08)] p-[16px] flex items-start justify-between gap-[26px] w-full mb-8">
            <div className="flex flex-col gap-[32px] w-full max-w-[762px]">
                {/* Row 1: Email & Phone */}
                <div className="flex items-center gap-[32px]">
                    {/* Email */}
                    <div className="flex items-center gap-[8px] min-w-[226px]">
                        <div className="w-[24px] h-[24px]">
                            <Icon icon="carbon:email" className="w-full h-full text-[#111928]" />
                        </div>
                        <span className="font-['Nunito'] text-[20px] text-[#111928] leading-[1.2]">
                            {teacher.user.email}
                        </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-[8px]">
                        <div className="w-[24px] h-[24px] relative overflow-hidden">
                            <Icon icon="line-md:phone-call" className="w-full h-full text-[#111928]" />
                        </div>
                        <span className="font-['Nunito'] text-[20px] text-[#111928] leading-[1.2]">
                            {teacher.user.phone || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Row 2: Subjects & Sessions */}
                <div className="flex items-center gap-[32px]">
                    {/* Subjects */}
                    <div className="flex items-center gap-[8px] min-w-[354px]">
                        <div className="w-[24px] h-[24px]">
                            <Icon icon="mynaui:book" className="w-full h-full text-[#111928]" />
                        </div>
                        <span className="font-['Nunito'] text-[20px] text-[#111928] leading-[1.2]">
                            Subjects: {subjects}
                        </span>
                    </div>

                    {/* Sessions */}
                    <div className="flex items-center gap-[8px]">
                        <div className="w-[24px] h-[24px]">
                            <Icon icon="carbon:prompt-session" className="w-full h-full text-[#111928]" />
                        </div>
                        <span className="font-['Nunito'] text-[20px] text-[#111928] leading-[1.2]">
                            {sessions_count} Sessions
                        </span>
                    </div>
                </div>

                {/* Row 3: Rating */}
                <div className="flex items-center gap-[8px]">
                    <div className="w-[32px] h-[32px]">
                        <Icon icon="material-symbols-light:star-outline-rounded" className="w-full h-full text-[#111928]" />
                    </div>
                    <span className="font-['Nunito'] text-[20px] text-[#111928] leading-[1.2]">
                        {teacher.rating || '4.9'} ({teacher.review_count || '210'} Reviews)
                    </span>
                </div>
            </div>

            {/* Edit Link - Aligned to the right */}
            <div className="mt-[62px]"> {/* Aligned roughly with the middle row or as per design */}
                <Link
                    href={`/admin/teachers/${teacher.id}/edit`}
                    className="font-['Nunito'] text-[16px] text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Edit
                </Link>
            </div>
        </div>
    );
}
