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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FullScreenLoader from '@/components/FullScreenLoader';

interface TeacherSuspensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: {
        id: number;
        user: {
            name: string;
            email: string;
        };
    };
}

export default function TeacherSuspensionModal({
    isOpen,
    onClose,
    teacher,
}: TeacherSuspensionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');

    const handleSuspend = () => {
        if (!reason.trim()) {
            return;
        }

        setIsSubmitting(true);
        router.patch(`/admin/teachers/${teacher.id}/status`, {
            status: 'suspended',
            reason: reason,
        }, {
            onSuccess: () => {
                onClose();
                setIsSubmitting(false);
                setReason('');
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <>
            {isSubmitting && <FullScreenLoader message="Suspending teacher..." />}

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl text-orange-600">!</span>
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">
                            Suspend Teacher Account
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to suspend {teacher.user.name}? This will prevent them from accessing their account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="suspension-reason">
                                Reason for Suspension
                            </Label>
                            <Textarea
                                id="suspension-reason"
                                placeholder="Please provide a reason for this suspension..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1.5 min-h-[100px]"
                            />
                        </div>
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
                            onClick={handleSuspend}
                            disabled={isSubmitting || !reason.trim()}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Suspend Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
