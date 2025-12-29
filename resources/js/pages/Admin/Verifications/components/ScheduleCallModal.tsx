import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

interface ScheduleCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: {
        id: number;
        user: {
            name: string;
        };
        video_verification_status?: string;
        video_verification_scheduled_at?: string | null;
    };
}

export default function ScheduleCallModal({
    isOpen,
    onClose,
    teacher,
}: ScheduleCallModalProps) {
    const isReschedule = teacher.video_verification_status === 'scheduled';

    const { data, setData, post, processing, errors, reset } = useForm({
        scheduled_at: '',
        notes: '',
        reschedule: isReschedule,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/verifications/${teacher.id}/schedule-call`, {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] rounded-[32px] p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <DialogHeader className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#338078]/10 flex items-center justify-center mb-2">
                            <Icon icon="solar:calendar-date-bold" className="text-[#338078] w-7 h-7" />
                        </div>
                        <DialogTitle className="text-2xl font-extrabold text-[#101928] font-['Nunito']">
                            {isReschedule ? 'Reschedule Verification' : 'Schedule Verification'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium leading-relaxed">
                            {isReschedule ? (
                                <>
                                    Current schedule: <span className="text-blue-600 font-bold">
                                        {teacher.video_verification_scheduled_at
                                            ? format(new Date(teacher.video_verification_scheduled_at), 'MMM d, yyyy h:mm a')
                                            : 'Unknown'}
                                    </span>
                                    <br />
                                    Select a new date and time for the verification with <span className="text-[#101928] font-bold">{teacher.user.name}</span>.
                                </>
                            ) : (
                                <>
                                    Please select a convenient date and time to conduct the live video verification with <span className="text-[#101928] font-bold">{teacher.user.name}</span>.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="scheduled_at" className="text-sm font-bold text-[#344054] ml-1">
                                {isReschedule ? 'New Date and Time' : 'Date and Time'}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="scheduled_at"
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    required
                                    className="h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:ring-[#338078] focus:border-[#338078] focus:bg-white transition-all font-medium pr-12"
                                />
                                <Icon icon="solar:calendar-mark-bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                            {errors.scheduled_at && (
                                <p className="text-xs text-red-500 font-bold ml-1">{errors.scheduled_at}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-bold text-[#344054] ml-1">Notes/Instructions</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any specific instructions for the teacher or prep notes for the admin..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="min-h-[120px] rounded-2xl border-gray-200 bg-gray-50/50 focus:ring-[#338078] focus:border-[#338078] focus:bg-white transition-all font-medium p-4 resize-none"
                            />
                            {errors.notes && (
                                <p className="text-xs text-red-500 font-bold ml-1">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={processing}
                            className="h-14 flex-1 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-14 flex-1 rounded-2xl bg-[#338078] hover:bg-[#2a6a63] text-white font-bold shadow-lg shadow-[#338078]/20 transition-all active:scale-[0.98]"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <Icon icon="line-md:loading-twotone-loop" className="w-5 h-5" />
                                    <span>{isReschedule ? 'Rescheduling...' : 'Scheduling...'}</span>
                                </div>
                            ) : (
                                isReschedule ? 'Reschedule Call' : 'Schedule Call'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
