import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface RaiseDisputeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingId: number;
    subjectName: string;
    teacherName: string;
}

export function RaiseDisputeModal({
    open,
    onOpenChange,
    bookingId,
    subjectName,
    teacherName,
}: RaiseDisputeModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/student/booking/dispute/${bookingId}`, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!processing) {
                onOpenChange(val);
                if (!val) reset();
            }
        }}>
            <DialogContent
                className="w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl p-0 overflow-hidden"
                showCloseButton={false}
                aria-describedby={undefined}
            >
                <DialogTitle className="sr-only">Raise Dispute</DialogTitle>

                {/* Header/Icon */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center border border-[#fee2e2]">
                        <Icon icon="mdi:alert-decagram" className="h-8 w-8 text-[#dc2626]" />
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 text-center">
                    <h2 className="font-['Poppins'] font-semibold text-xl text-[#181818] mb-2">
                        Raise a Dispute
                    </h2>
                    <p className="font-['Nunito'] text-sm text-[#6b7280] mb-6">
                        If you experienced any issues during your session, please let us know. Our team will review the case within 24-48 hours.
                    </p>

                    {/* Booking Reference */}
                    <div className="bg-[#f9fafb] rounded-xl p-3 mb-6 flex flex-col gap-2 text-left">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:book-open-variant" className="h-4 w-4 text-[#6b7280]" />
                            <span className="font-['Nunito'] text-sm text-[#374151]">
                                {subjectName} with Ustadh {teacherName}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="text-left">
                        <div className="mb-6">
                            <Label htmlFor="reason" className="block mb-2 text-sm font-medium text-[#374151]">
                                Reason for dispute
                            </Label>
                            <textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="Explain what happened... (e.g. Teacher didn't show up, technical issues, etc.)"
                                className={`w-full rounded-xl border ${errors.reason ? 'border-[#dc2626]' : 'border-[#e5e7eb]'} p-3 font-['Nunito'] text-sm text-[#181818] placeholder:text-[#9ca3af] focus:border-[#338078] focus:ring-1 focus:ring-[#338078] resize-none min-h-[120px]`}
                                disabled={processing}
                            />
                            {errors.reason && (
                                <p className="mt-1 text-xs text-[#dc2626]">{errors.reason}</p>
                            )}
                            <p className="mt-2 text-[10px] text-[#9ca3af]">
                                Minimum 20 characters required. Maximum 1000.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={processing}
                                className="flex-1 rounded-[56px] border-[#e5e7eb] text-[#374151] font-['Nunito'] font-semibold text-sm h-11"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || data.reason.length < 20}
                                className="flex-1 rounded-[56px] bg-[#dc2626] hover:bg-[#b91c1c] text-white font-['Nunito'] font-semibold text-sm h-11"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Dispute'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
