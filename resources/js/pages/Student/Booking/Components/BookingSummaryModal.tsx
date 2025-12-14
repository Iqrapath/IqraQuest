import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';

interface BookingSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: any;
    selectedDate: Date | null;
    selectedTimeSlot: { start: string; end: string } | null;
    selectedSubjectName: string;
    totalCost: { usd: number, ngn: number };
    currency: string;
    notes: string;
    isProcessing?: boolean;
    onConfirm: () => void;
}

export const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
    isOpen,
    onClose,
    teacher,
    selectedDate,
    selectedTimeSlot,
    selectedSubjectName,
    totalCost,
    currency,
    notes,
    isProcessing = false,
    onConfirm
}) => {
    if (!selectedDate || !selectedTimeSlot) return null;

    const formattedDate = selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    // Format Time Range (e.g. 5:00 PM - 6:00 PM)
    const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(Number(h), Number(m));
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };
    const timeRange = `${formatTime(selectedTimeSlot.start)} - ${formatTime(selectedTimeSlot.end)}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] sm:w-full sm:max-w-[500px] bg-white border-none shadow-xl rounded-[24px] p-6 sm:p-8">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-6 font-primary">Booking Summary</DialogTitle>
                <DialogDescription className="sr-only">
                    Review your booking details including teacher, date, time, and total fee before confirming payment.
                </DialogDescription>

                <div className="flex gap-4 mb-6">
                    <img
                        src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                        alt={teacher.user.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                    />
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Teacher:</p>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{teacher.user.name}</h3>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="text-gray-400">Subject:</span>
                            <span className="font-medium text-gray-700">{selectedSubjectName}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:calendar-clock" className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <span className="text-gray-400 text-sm w-20">Date & Time:</span>
                        <div className="bg-[#FFF9EA] text-[#6A5A2E] px-4 py-2 rounded-lg text-sm font-medium flex-1 flex justify-between">
                            <span>{formattedDate}</span>
                            <span>{timeRange}</span>
                        </div>
                    </div>

                    {/* Total Fee */}
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:money-bag" className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <span className="text-gray-400 text-sm w-20">Total Fee:</span>
                        <div className="bg-[#FFF9EA] text-[#00695C] px-6 py-2 rounded-full text-lg font-bold">
                            {currency === 'USD'
                                ? `$${totalCost.usd.toFixed(0)}`
                                : `₦${totalCost.ngn.toLocaleString()}`
                            }
                            <span className="text-gray-400 text-sm font-normal ml-2">
                                / {currency === 'USD' ? `₦${totalCost.ngn.toLocaleString()}` : `$${totalCost.usd.toFixed(0)}`}
                            </span>
                        </div>
                    </div>
                </div>

                {notes && (
                    <div className="mb-8">
                        <span className="text-[#358D83] text-sm font-medium">Notes from you: </span>
                        <span className="text-gray-600 text-sm">{notes}</span>
                    </div>
                )}

                <div className="text-center mb-8">
                    <p className="text-[#FF5252] text-xs">Note: Cancellation allowed 12 hours before session.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-6 rounded-full border border-[#358D83] text-[#358D83] font-bold hover:bg-teal-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`flex-1 py-3 px-6 rounded-full font-bold transition-all shadow-lg flex items-center justify-center gap-2
                            ${isProcessing
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-[#358D83] text-white hover:bg-[#2b756d]'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Confirm & Pay"
                        )}
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    );
};
