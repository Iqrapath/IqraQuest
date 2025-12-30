import { useState } from 'react';
import StudentLearningPreferencesEditModal from '@/components/Students/modals/StudentLearningPreferencesEditModal';

interface LearningPreferencesCardProps {
    student: {
        id: number;
        subjects: string;
        preferred_times: string;
        age_group: string;
        user: {
            id: number;
            role: string;
        };
        related_users: Array<{ name: string }>;
        teaching_mode?: string;
        additional_notes?: string;
    };
    availableSubjects: string[];
}

export default function LearningPreferencesCard({ student, availableSubjects }: LearningPreferencesCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const isGuardian = student.user.role === 'guardian';

    return (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-[0px_4px_16px_rgba(75,112,245,0.08)] border border-gray-100">
            {/* ... */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Nunito'] font-bold text-xl text-[#101928]">
                    Learning Preferences
                </h2>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="font-['Nunito'] text-base text-[#338078] font-semibold hover:underline"
                >
                    Edit
                </button>
            </div>

            {/* Preference Items */}
            <div className="space-y-4">
                {/* Preferred Subjects */}
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                    <span className="font-['Nunito'] text-gray-500 md:w-[200px] shrink-0">
                        Preferred Subjects
                    </span>
                    <span className="font-['Nunito'] text-[#101928]">
                        {student.subjects || 'Not specified'}
                    </span>
                </div>

                {/* Preferred Learning Times */}
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                    <span className="font-['Nunito'] text-gray-500 md:w-[200px] shrink-0">
                        Preferred Learning Times
                    </span>
                    <span className="font-['Nunito'] text-[#101928]">
                        {(() => {
                            if (!student.preferred_times) return 'Not set';
                            try {
                                const schedule = JSON.parse(student.preferred_times);
                                if (!Array.isArray(schedule) || schedule.length === 0) return 'Not set';
                                return (
                                    <div className="flex flex-col gap-1">
                                        {schedule.map((slot: any, index: number) => (
                                            <div key={index}>
                                               - <span className="font-medium">{slot.day}:</span> {slot.from} - {slot.to}
                                            </div>
                                        ))}
                                    </div>
                                );
                            } catch (e) {
                                return student.preferred_times;
                            }
                        })()}
                    </span>
                </div>

                {/* Student Age Group */}
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                    <span className="font-['Nunito'] text-gray-500 md:w-[200px] shrink-0">
                        Student Age Group
                    </span>
                    <span className="font-['Nunito'] text-[#101928]">
                        {student.age_group || 'N/A'}
                        {isGuardian && student.related_users.length > 0 && (
                            <span className="text-gray-500"> (For Child: {student.related_users[0].name})</span>
                        )}
                    </span>
                </div>
            </div>

            <StudentLearningPreferencesEditModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                student={student}
                availableSubjects={availableSubjects}
            />
        </div>
    );
}
