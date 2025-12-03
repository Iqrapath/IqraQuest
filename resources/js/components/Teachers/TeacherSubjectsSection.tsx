import { useState } from 'react';
import TeacherSubjectsEditModal from './TeacherSubjectsEditModal';

interface AvailabilitySlot {
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface TeacherSubjectsSectionProps {
    teacher: {
        id: number;
        experience_years: number;
        teaching_mode: string;
        teaching_type?: string;
        preferred_language?: string;
        subjects: {
            id: number;
            name: string;
        }[];
        availability?: AvailabilitySlot[];
    };
    availableSubjects: {
        id: number;
        name: string;
    }[];
}

export default function TeacherSubjectsSection({ teacher, availableSubjects }: TeacherSubjectsSectionProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Format subjects list
    const subjectsList = teacher.subjects.map(s => s.name).join(', ');

    // Format availability schedule from availability data
    const formatAvailability = () => {
        if (!teacher.availability || teacher.availability.length === 0) {
            return 'No availability set';
        }

        // Group by day
        const grouped: { [key: string]: { start: string; end: string }[] } = {};
        teacher.availability.forEach(slot => {
            if (slot.is_available) {
                if (!grouped[slot.day_of_week]) {
                    grouped[slot.day_of_week] = [];
                }
                grouped[slot.day_of_week].push({
                    start: slot.start_time,
                    end: slot.end_time
                });
            }
        });

        // Format output
        return Object.entries(grouped).map(([day, slots]) => {
            const times = slots.map(s => `${s.start} – ${s.end}`).join(', ');
            return `- ${day}: ${times}`;
        }).join('\n');
    };

    const availabilitySchedule = formatAvailability();
    const teachingType = teacher.teaching_type || 'Not specified';
    const languagesSpoken = teacher.preferred_language || 'Not specified';

    return (
        <>
            <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[16px] p-4 md:p-[32px] flex flex-col gap-4 md:gap-[32px] items-end w-full mb-6 md:mb-8">
                <div className="flex flex-col gap-6 md:gap-[35px] items-start w-full">
                    {/* Title */}
                    <p className="font-['Nunito'] font-semibold text-xl md:text-[24px] text-[#101928] leading-[1.2]">
                        Subjects & Specializations
                    </p>

                    {/* Content Grid */}
                    <div className="flex flex-col gap-3 md:gap-[15.141px] items-start w-full">
                        {/* Row 1: Subjects Taught */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 lg:gap-[90.03px] items-start sm:items-center">
                            <div className="flex flex-col gap-[3.245px] items-start">
                                <p className="font-['Outfit'] font-normal text-[17.305px] text-[#101928] leading-[1.45]">
                                    Subjects Taught:
                                </p>
                            </div>
                            <p className="font-['Outfit'] font-light text-[17.305px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                                {subjectsList}
                            </p>
                        </div>

                        {/* Row 2: Teaching Experience */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 lg:gap-[53.54px] items-start sm:items-center w-full">
                            <div className="flex flex-col gap-[3.245px] items-start">
                                <p className="font-['Outfit'] font-normal text-[17.305px] text-[#101928] leading-[1.45]">
                                    Teaching Experience:
                                </p>
                            </div>
                            <p className="font-['Outfit'] font-light text-[17.305px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                                {teacher.experience_years} Years Experience teaching  {teachingType}
                            </p>
                        </div>

                        {/* Row 3: Availability Schedule */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 lg:gap-[52.32px] items-start w-full">
                            <div className="flex flex-col gap-[3.245px] items-start">
                                <p className="font-['Outfit'] font-normal text-[17.305px] text-[#101928] leading-[1.45]">
                                    Availability Schedule:
                                </p>
                            </div>
                            <p className="font-['Outfit'] font-light text-sm md:text-[17.305px] text-[rgba(0,0,0,0.6)] leading-[1.45] whitespace-pre-line">
                                {availabilitySchedule}
                            </p>
                        </div>

                        {/* Row 4: Teaching Type */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 lg:gap-[99.87px] items-start sm:items-center w-full">
                            <div className="flex flex-col gap-[3.245px] items-start">
                                <p className="font-['Outfit'] font-normal text-[17.305px] text-[#101928] leading-[1.45]">
                                    Teaching Type:
                                </p>
                            </div>
                            <p className="font-['Outfit'] font-light text-[17.305px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                                {teachingType}
                            </p>
                        </div>

                        {/* Row 5: Teaching Mode */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 lg:gap-[88.87px] items-start sm:items-center w-full">
                            <div className="flex flex-col gap-[3.245px] items-start">
                                <p className="font-['Outfit'] font-normal text-[17.305px] text-[#101928] leading-[1.45]">
                                    Teaching Mode:
                                </p>
                            </div>
                            <p className="font-['Outfit'] font-light text-[17.305px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                                {teacher.teaching_mode}
                            </p>
                        </div>

                        {/* Row 6: Languages Spoken */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 lg:gap-[74.83px] items-start sm:items-center w-full">
                            <div className="flex flex-col gap-[3.245px] items-start">
                                <p className="font-['Outfit'] font-normal text-[17.305px] text-[#101928] leading-[1.45]">
                                    Languages Spoken:
                                </p>
                            </div>
                            <div className="flex gap-[16px] items-center">
                                <p className="font-['Outfit'] font-light text-sm md:text-[17.305px] text-[rgba(0,0,0,0.6)] leading-[1.45]">
                                    {languagesSpoken}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Link */}
                <div className="flex flex-col font-['Nunito'] font-normal justify-center leading-[0] text-[16px] text-center text-gray-500">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="leading-[1.2] hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        Edit
                    </button>
                </div>
            </div>

            <TeacherSubjectsEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                teacher={teacher}
                availableSubjects={availableSubjects}
            />
        </>
    );
}
