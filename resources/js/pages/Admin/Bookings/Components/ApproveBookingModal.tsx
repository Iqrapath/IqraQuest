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
    student: { name: string; email: string };
    teacher: { name: string };
    subject: { name: string };
    formatted_date: string;
    formatted_time: string;
    total_price: number;
    currency: string;
    status: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export default function ApproveBookingModal({ isOpen, onClose, booking }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!booking) return;

        setIsSubmitting(true);
        router.post(`/admin/bookings/${booking.id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Booking approved successfully');
                onClose();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string || 'Failed to approve booking');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (!booking) return null;

    const statusLabel = booking.status === 'awaiting_approval' ? 'Awaiting Approval' : 'Pending';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600 font-['Poppins']">
                        <Icon icon="mdi:check-decagram" className="w-6 h-6" />
                        Approve Booking
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <Icon icon="mdi:check-circle" className="w-10 h-10 text-green-500" />
                        </div>
                    </div>

                    <p className="text-center text-gray-600 font-['Nunito']">
                        Are you sure you want to approve this booking?
                    </p>

                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-['Nunito'] text-sm">Student</span>
                            <div className="text-right">
                                <p className="font-medium font-['Nunito']">{booking.student.name}</p>
                                <p className="text-xs text-gray-400 font-['Nunito']">{booking.student.email}</p>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito'] text-sm">Teacher</span>
                            <span className="font-medium font-['Nunito']">{booking.teacher.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito'] text-sm">Subject</span>
                            <span className="font-medium font-['Nunito']">{booking.subject.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito'] text-sm">Date & Time</span>
                            <span className="font-medium font-['Nunito']">{booking.formatted_date}, {booking.formatted_time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito'] text-sm">Price</span>
                            <span className="font-semibold font-['Nunito'] text-[#338078]">{booking.currency} {booking.total_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-['Nunito'] text-sm">Current Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium font-['Nunito']">
                                <Icon icon="mdi:clock-outline" className="w-3 h-3" />
                                {statusLabel}
                            </span>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-3 flex items-start gap-2">
                        <Icon icon="mdi:information" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700 font-['Nunito']">
                            Once approved, the booking will be confirmed and both the student and teacher will be notified.
                        </p>
                    </div>
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
                        disabled={isSubmitting}
                        className="rounded-full bg-green-600 hover:bg-green-700 text-white font-['Nunito']"
                    >
                        {isSubmitting ? (
                            <>
                                <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                                Approving...
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:check" className="w-4 h-4 mr-2" />
                                Approve Booking
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
