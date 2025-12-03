import { useState } from 'react';
import TeacherAboutEditModal from './TeacherAboutEditModal';

interface TeacherAboutSectionProps {
    teacher: {
        id: number;
        user: {
            name: string;
        };
        bio: string;
    };
}

export default function TeacherAboutSection({ teacher }: TeacherAboutSectionProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-[12px] shadow-[0px_0px_25px_0px_rgba(51,128,120,0.08)] p-4 md:p-[32px] w-full mb-6 md:mb-8">
                <div className="flex flex-col gap-4 md:gap-[32px]">
                    {/* Title */}
                    <h3 className="font-['Nunito'] font-bold text-xl md:text-[24px] text-[#111928] leading-[1.2]">
                        About Me
                    </h3>

                    {/* Bio Text */}
                    <p className="font-['Nunito'] text-sm md:text-[16px] text-[#6B7280] leading-[1.6] whitespace-pre-wrap">
                        {teacher.bio || "No biography available."}
                    </p>

                    {/* Edit Link */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="font-['Nunito'] text-[16px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            <TeacherAboutEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                teacher={teacher}
            />
        </>
    );
}
