import { useState } from 'react';
import { Icon } from '@iconify/react';
import StudentContactEditModal from '@/components/Students/modals/StudentContactEditModal';

interface StudentContactBarProps {
    student: {
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
            phone?: string;
            role: string;
        };
        sessions_count: number;
        related_users: Array<{ name: string; avatar?: string; age?: number }>;
        status: string;
        joined_at: string;
        city: string;
        country: string;
    };
}

export default function StudentContactBar({ student }: StudentContactBarProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const isGuardian = student.user.role === 'guardian';

    // Format related user info
    const relatedUserInfo = student.related_users.length > 0
        ? `${student.related_users[0].name}${student.related_users[0].age ? ` (Age ${student.related_users[0].age})` : ''}`
        : 'None';

    return (
        <>
            <div className="bg-white rounded-[12px] shadow-[0px_4px_16px_rgba(75,112,245,0.08)] border border-gray-100 p-4 md:p-6 w-full mb-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Left Content - Info Grid */}
                    <div className="flex flex-col gap-8 flex-1">
                        {/* Row 1: Email & Phone */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            {/* Email */}
                            <div className="flex items-center gap-2">
                                <Icon icon="carbon:email" className="w-6 h-6 text-[#111928]" />
                                <span className="font-['Nunito'] text-base text-[#111928]">
                                    {student.user.email}
                                </span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-2">
                                <Icon icon="line-md:phone-call" className="w-6 h-6 text-[#111928]" />
                                <span className="font-['Nunito'] text-base text-[#111928]">
                                    {student.user.phone || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Row 2: Parent/Child Relationship */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            <div className="flex items-center gap-2">
                                <Icon icon="ri:parent-line" className="w-6 h-6 text-[#111928]" />
                                <span className="font-['Nunito'] text-base text-[#111928]">
                                    {isGuardian ? 'Parent of: ' : 'Guardian: '}
                                    <span className="text-[#338078] font-semibold">{relatedUserInfo}</span>
                                </span>
                            </div>
                        </div>

                        {/* Row 3: Sessions Completed */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                            <div className="flex items-center gap-2">
                                <Icon icon="carbon:prompt-session" className="w-6 h-6 text-[#111928]" />
                                <span className="font-['Nunito'] text-base text-[#111928]">
                                    {student.sessions_count} Sessions Completed
                                </span>
                            </div>

                            {/* Status Badge - Only show if active */}
                            {student.status === 'active' && (
                                <div className="flex items-center gap-2">
                                    <Icon icon="codicon:compass-active" className="w-8 h-8 text-[#34C759]" />
                                    <span className="font-['Nunito'] text-base text-[#34C759] font-medium">
                                        Active Account
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Edit Button */}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="font-['Nunito'] text-base text-[#338078] font-semibold hover:underline shrink-0"
                    >
                        Edit
                    </button>
                </div>
            </div>

            <StudentContactEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                student={student}
            />
        </>
    );
}
