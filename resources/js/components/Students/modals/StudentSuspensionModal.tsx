import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
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

interface StudentSuspensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: number;
        user: {
            id: number;
            name: string;
        };
        status: string;
    };
}

export default function StudentSuspensionModal({
    isOpen,
    onClose,
    student,
}: StudentSuspensionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const isCurrentlySuspended = student.status === 'suspended';

    const handleAction = (status: 'active' | 'suspended') => {
        if (status === 'suspended' && !reason.trim()) {
            toast.error('Reason Required', {
                description: 'Please provide a reason for suspension.',
            });
            return;
        }

        setIsSubmitting(true);
        router.patch(`/admin/students/${student.user.id}/status`, {
            status: status,
            reason: reason.trim(),
        }, {
            onSuccess: () => {
                toast.success(status === 'active' ? 'Account Unsplit' : 'Account Suspended', {
                    description: `${student.user.name}'s account status has been updated.`,
                });
                onClose();
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <>
            {isSubmitting && <FullScreenLoader message="Processing..." />}

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className={`w-16 h-16 ${isCurrentlySuspended ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} rounded-full flex items-center justify-center`}>
                                <Icon icon={isCurrentlySuspended ? "solar:check-circle-bold" : "solar:forbidden-circle-bold"} className="w-8 h-8" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-bold font-['Nunito']">
                            {isCurrentlySuspended ? 'Reactivate Account' : 'Suspend Account'}
                        </DialogTitle>
                        <DialogDescription className="text-center font-['Nunito']">
                            {isCurrentlySuspended
                                ? `Are you sure you want to reactivate ${student.user.name}'s account?`
                                : `Provide a reason for suspending ${student.user.name}'s account.`}
                        </DialogDescription>
                    </DialogHeader>

                    {!isCurrentlySuspended && (
                        <div className="py-4">
                            <Label htmlFor="suspension-reason" className="font-['Nunito']">
                                Suspension Reason *
                            </Label>
                            <Textarea
                                id="suspension-reason"
                                placeholder="Explain why this account is being suspended..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1.5 min-h-[100px] font-['Nunito']"
                            />
                        </div>
                    )}

                    <DialogFooter className="sm:justify-center gap-3">
                        <Button variant="outline" onClick={onClose} className="font-['Nunito']">
                            Cancel
                        </Button>
                        {isCurrentlySuspended ? (
                            <Button
                                onClick={() => handleAction('active')}
                                className="bg-green-600 hover:bg-green-700 font-['Nunito'] text-white"
                            >
                                Reactivate Account
                            </Button>
                        ) : (
                            <Button
                                onClick={() => handleAction('suspended')}
                                className="bg-orange-600 hover:bg-orange-700 font-['Nunito'] text-white"
                            >
                                Confirm Suspension
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
