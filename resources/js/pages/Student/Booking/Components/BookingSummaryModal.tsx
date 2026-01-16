import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Icon } from '@iconify/react';

interface BookingSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: any;
    selectedSessions: any[]; // Changed
    selectedSubjectName: string;
    totalCost: { usd: number, ngn: number };
    currency: string;
    notes: string;
    isProcessing?: boolean;
    onConfirm: () => void;
    // New Props
    isRecurring: boolean;
    occurrences: number;
}

export const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
    isOpen,
    onClose,
    teacher,
    selectedSessions,
    selectedSubjectName,
    totalCost,
    currency,
    notes,
    isProcessing = false,
    onConfirm,
    isRecurring,
    occurrences
}) => {
    if (selectedSessions.length === 0) return null;

    // Format Time: e.g. "5:00 PM"
    const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(Number(h), Number(m));
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[92vw] max-w-[500px] bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden outline-none">
                <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogTitle className="text-2xl font-black text-[#004D40] mb-8 font-primary tracking-tight">Booking Summary</DialogTitle>
                    <DialogDescription className="sr-only">
                        Review your booking details including teacher, date, time, and total fee before confirming payment.
                    </DialogDescription>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 p-5 bg-[#F8FEFD] rounded-[1.5rem] border border-[#E0F2F1]">
                        <div className="relative shrink-0 mx-auto sm:mx-0">
                            <img
                                src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                                alt={teacher.user.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md border-2 border-white"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-[#358D83] text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
                                <Icon icon="ph:chalkboard-teacher-bold" className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div>
                                <p className="text-[10px] font-black text-[#358D83]/60 uppercase tracking-widest mb-1">Teacher</p>
                                <h3 className="text-xl font-black text-[#004D40]">{teacher.user.name}</h3>
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#358D83]/10 text-[#358D83] rounded-lg text-xs font-bold">
                                <Icon icon="ph:bookmark-simple-fill" />
                                <span>{selectedSubjectName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        {/* Sessions List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Schedule Detail</p>
                                <span className="text-[10px] font-black text-[#358D83] uppercase bg-teal-50 px-2 py-0.5 rounded-md">
                                    {selectedSessions.length} {selectedSessions.length === 1 ? 'Slot' : 'Slots'}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                {selectedSessions.map((session, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-[#358D83]/30">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-[#358D83] shrink-0">
                                                <span className="text-[8px] font-black uppercase leading-none mb-0.5">{session.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                <span className="text-xs font-black">{session.date.getDate()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#004D40] leading-tight">
                                                    {session.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#358D83]/60 uppercase tracking-tight">
                                                    {formatTime(session.start)} - {formatTime(session.end)}
                                                </span>
                                            </div>
                                        </div>
                                        <Icon icon="ph:calendar-check-bold" className="w-5 h-5 text-teal-100" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isRecurring && (
                            <div className="bg-[#192020] text-teal-50 px-5 py-4 rounded-2xl flex items-center gap-4 shadow-xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 transition-transform group-hover:scale-125">
                                    <Icon icon="ph:repeat-bold" className="w-12 h-12" />
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Icon icon="tabler:calendar-repeat" className="w-6 h-6 text-[#6FE8DA]" />
                                </div>
                                <div className="flex flex-col relative z-10">
                                    <span className="text-[10px] font-black text-[#6FE8DA] uppercase tracking-widest opacity-80 mb-0.5">Repeating Structure</span>
                                    <span className="text-xs font-bold">Weekly for {occurrences} occurrences</span>
                                </div>
                            </div>
                        )}

                        {/* Total Fee Redesigned */}
                        <div className="bg-[#E0F2F1] rounded-2xl p-6 border border-[#B2DFDB] flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-[#358D83] uppercase tracking-[0.2em]">Net Investment</p>
                                <p className="text-2xl font-black text-[#004D40] tracking-tight">
                                    {currency === 'USD'
                                        ? `$${totalCost.usd.toFixed(2)}`
                                        : `₦${totalCost.ngn.toLocaleString()}`
                                    }
                                </p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-lg text-[10px] font-bold text-[#358D83] shadow-sm border border-white">
                                    <Icon icon="ph:shield-check-fill" className="text-[#358D83]" />
                                    <span>TRUSTED GATEWAY</span>
                                </div>
                                <p className="mt-2 text-[10px] font-black text-[#358D83]/40 uppercase tracking-widest italic">
                                    EST. EQUIVALENT: {currency === 'USD' ? `₦${totalCost.ngn.toLocaleString()}` : `$${totalCost.usd.toFixed(2)}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {notes && (
                        <div className="mb-10 p-5 bg-[#F0F9F8] rounded-2xl border border-dashed border-[#B2DFDB]/50">
                            <h4 className="text-[10px] font-black text-[#358D83]/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Icon icon="ph:chat-teardrop-dots-bold" className="text-[#358D83]" />
                                Your Special Instructions
                            </h4>
                            <p className="text-sm text-[#004D40]/80 font-medium leading-relaxed italic">"{notes}"</p>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-full sm:flex-1 py-4 px-6 rounded-2xl border border-[#E0F2F1] text-[#358D83] font-black text-sm hover:bg-teal-50 hover:text-[#004D40] transition-all active:scale-95"
                        >
                            Back to Adjust
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95
                                ${isProcessing
                                    ? 'bg-[#E0F2F1] text-teal-200 cursor-not-allowed shadow-none'
                                    : 'bg-[#358D83] text-white hover:bg-[#2b756d] shadow-[#358D83]/20'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Icon icon="ph:spinner-bold" className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Confirm & Pay</span>
                                    <Icon icon="ph:lightning-fill" className="w-4 h-4 transition-transform group-hover:scale-125" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
