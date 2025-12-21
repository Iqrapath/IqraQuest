import { useState } from 'react';
import { router } from '@inertiajs/react';
import TeacherApprovalModal from './TeacherApprovalModal';
import TeacherRejectionModal from './TeacherRejectionModal';
import TeacherSuspensionModal from './TeacherSuspensionModal';

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
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

    const handleSendMessage = () => {
        // Start a conversation with this teacher's user
        router.post(`/admin/messages/user/${teacher.user_id}`);
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 py-3">
                {/* Approve Button */}
                {teacher.status !== 'approved' && (
                    <button
                        onClick={() => setIsApproveModalOpen(true)}
                        className="bg-[#338078] hover:bg-[#2a6a63] text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                    >
                        Approve
                    </button>
                )}

                {/* Send Message Button */}
                <button
                    onClick={handleSendMessage}
                    className="border-[1.25px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                >
                    Send Message
                </button>

                {/* Reject Button */}
                {teacher.status !== 'rejected' && (
                    <button
                        onClick={() => setIsRejectModalOpen(true)}
                        className="text-[#111928] hover:bg-gray-100 font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                    >
                        Reject
                    </button>
                )}

                {/* Delete/Suspend Button */}
                <button
                    onClick={() => setIsSuspendModalOpen(true)}
                    className="text-[#ff3b30] hover:bg-red-50 font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-5 py-2 md:py-3 rounded-[24px] transition-colors"
                >
                    Delete Account
                </button>
            </div>

            <TeacherApprovalModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                teacher={teacher}
            />

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
        </>
    );
}
