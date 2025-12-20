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
    start_time: string;
    end_time: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export default function RescheduleBookingModal({ isOpen, onClose, booking }: Props) {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!booking || !date || !startTime || !endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        const startDateTime = `${date}T${startTime}:00`;
        const endDateTime = `${date}T${endTime}:00`;

        setIsSubmitting(true);
        router.post(`/admin/bookings/${booking.id}/reschedule`, {
            start_time: startDateTime,
            end_time: endDateTime,
            reason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Booking rescheduled successfully');
                resetForm();
                onClose();
            },
            onError: (errors) => {
                toast.error(errors.error || errors.start_time || 'Failed to reschedule booking');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const resetForm = () => {
        setDate('');
        setStartTime('');
        setEndTime('');
        setReason('');
    };

    if (!booking) return null;

    // Get minimum date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#338078] font-['Poppins']">
                        <Icon icon="mdi:calendar-edit" className="w-6 h-6" />
                        Reschedule Booking
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
                            <span className="text-gray-500 font-['Nunito']">Current Schedule:</span>
                            <span className="font-medium font-['Nunito']">{booking.formatted_date}, {booking.formatted_time}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 font-['Nunito'] mb-2">
                                New Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={minDate}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-['Nunito'] text-sm focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 font-['Nunito'] mb-2">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 font-['Nunito'] text-sm focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 font-['Nunito'] mb-2">
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 font-['Nunito'] text-sm focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 font-['Nunito'] mb-2">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for rescheduling..."
                                rows={2}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-['Nunito'] text-sm focus:border-[#338078] focus:ring-1 focus:ring-[#338078] resize-none"
                            />
                        </div>
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
                        disabled={isSubmitting || !date || !startTime || !endTime}
                        className="rounded-full bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito']"
                    >
                        {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

