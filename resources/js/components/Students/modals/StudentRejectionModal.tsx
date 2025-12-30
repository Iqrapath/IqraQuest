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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FullScreenLoader from '@/components/FullScreenLoader';

interface StudentRejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: number;
        user: {
            id: number;
            name: string;
        };
    };
}

export default function StudentRejectionModal({
    isOpen,
    onClose,
    student,
}: StudentRejectionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const [selectedReason, setSelectedReason] = useState('');

    const predefinedReasons = [
        'Incomplete profile details',
        'Duplicate account found',
        'Non-compliant documentation',
        'Other (specify below)',
    ];

    const handleReject = () => {
        const finalReason = selectedReason === 'Other (specify below)' ? reason : selectedReason;

        if (!finalReason || !finalReason.trim()) {
            toast.error('Reason Required', {
                description: 'Please provide a reason for rejection.',
            });
            return;
        }

        setIsSubmitting(true);
        router.patch(`/admin/students/${student.user.id}/status`, {
            status: 'rejected',
            reason: finalReason.trim(),
        }, {
            onSuccess: () => {
                toast.success('Account Rejected', {
                    description: `${student.user.name}'s account has been rejected.`,
                });
                onClose();
                setIsSubmitting(false);
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
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <Icon icon="solar:close-circle-bold" className="w-8 h-8" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-bold font-['Nunito']">
                            Reject Account
                        </DialogTitle>
                        <DialogDescription className="text-center font-['Nunito']">
                            Provide a reason for rejecting {student.user.name}'s account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="font-['Nunito']">Select Reason</Label>
                            <Select value={selectedReason} onValueChange={setSelectedReason}>
                                <SelectTrigger className="w-full mt-1.5 font-['Nunito']">
                                    <SelectValue placeholder="Choose a reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {predefinedReasons.map((r) => (
                                        <SelectItem key={r} value={r} className="font-['Nunito']">
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {(selectedReason === 'Other (specify below)' || !selectedReason) && (
                            <div>
                                <Label htmlFor="custom-reason" className="font-['Nunito']">
                                    Specify Reason *
                                </Label>
                                <Textarea
                                    id="custom-reason"
                                    placeholder="Provide more details..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1.5 min-h-[100px] font-['Nunito']"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-center gap-3">
                        <Button variant="outline" onClick={onClose} className="font-['Nunito']">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            variant="destructive"
                            className="font-['Nunito']"
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
