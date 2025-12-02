import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
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

interface TeacherRejectionModalProps {
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

export default function TeacherRejectionModal({
    isOpen,
    onClose,
    teacher,
}: TeacherRejectionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const [selectedReason, setSelectedReason] = useState('');

    const predefinedReasons = [
        'Insufficient qualifications',
        'Incomplete application',
        'Failed verification',
        'Does not meet requirements',
        'Other (specify below)',
    ];

    const handleReject = () => {
        // Determine the final reason
        const finalReason = selectedReason === 'Other (specify below)' ? reason : selectedReason;

        // Validation
        if (!finalReason || !finalReason.trim()) {
            toast.error('Rejection Reason Required', {
                description: 'Please select a reason or provide a custom reason for rejecting this application.',
            });
            return;
        }

        setIsSubmitting(true);
        setIsSubmitting(true);
        router.put(`/admin/teachers/${teacher.id}/status`, {
            status: 'rejected',
            reason: finalReason.trim(),
        }, {
            onSuccess: () => {
                toast.success('Application Rejected', {
                    description: `${teacher.user.name}'s application has been rejected successfully.`,
                });
                onClose();
                setIsSubmitting(false);
                setReason('');
                setSelectedReason('');
            },
            onError: (errors) => {
                setIsSubmitting(false);

                // Handle specific validation errors
                if (errors.reason) {
                    toast.error('Invalid Reason', {
                        description: errors.reason,
                    });
                } else {
                    toast.error('Rejection Failed', {
                        description: 'Unable to reject the application. Please try again.',
                    });
                }
            },
        });
    };

    return (
        <>
            {isSubmitting && <FullScreenLoader message="Processing rejection..." />}

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl text-red-600">✕</span>
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-bold font-['Nunito']">
                            Reject Application
                        </DialogTitle>
                        <DialogDescription className="text-center font-['Nunito']">
                            Please provide a reason for rejecting {teacher.user.name}'s application.
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
                                    {selectedReason === 'Other (specify below)' ? 'Specify Reason *' : 'Or enter custom reason'}
                                </Label>
                                <Textarea
                                    id="custom-reason"
                                    placeholder="Provide details about why this application is being rejected..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1.5 min-h-[100px] font-['Nunito']"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="font-['Nunito']"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isSubmitting}
                            variant="destructive"
                            className="font-['Nunito']"
                        >
                            Reject Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
