import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from '@inertiajs/react';

interface BookingSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherName: string;
    sessions: any[]; // Changed
    isRecurring: boolean;
    occurrences: number;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
    isOpen,
    onClose,
    teacherName,
    sessions,
    isRecurring,
    occurrences
}) => {

    if (sessions.length === 0) return null;

    const firstSession = sessions[0];
    const formattedDate = firstSession.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(Number(h), Number(m));
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formattedTime = formatTime(firstSession.start);
    const dateString = sessions.length === 1
        ? `${formattedDate}, ${formattedTime}`
        : `${sessions.length} sessions (starting ${formattedDate})`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] sm:w-full sm:max-w-[480px] bg-white border-none shadow-xl rounded-[24px] p-8 flex flex-col items-center text-center">
                <DialogTitle className="sr-only">Booking Request Sent</DialogTitle>
                <DialogDescription className="sr-only">
                    Your booking request has been successfully sent.
                </DialogDescription>

                {/* Celebration Icon */}
                <div className="text-6xl mb-4 animate-bounce">
                    🎉
                </div>

                {/* Reference Design: Congratulations, Booking Successful! */}
                <h2 className="text-2xl font-bold text-[#0F172A] mb-4 font-primary">
                    Booking Request<br />Sent!
                </h2>

                <p className="text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
                    Your request with <span className="text-[#358D83] font-medium">{teacherName}</span> for <span className="text-[#358D83] font-medium">{dateString}</span> has been sent.
                    {isRecurring && (
                        <span className="block mt-1 font-bold text-[#358D83]">
                            Repeating for {occurrences} weeks.
                        </span>
                    )}
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">Funds are held until the teacher accepts.</span>
                </p>

                <button
                    onClick={onClose}
                    className="w-full sm:w-auto min-w-[200px] py-3 px-8 rounded-full bg-[#358D83] text-white font-bold hover:bg-[#2b756d] transition-all shadow-md hover:shadow-lg transform active:scale-95"
                >
                    Got It, JazakaAllahu Khair!
                </button>
            </DialogContent>
        </Dialog>
    );
};
