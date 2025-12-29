import React from 'react';
import { TeacherCard } from './TeacherCard';

interface Teacher {
    id: number;
    user: {
        name: string;
        avatar?: string;
    };
    bio: string;
    experience_years: number;
    hourly_rate: number | null;
    subjects: Array<{
        id: number;
        name: string;
        proficiency_level: string;
    }>;
    average_rating: number;
    total_reviews: number;
    city?: string;
    availability_summary?: string;
}

interface TeacherGridProps {
    teachers: Teacher[];
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    onTeacherClick?: (teacherId: number) => void;
}

export const TeacherGrid: React.FC<TeacherGridProps> = ({
    teachers,
    isLoading = false,
    emptyState,
    onTeacherClick,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="h-80 animate-pulse rounded-3xl bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    if (teachers.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    if (teachers.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400">No teachers found.</p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Try adjusting your search or filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((teacher) => (
                <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onViewProfile={onTeacherClick}
                />
            ))}
        </div>
    );
};
