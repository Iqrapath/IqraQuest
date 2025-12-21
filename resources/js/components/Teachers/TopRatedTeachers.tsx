import React from 'react';
import { TeacherCard } from './TeacherCard';

interface Teacher {
    id: number;
    user: {
        name: string;
        avatar?: string;
    };
    bio?: string;
    experience_years?: number;
    hourly_rate: number | null;
    subjects: Array<{
        id: number;
        name: string;
        proficiency_level?: string;
    }>;
    average_rating: number;
    total_reviews: number;
}

interface TopRatedTeachersProps {
    teachers: Teacher[];
    onTeacherClick?: (teacherId: number) => void;
    title?: string;
}

export const TopRatedTeachers: React.FC<TopRatedTeachersProps> = ({
    teachers,
    onTeacherClick,
    title = "Top Rated Teachers for You"
}) => {
    if (teachers.length === 0) return null;

    return (
        <section className="w-full">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="font-['Poppins'] font-semibold text-[clamp(1.25rem,2.5vw,1.75rem)] text-[#181818]">
                    {title}
                </h2>
            </div>

            {/* Horizontal Scroll Interface */}
            <div className="relative -mx-4 px-4 overflow-x-auto pb-6 scrollbar-hide">
                <div className="flex gap-6 min-w-max">
                    {teachers.map((teacher) => (
                        <TeacherCard
                            key={teacher.id}
                            teacher={teacher}
                            onViewProfile={onTeacherClick}
                            className="w-[320px] sm:w-[500px] shrink-0"
                        />
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            ` }} />
        </section>
    );
};
