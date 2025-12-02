import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FullScreenLoader from '@/components/FullScreenLoader';

interface TeacherApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: {
        id: number;
        user: {
            name: string;
            email: string;
        };
        subjects?: any[];
        experience_years?: number;
    };
}

export default function TeacherApprovalModal({
    isOpen,
    onClose,
    teacher,
}: TeacherApprovalModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = () => {
        setIsSubmitting(true);
        router.post(`/admin/teachers/${teacher.id}/approve`, {}, {
            onSuccess: () => {
                onClose();
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <>
            {isSubmitting && <FullScreenLoader message="Approving teacher..." />}

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">✓</span>
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">
                            Approve Teacher Application
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            You are about to approve this teacher's application.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Teacher Name</p>
                            <p className="text-sm text-gray-900">{teacher.user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Email</p>
                            <p className="text-sm text-gray-900">{teacher.user.email}</p>
                        </div>
                        {teacher.subjects && teacher.subjects.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Subjects</p>
                                <p className="text-sm text-gray-900">
                                    {teacher.subjects.map(s => s.name).join(', ')}
                                </p>
                            </div>
                        )}
                        {teacher.experience_years && (
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Experience</p>
                                <p className="text-sm text-gray-900">{teacher.experience_years} years</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Approve Teacher
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
