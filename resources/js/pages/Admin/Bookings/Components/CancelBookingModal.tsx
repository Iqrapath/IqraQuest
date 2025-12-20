import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import {
   Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Booking {
    id: number;
    student: { name: string };
    teacher: { name: string };
    subject: { name: string };
    formatted_date: string;
    formatted_time: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export default function CancelBookingModal({ isOpen, onClose, booking }: Props) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!booking || !reason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setIsSubmitting(true);
        router.post(`/admin/bookings/${booking.id}/cancel`, { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Booking cancelled successfully');
                setReason('');
                onClose();
            },
            onError: (errors) => {
                toast.error(errors.error || 'Failed to cancel booking');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 font-['Poppins']">
                        <Icon icon="mdi:calendar-remove" className="w-6 h-6" />
                        Cancel Booking
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Student:</span>
                            <span className="font-medium font-['Nunito']">{booking.student.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Teacher:</span>
                            <span className="font-medium font-['Nunito']">{booking.teacher.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Subject:</span>
                            <span className="font-medium font-['Nunito']">{booking.subject.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Date & Time:</span>
                            <span className="font-medium font-['Nunito']">{booking.formatted_date}, {booking.formatted_time}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 font-['Nunito'] mb-2">
                            Cancellation Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter the reason for cancellation..."
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-['Nunito'] text-sm focus:border-[#338078] focus:ring-1 focus:ring-[#338078] resize-none"
                        />
                    </div>

                    <p className="text-sm text-gray-500 font-['Nunito']">
                        <Icon icon="mdi:information" className="inline w-4 h-4 mr-1" />
                        If payment was made, the student will be refunded automatically.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full font-['Nunito']"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reason.trim()}
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white font-['Nunito']"
                    >
                        {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
