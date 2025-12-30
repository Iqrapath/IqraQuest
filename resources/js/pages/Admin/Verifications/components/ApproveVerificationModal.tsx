import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState } from 'react';

interface VerificationChecklist {
    id_front: {
        label: string;
        uploaded: boolean;
        verified: boolean;
        status: string;
    };
    id_back: {
        label: string;
        uploaded: boolean;
        verified: boolean;
        status: string;
    };
    cv: {
        label: string;
        uploaded: boolean;
        verified: boolean;
        status: string;
    };
    video_verification: {
        label: string;
        completed: boolean;
        status: string;
    };
    certificates: {
        label: string;
        total: number;
        verified: number;
    };
}

interface ApproveVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: number;
    teacherName: string;
    verificationChecklist: VerificationChecklist;
    hasIncompleteVerifications: boolean;
}

export default function ApproveVerificationModal({
    isOpen,
    onClose,
    teacherId,
    teacherName,
    verificationChecklist,
    hasIncompleteVerifications
}: ApproveVerificationModalProps) {
    const [processing, setProcessing] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');
    const [error, setError] = useState('');

    const handleApprove = () => {
        setError('');

        if (hasIncompleteVerifications && overrideReason.trim().length < 10) {
            setError('Please provide a reason (at least 10 characters) for approving with incomplete verifications.');
            return;
        }

        setProcessing(true);
        router.post(`/admin/verifications/${teacherId}/approve`, {
            override_reason: hasIncompleteVerifications ? overrideReason : null,
        }, {
            onSuccess: () => {
                setProcessing(false);
                setOverrideReason('');
                onClose();
                toast.success('Teacher approved successfully');
            },
            onError: (errors) => {
                setProcessing(false);
                if (errors.override_reason) {
                    setError(errors.override_reason);
                } else {
                    toast.error('Failed to approve teacher');
                }
            }
        });
    };

    const handleClose = () => {
        setOverrideReason('');
        setError('');
        onClose();
    };

    const getStatusIcon = (verified: boolean, uploaded: boolean = true) => {
        if (verified) {
            return <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-500" />;
        }
        if (uploaded) {
            return <Icon icon="solar:hourglass-bold" className="w-5 h-5 text-orange-400" />;
        }
        return <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-400" />;
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'verified': return 'Verified';
            case 'pending': return 'Pending Review';
            case 'rejected': return 'Rejected';
            case 'not_uploaded': return 'Not Uploaded';
            case 'completed': return 'Completed';
            case 'scheduled': return 'Scheduled';
            case 'not_scheduled': return 'Not Scheduled';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
            case 'completed': return 'text-green-600';
            case 'pending':
            case 'scheduled': return 'text-orange-500';
            case 'rejected':
            case 'failed':
            case 'not_uploaded':
            case 'not_scheduled': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl font-['Nunito'] max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 pb-4 shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-[#338078]">
                        <div className="w-10 h-10 rounded-xl bg-[#338078]/10 flex items-center justify-center">
                            <Icon icon="solar:verified-check-bold" className="w-5 h-5 text-[#338078]" />
                        </div>
                        Approve Teacher
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-2">
                        Review the verification checklist before approving <strong>{teacherName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 pb-4 space-y-4">
                        {/* Verification Checklist */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification Checklist</h4>

                            {/* ID Front */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(verificationChecklist.id_front.verified, verificationChecklist.id_front.uploaded)}
                                    <span className="text-sm font-medium text-gray-700">{verificationChecklist.id_front.label}</span>
                                </div>
                                <span className={`text-xs font-semibold ${getStatusColor(verificationChecklist.id_front.status)}`}>
                                    {getStatusText(verificationChecklist.id_front.status)}
                                </span>
                            </div>

                            {/* ID Back */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(verificationChecklist.id_back.verified, verificationChecklist.id_back.uploaded)}
                                    <span className="text-sm font-medium text-gray-700">{verificationChecklist.id_back.label}</span>
                                </div>
                                <span className={`text-xs font-semibold ${getStatusColor(verificationChecklist.id_back.status)}`}>
                                    {getStatusText(verificationChecklist.id_back.status)}
                                </span>
                            </div>

                            {/* CV */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(verificationChecklist.cv.verified, verificationChecklist.cv.uploaded)}
                                    <span className="text-sm font-medium text-gray-700">{verificationChecklist.cv.label}</span>
                                </div>
                                <span className={`text-xs font-semibold ${getStatusColor(verificationChecklist.cv.status)}`}>
                                    {getStatusText(verificationChecklist.cv.status)}
                                </span>
                            </div>

                            {/* Video Verification */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {verificationChecklist.video_verification.completed
                                        ? <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-500" />
                                        : <Icon icon="solar:videocamera-record-linear" className="w-5 h-5 text-orange-400" />
                                    }
                                    <span className="text-sm font-medium text-gray-700">{verificationChecklist.video_verification.label}</span>
                                </div>
                                <span className={`text-xs font-semibold ${getStatusColor(verificationChecklist.video_verification.status)}`}>
                                    {getStatusText(verificationChecklist.video_verification.status)}
                                </span>
                            </div>

                            {/* Certificates (Optional) */}
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Icon
                                        icon={verificationChecklist.certificates.total > 0 ? "solar:diploma-bold" : "solar:diploma-linear"}
                                        className={`w-5 h-5 ${verificationChecklist.certificates.verified > 0 ? 'text-green-500' : 'text-gray-400'}`}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{verificationChecklist.certificates.label}</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-500">
                                    {verificationChecklist.certificates.total > 0
                                        ? `${verificationChecklist.certificates.verified}/${verificationChecklist.certificates.total} Verified`
                                        : 'None uploaded'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Warning for incomplete verifications */}
                        {hasIncompleteVerifications && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Icon icon="solar:danger-triangle-bold" className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-700">Incomplete Verifications</p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            Some verification requirements are not complete. You can still approve this teacher, but please provide a reason for the override.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-amber-700">Override Reason *</label>
                                    <Textarea
                                        value={overrideReason}
                                        onChange={(e) => setOverrideReason(e.target.value)}
                                        placeholder="Explain why you're approving despite incomplete verifications..."
                                        className="min-h-[80px] text-sm border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                                    />
                                    {error && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <Icon icon="solar:danger-circle-bold" className="w-3.5 h-3.5" />
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* All complete message */}
                        {!hasIncompleteVerifications && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-500" />
                                    <p className="text-sm font-medium text-green-700">
                                        All verification requirements are complete. Ready to approve!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-6 pt-4 flex gap-3 border-t border-gray-100 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                        className="flex-1 h-11 rounded-xl border-gray-200 font-bold text-base transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApprove}
                        disabled={processing}
                        className="flex-1 h-11 rounded-xl bg-[#338078] hover:bg-[#2a6a63] text-white font-bold transition-all active:scale-[0.98] cursor-pointer"
                    >
                        {processing ? (
                            <>
                                <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                                Approving...
                            </>
                        ) : hasIncompleteVerifications ? (
                            <>
                                <Icon icon="solar:shield-warning-bold" className="w-4 h-4 mr-2" />
                                Approve with Override
                            </>
                        ) : (
                            <>
                                <Icon icon="solar:verified-check-bold" className="w-4 h-4 mr-2" />
                                Confirm Approval
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
