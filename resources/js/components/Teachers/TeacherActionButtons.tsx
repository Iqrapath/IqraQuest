import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import TeacherRejectionModal from './TeacherRejectionModal';
import TeacherSuspensionModal from './TeacherSuspensionModal';
import DeleteAccountModal from './DeleteAccountModal';

interface TeacherActionButtonsProps {
    teacher: {
        id: number;
        user_id: number;
        status: string;
        user: {
            name: string;
            email: string;
        };
        subjects?: any[];
        experience_years?: number;
    };
}

export default function TeacherActionButtons({ teacher }: TeacherActionButtonsProps) {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleSendMessage = () => {
        // Start a conversation with this teacher's user
        router.post(`/admin/messages/user/${teacher.user_id}`);
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 py-3">
                {/* Verification Gate: Redirect to Verification Workshop if not approved */}
                {teacher.status === 'pending' && (
                    <Link
                        href={`/admin/verifications/${teacher.id}`}
                        className="bg-[#338078] hover:bg-[#2a6a63] text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors flex items-center gap-2"
                    >
                        <Icon icon="solar:verified-check-bold" className="w-4 h-4" />
                        Verify Teacher
                    </Link>
                )}

                {/* Send Message Button */}
                <button
                    onClick={handleSendMessage}
                    className="border-[1.25px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                >
                    Send Message
                </button>

                {/* Reject Button - Only for applications (pending/under_review) */}
                {['pending', 'under_review'].includes(teacher.status) && (
                    <button
                        onClick={() => setIsRejectModalOpen(true)}
                        className="text-[#111928] hover:bg-gray-100 font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                    >
                        Reject
                    </button>
                )}

                {/* Suspend Button - Only for approved or active teachers */}
                {['approved', 'active', 'suspended'].includes(teacher.status) && (
                    <button
                        onClick={() => setIsSuspendModalOpen(true)}
                        className="border-[1.25px] border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                    >
                        {teacher.status === 'suspended' ? 'Manage Suspension' : 'Suspend Account'}
                    </button>
                )}

                {/* Delete Button */}
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-[#ff3b30] hover:bg-red-50 font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                >
                    Delete Account
                </button>
            </div>

            <TeacherRejectionModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                teacher={teacher}
            />

            <TeacherSuspensionModal
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                teacher={teacher}
            />

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                teacherId={teacher.id}
                teacherName={teacher.user.name}
                deleteUrl={`/admin/teachers/${teacher.id}`}
            />
        </>
    );
}
