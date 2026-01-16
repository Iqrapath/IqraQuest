import React from 'react';
import { Icon } from '@iconify/react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Step2Props {
    teacher: any;
    selectedSessions: any[]; // Changed from selectedTimeSlot
    selectedSubject: number | null;
    notes: string;
    // Handlers
    onSubjectSelect: (subjectId: number) => void;
    onNotesChange: (notes: string) => void;
    onBack: () => void;
    onContinue: () => void;
    // Helper
    formatTimePill: (time: string | null) => string;
}

export default function Step2SessionDetails({
    teacher,
    selectedSessions,
    selectedSubject,
    notes,
    onSubjectSelect,
    onNotesChange,
    onBack,
    onContinue,
    formatTimePill
}: Step2Props) {
    const firstSession = selectedSessions[0];

    return (
        <div className="max-w-4xl  px-4 sm:px-6 lg:px-8 py-8 pb-32">
            {/* Redesigned Header: Premium Teacher Profile Card */}
            <div className="bg-white rounded-[clamp(1.5rem,3vw,2rem)] p-[clamp(1.25rem,2.5vw,2rem)] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    {/* Left: Avatar & Badge */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative p-1 bg-gradient-to-br from-[#358D83] to-teal-100 rounded-[clamp(1rem,2vw,1.5rem)]">
                            <div className="h-[clamp(4.5rem,8vw,6rem)] w-[clamp(4.5rem,8vw,6rem)] rounded-[clamp(0.875rem,2vw,1.375rem)] overflow-hidden border-2 border-white shadow-sm bg-gray-50">
                                <img
                                    src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                                    alt={teacher.user.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        {teacher.status === 'approved' && (
                            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-teal-50 text-[#358D83] rounded-full border border-teal-100">
                                <Icon icon="qlementine-icons:certified-filled-16" className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Certified</span>
                            </div>
                        )}
                    </div>

                    {/* Middle: Info Details */}
                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <div className="space-y-1">
                            <h1 className="font-['Poppins'] font-bold text-[clamp(1.25rem,2vw,1.75rem)] text-gray-900 leading-tight">
                                {teacher.user.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="stash:location-light" className="w-4 h-4 text-[#358D83]" />
                                    <span className="text-sm font-medium">{teacher.city || 'Online'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Icon
                                                key={star}
                                                icon="material-symbols:star-rounded"
                                                className={`w-3.5 h-3.5 ${star <= Math.round(teacher.average_rating) ? 'text-orange-400' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{teacher.average_rating.toFixed(1)}/5</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Summary Badge */}
                        <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#F6FAF9] rounded-xl border border-[#E0F2F1] shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Icon icon="ph:calendar-check-bold" className="w-4 h-4 text-[#358D83]" />
                                    <span className="text-xs font-black text-[#338078]">
                                        {selectedSessions.length === 1
                                            ? firstSession.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            : `${selectedSessions.length} Sessions Selected`
                                        }
                                    </span>
                                </div>
                                <div className="h-3 w-px bg-teal-100" />
                                <div className="flex items-center gap-2">
                                    <Icon icon="ph:timer-bold" className="w-4 h-4 text-[#358D83]" />
                                    <span className="text-xs font-black text-[#338078]">
                                        {selectedSessions.length === 1
                                            ? `${formatTimePill(firstSession.start)}`
                                            : "Multiple Times"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Selection Section */}
            <div className="mb-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Icon icon="ph:book-open-text-bold" className="text-[#358D83]" />
                        Select Subject
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required</span>
                </div>

                {(!teacher.subjects || teacher.subjects.length === 0) ? (
                    <div className="p-6 bg-teal-50/50 rounded-[2rem] border border-teal-100/50 flex flex-col items-center text-center space-y-3">
                        <Icon icon="ph:info-bold" className="w-10 h-10 text-[#358D83] opacity-30" />
                        <div className="space-y-1">
                            <h4 className="font-black text-[#00695C]">No Subjects Listed</h4>
                            <p className="text-sm text-[#00695C]/70">This teacher hasn't specified subjects. Please mention your topic in the notes below.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teacher.subjects.map((subject: any) => {
                            const isSelected = selectedSubject === subject.id;
                            return (
                                <button
                                    key={subject.id}
                                    onClick={() => onSubjectSelect(subject.id)}
                                    className={`
                                        group relative flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all duration-300
                                        ${isSelected
                                            ? 'bg-white border-[#358D83] shadow-[0_10px_30px_rgba(53,141,131,0.1)] ring-1 ring-[#358D83]/20'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-[#358D83]/30 hover:bg-teal-50/30'}
                                    `}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500
                                        ${isSelected ? 'bg-[#358D83] border-[#358D83] scale-110 shadow-lg' : 'bg-gray-50 border-gray-100 group-hover:border-[#358D83]/30'}
                                    `}>
                                        {isSelected ? (
                                            <Icon icon="ph:check-bold" className="w-4 h-4 text-white" />
                                        ) : (
                                            <Icon icon="ph:book-bold" className="w-4 h-4 text-gray-300 group-hover:text-[#358D83]/50" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start translate-y-[-1px]">
                                        <span className={`text-sm font-black transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {subject.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">Focus Subject</span>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-2 right-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#358D83] animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Notes Section Redesigned */}
            <div className="mb-12 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Icon icon="ph:chat-right-text-bold" className="text-[#358D83]" />
                        Note to Teacher
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional Message</span>
                </div>
                <div className="relative group">
                    <textarea
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="e.g. I'd like to focus on Surah Al-Baqarah tajweed and pronunciation rules..."
                        className="w-full bg-white border-2 border-gray-100 rounded-[2rem] p-8 min-h-[180px] text-gray-700 placeholder:text-gray-300 focus:border-[#358D83] focus:ring-4 focus:ring-[#358D83]/5 transition-all outline-none text-base leading-relaxed shadow-sm"
                    />
                    <div className="absolute bottom-6 right-8 text-[10px] font-black text-gray-300 uppercase tracking-widest pointer-events-none group-focus-within:text-[#358D83]/40 transition-colors">
                        {notes.length} Characters
                    </div>
                </div>
            </div>

            {/* Action Area: Sophisticated Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-10 border-t border-dashed border-gray-100">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-black text-sm hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
                >
                    <Icon icon="ph:arrow-left-bold" className="w-4 h-4" />
                    <span>Change Date/Time</span>
                </button>

                <button
                    onClick={onContinue}
                    disabled={!selectedSubject && teacher.subjects?.length > 0}
                    className={`
                        w-full sm:w-auto relative group overflow-hidden px-12 py-4 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                        ${(selectedSubject || teacher.subjects?.length === 0)
                            ? 'bg-[#358D83] text-white hover:bg-[#2b756d] shadow-[#358D83]/20'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}
                    `}
                >
                    <span className="relative z-10">Continue to Payment</span>
                    <Icon icon="ph:arrow-right-bold" className={`w-4 h-4 relative z-10 transition-transform ${selectedSubject ? 'group-hover:translate-x-1' : ''}`} />

                    {selectedSubject && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                </button>
            </div>
        </div>
    );
}
