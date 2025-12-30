import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import StudentStatusBadge from './StudentStatusBadge';
import { toast } from 'sonner';

// Simplified Modals within the same file for now or imported if separate
import StudentRejectionModal from './modals/StudentRejectionModal';
import StudentSuspensionModal from './modals/StudentSuspensionModal';
import DeleteAccountModal from '@/components/Teachers/DeleteAccountModal'; // Reusing existing

interface StudentActionButtonsProps {
    student: {
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
        status: string;
    };
}

export default function StudentActionButtons({ student }: StudentActionButtonsProps) {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendMessage = () => {
        router.post(`/admin/messages/user/${student.user.id}`);
    };

    const handleApprove = () => {
        setIsSubmitting(true);
        router.patch(`/admin/students/${student.user.id}/status`, {
            status: 'active'
        }, {
            onSuccess: () => {
                toast.success('Account Approved', {
                    description: `${student.user.name}'s account is now active.`
                });
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 py-3">
                {/* Approve Button - Only for pending */}
                {student.status === 'pending' && (
                    <button
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="bg-[#338078] hover:bg-[#2a6a63] text-white font-['Poppins'] text-xs md:text-[13.34px] px-6 md:px-8 py-2 md:py-3 rounded-[24px] transition-colors flex items-center gap-2"
                    >
                        <Icon icon="solar:verified-check-bold" className="w-4 h-4" />
                        Approve
                    </button>
                )}

                {/* Send Message Button */}
                <button
                    onClick={handleSendMessage}
                    className="border-[1.25px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-6 py-2 md:py-3 rounded-[24px] transition-colors flex items-center gap-2"
                >
                    <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4" />
                    Send Message
                </button>

                {/* Reject Button - Only for pending */}
                {['pending', 'under_review'].includes(student.status) && (
                    <button
                        onClick={() => setIsRejectModalOpen(true)}
                        className="text-[#111928] hover:bg-gray-100 font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-6 py-2 md:py-3 rounded-[24px] transition-colors"
                    >
                        Reject
                    </button>
                )}

                {/* Suspend Button - Only for active */}
                {['approved', 'active', 'suspended'].includes(student.status) && (
                    <button
                        onClick={() => setIsSuspendModalOpen(true)}
                        className="border-[1.25px] border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-6 py-2 md:py-3 rounded-[24px] transition-colors"
                    >
                        {student.status === 'suspended' ? 'Manage Suspension' : 'Suspend Account'}
                    </button>
                )}

                {/* Delete Button */}
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-[#ff3b30] hover:bg-red-50 font-['Poppins'] text-xs md:text-[13.34px] px-4 md:px-6 py-2 md:py-3 rounded-[24px] transition-colors"
                >
                    Delete Account
                </button>
            </div>

            <StudentRejectionModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                student={student}
            />

            <StudentSuspensionModal
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                student={student}
            />

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                teacherId={student.user.id} // Reusing ID prop
                teacherName={student.user.name} // Reusing Name prop
                deleteUrl={`/admin/students/${student.user.id}`}
            />
        </>
    );
}
