import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';

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
            <DialogContent className="w-[92vw] max-w-[480px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden outline-none">
                <div className="p-8 sm:p-12 flex flex-col items-center text-center">
                    <DialogTitle className="sr-only">Booking Request Sent</DialogTitle>
                    <DialogDescription className="sr-only">
                        Your booking request has been successfully sent.
                    </DialogDescription>

                    {/* Celebration Section */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-[#358D83]/10 blur-3xl rounded-full scale-150 animate-pulse" />
                        <div className="relative text-7xl animate-bounce pointer-events-none drop-shadow-xl">
                            🎉
                        </div>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-6 font-primary leading-tight tracking-tight">
                        Booking Request<br /><span className="text-[#358D83]">Sent!</span>
                    </h2>

                    <div className="space-y-4 mb-10 max-w-sm mx-auto">
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Your request with <span className="text-gray-900 font-black">{teacherName}</span> for <span className="text-gray-900 font-black">{dateString}</span> has been broadcasted.
                        </p>

                        {isRecurring && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E0F2F1] text-[#358D83] rounded-xl text-xs font-black uppercase tracking-wider">
                                <Icon icon="ph:repeat-bold" />
                                <span>Weekly for {occurrences} weeks</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
                                <Icon icon="ph:info-fill" className="text-[#358D83]" />
                                Funds are held securely until accepted
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="group w-full sm:w-auto min-w-[240px] py-4 px-10 rounded-2xl bg-[#358D83] text-white font-black text-sm hover:bg-[#2b756d] transition-all shadow-xl shadow-[#358D83]/20 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span>Got It, Alhamdulillah!</span>
                        <Icon icon="ph:check-circle-fill" className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </button>

                    <p className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">IqraQuest Premium Booking</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
