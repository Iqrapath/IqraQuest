import React from 'react';
import { Icon } from '@iconify/react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Step2Props {
    teacher: any;
    selectedDate: Date | null;
    selectedTimeSlot: any;
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
    selectedDate,
    selectedTimeSlot,
    selectedSubject,
    notes,
    onSubjectSelect,
    onNotesChange,
    onBack,
    onContinue,
    formatTimePill
}: Step2Props) {

    return (
        <div className="">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-primary">Subject / Session Details</h1>

            {/* Teacher Header (Simplified for Step 2) */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img
                        src={teacher.user.avatar ? `/storage/${teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}`}
                        alt={teacher.user.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{teacher.user.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Icon icon="mdi:calendar" className="w-4 h-4 text-[#358D83]" />
                        <span>
                            {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-gray-300">|</span>
                        <Icon icon="mdi:clock-outline" className="w-4 h-4 text-[#358D83]" />
                        <span>
                            {formatTimePill(selectedTimeSlot?.start || '')} - {formatTimePill(selectedTimeSlot?.end || '')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Subject Selection */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Subject</h3>
                {(!teacher.subjects || teacher.subjects.length === 0) ? (
                    <Alert variant="destructive" className='bg-[#E0F2F1] border-[#358D83] text-[#00695C]'>
                        <Icon icon="mdi:alert-circle" className="h-4 w-4" />
                        <AlertTitle>No Subjects Found</AlertTitle>
                        <AlertDescription className='text-[#00695C]'>
                            This teacher hasn't listed any subjects yet. You can continue, but please specify your topic in the notes.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {teacher.subjects.map((subject: any) => {
                            const isSelected = selectedSubject === subject.id;
                            return (
                                <button
                                    key={subject.id}
                                    onClick={() => onSubjectSelect(subject.id)}
                                    className={`
                                            group relative flex items-center gap-3 px-5 py-3 rounded-full border transition-all text-sm font-medium
                                            ${isSelected
                                            ? 'bg-[#E0F2F1] border-[#358D83] text-[#00695C] shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                        `}
                                >
                                    {/* Custom Checkbox Circle */}
                                    <div className={`
                                            w-5 h-5 rounded-full flex items-center justify-center border transition-colors
                                            ${isSelected ? 'bg-[#358D83] border-[#358D83]' : 'bg-white border-gray-300 group-hover:border-gray-400'}
                                        `}>
                                        {isSelected && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                                    </div>
                                    <span>{subject.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Notes Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Note to Teacher</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional Message</span>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="I want to revise Surah Al-Baqarah..."
                    className="w-full bg-[#358D83]/5 border-0 rounded-2xl p-6 min-h-[160px] text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#358D83]/20 resize-y"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-16 border-t border-dashed border-gray-200 pt-8">
                <button
                    onClick={onBack}
                    className="flex px-8 py-3.5 rounded-full border border-[#358D83] text-[#358D83] font-bold text-lg hover:bg-teal-50 transition-colors"
                >
                    Go Back
                </button>
                <button
                    onClick={onContinue}
                    disabled={!selectedSubject && teacher.subjects?.length > 0} // Require subject if available
                    className={`
                        flex px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all
                         flex items-center justify-center gap-2
                        ${(selectedSubject || teacher.subjects?.length === 0)
                            ? 'bg-[#358D83] text-white hover:bg-[#2b756d]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    Continue to Payment
                    <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
