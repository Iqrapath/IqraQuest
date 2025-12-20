import { Icon } from '@iconify/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Booking {
    id: number;
    student: { id: number; name: string; email: string; avatar: string | null };
    teacher: { id: number; name: string; avatar: string | null };
    subject: { id: number; name: string };
    formatted_date: string;
    formatted_time: string;
    start_time: string;
    end_time: string;
    status: string;
    display_status: string;
    payment_status: string;
    total_price: number;
    currency: string;
    notes?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    onReschedule: (booking: Booking) => void;
    onReassign: (booking: Booking) => void;
    onCancel: (booking: Booking) => void;
}

export default function BookingDetailsModal({ isOpen, onClose, booking, onReschedule, onReassign, onCancel }: Props) {
    if (!booking) return null;

    // Calculate duration from start_time and end_time
    const getDuration = () => {
        try {
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            const diffMs = end.getTime() - start.getTime();
            const diffMins = Math.round(diffMs / 60000);
            if (diffMins >= 60) {
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
            }
            return `${diffMins} minutes`;
        } catch {
            return '60 minutes';
        }
    };

    // Generate booking ID
    const bookingId = `BK-${new Date(booking.start_time).getFullYear()}${String(booking.id).padStart(2, '0')}`;

    // Get status display
    const getStatusDisplay = () => {
        const statusConfig: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
            confirmed: { icon: 'mdi:check-box', color: 'text-green-600', bgColor: 'bg-green-50', label: 'Confirmed' },
            upcoming: { icon: 'mdi:clock-outline', color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Upcoming' },
            completed: { icon: 'mdi:check-circle', color: 'text-green-600', bgColor: 'bg-green-50', label: 'Completed' },
            cancelled: { icon: 'mdi:close-circle', color: 'text-red-500', bgColor: 'bg-red-50', label: 'Cancelled' },
            pending: { icon: 'mdi:clock-outline', color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Pending' },
            awaiting_approval: { icon: 'mdi:clock-outline', color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Awaiting Approval' },
            missed: { icon: 'mdi:alert-circle', color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'Missed' },
            rescheduling: { icon: 'mdi:calendar-clock', color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Rescheduling' },
        };
        return statusConfig[booking.display_status] || statusConfig[booking.status] || { icon: 'mdi:help-circle', color: 'text-gray-500', bgColor: 'bg-gray-50', label: booking.status };
    };

    const statusDisplay = getStatusDisplay();
    const canModify = !['cancelled', 'completed'].includes(booking.status);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="font-['Poppins'] font-medium text-xl text-[#192020]">
                        Booking Details View
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-5">
                    {/* Details Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Booking ID</span>
                            <span className="font-['Nunito'] text-gray-800">{bookingId}</span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Student</span>
                            <span className="font-['Nunito'] text-gray-800">{booking.student.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Teacher</span>
                            <span className="font-['Nunito'] text-gray-800">{booking.teacher.name}</span>
                            {booking.status === 'awaiting_approval' && (
                                <span className="ml-2 text-orange-400 text-sm font-['Nunito'] italic">unavailable</span>
                            )}
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Subject</span>
                            <span className="font-['Nunito'] text-gray-800">{booking.subject.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Booking Date & Time</span>
                            <span className="font-['Nunito'] text-gray-800">{booking.formatted_date} – {booking.formatted_time}</span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Duration</span>
                            <span className="font-['Nunito'] text-gray-800">{getDuration()}</span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Price</span>
                            <span className="font-['Nunito'] font-semibold text-[#338078]">{booking.currency} {booking.total_price.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium">Status</span>
                            <span className={`inline-flex items-center gap-1.5 font-['Nunito'] font-medium ${statusDisplay.color}`}>
                                <Icon icon={statusDisplay.icon} className="w-5 h-5" />
                                {statusDisplay.label}
                            </span>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="flex items-start">
                        <span className="w-[140px] text-gray-600 font-['Nunito'] font-medium pt-2">Notes</span>
                        <div className="flex-1 bg-gray-100 rounded-xl p-4 min-h-[80px]">
                            <p className="font-['Nunito'] text-gray-700 text-sm">
                                {booking.notes || 'No notes available.'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {canModify && (
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                onClick={() => { onClose(); onReschedule(booking); }}
                                className="rounded-full bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] px-6"
                            >
                                Reschedule
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => { onClose(); onReassign(booking); }}
                                className="rounded-full border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] px-6"
                            >
                                Reassign Teacher
                            </Button>
                            <button
                                onClick={() => { onClose(); onCancel(booking); }}
                                className="font-['Nunito'] font-medium text-red-500 hover:text-red-600 px-4"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
