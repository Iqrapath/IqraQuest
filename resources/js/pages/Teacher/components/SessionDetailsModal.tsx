import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: {
        id: number;
        student: { id: number; name: string; avatar: string | null };
        subject: { id: number; name: string };
        formatted_date: string;
        formatted_start_time: string;
        formatted_end_time: string;
        meeting_link: string | null;
        notes?: string | null;
        can_join: boolean;
    } | null;
}

export default function SessionDetailsModal({ isOpen, onClose, session }: SessionDetailsModalProps) {
    if (!session) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-gray-100">
                                <div className="flex flex-col items-center text-center">
                                    {/* Icon */}
                                    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-[#f0fdf4] rounded-full">
                                        <Icon icon="ph:chalkboard-teacher-fill" className="w-8 h-8 text-[#358D83]" />
                                    </div>

                                    {/* Title */}
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-6">
                                        Are you sure you want to enter the classroom?
                                    </Dialog.Title>

                                    {/* Session Details Header */}
                                    <h4 className="text-[#358D83] text-xl font-medium mb-2">Session Details</h4>
                                    <p className="text-gray-500 text-sm mb-8">
                                        {session.formatted_date} | {session.formatted_start_time} - {session.formatted_end_time}
                                    </p>

                                    {/* Info Section */}
                                    <div className="w-full text-left bg-[#F9FAFB] rounded-xl p-5 mb-8">
                                        <h5 className="font-semibold text-gray-800 mb-4">Classroom Information</h5>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start gap-2">
                                                <Icon icon="ph:user-fill" className="w-5 h-5 text-[#358D83] shrink-0 mt-0.5" />
                                                <span className="text-gray-900 font-medium">Student Name: <span className="font-normal text-gray-600">{session.student.name}</span></span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Icon icon="ph:book-open-text-fill" className="w-5 h-5 text-[#358D83] shrink-0 mt-0.5" />
                                                <span className="text-gray-900 font-medium">Subject: <span className="font-normal text-gray-600">{session.subject.name}</span></span>
                                            </div>
                                            {session.notes && (
                                                <div className="flex items-start gap-2">
                                                    <Icon icon="ph:note-pencil-fill" className="w-5 h-5 text-[#358D83] shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <span className="text-gray-900 font-medium block">Notes from Student:</span>
                                                        <p className="text-gray-600 mt-0.5">{session.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 w-full justify-center">
                                        <button
                                            type="button"
                                            className={cn(
                                                "inline-flex justify-center rounded-full border border-transparent bg-[#358D83] px-8 py-2.5 text-sm font-medium text-white transition-colors min-w-[120px]",
                                                session.can_join
                                                    ? "hover:bg-[#2b756d] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                    : "opacity-60 cursor-not-allowed hover:bg-[#358D83]" // Visual cue but keeping it clickable for toast checking
                                            )}
                                            onClick={() => {
                                                if (!session.can_join) {
                                                    toast.error('Class not started yet', {
                                                        description: 'You can join 15 minutes before the scheduled time.'
                                                    });
                                                    return;
                                                }
                                                window.location.href = `/classroom/${session.id}`;
                                            }}
                                        >
                                            Enter Now
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-full border border-[#358D83] px-8 py-2.5 text-sm font-medium text-[#358D83] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors min-w-[120px]"
                                            onClick={onClose}
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
