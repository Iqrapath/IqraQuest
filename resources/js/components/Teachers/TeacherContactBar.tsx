import { Icon } from '@iconify/react';
import { useState } from 'react';
import TeacherContactEditModal from './TeacherContactEditModal';

interface TeacherContactBarProps {
    teacher: {
        id: number;
        user: {
            name: string;
            email: string;
            phone?: string;
        };
        city: string;
        country: string;
        experience_years: number;
        rating?: number;
        review_count?: number;
    };
    subjects?: string;
    sessions_count?: number;
}

export default function TeacherContactBar({ teacher, subjects, sessions_count }: TeacherContactBarProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-[12px] shadow-[0px_0px_25px_0px_rgba(51,128,120,0.08)] p-3 md:p-[16px] flex flex-col lg:flex-row items-start justify-between gap-4 md:gap-[26px] w-full mb-6 md:mb-8">
                <div className="flex flex-col gap-4 md:gap-[32px] w-full lg:max-w-[762px]">
                    {/* Row 1: Email & Phone */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-[32px]">
                        {/* Email */}
                        <div className="flex items-center gap-[8px] sm:min-w-[226px]">
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
                        <div className="flex items-center gap-[8px] sm:min-w-[200px] lg:min-w-[354px]">
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
                            {teacher.rating && teacher.rating > 0 ? teacher.rating.toFixed(1) : 'No rating'} ({teacher.review_count || '0'} Reviews)
                        </span>
                    </div>
                </div>

                {/* Edit Link - Aligned to the right */}
                <div className="lg:mt-[62px]">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="font-['Nunito'] text-[16px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        Edit
                    </button>
                </div>
            </div>

            <TeacherContactEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                teacher={teacher}
            />
        </>
    );
}
