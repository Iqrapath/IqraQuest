import { useState, useEffect } from 'react';
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

interface Teacher {
    id: number;
    name: string;
    avatar: string | null;
    hourly_rate?: number;
}

interface Booking {
    id: number;
    student: { name: string };
    teacher: { id: number; name: string };
    subject: { id: number; name: string };
    formatted_date: string;
    formatted_time: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    teachers: { id: number; name: string }[];
}

export default function ReassignTeacherModal({ isOpen, onClose, booking, teachers }: Props) {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            fetchAvailableTeachers();
        }
    }, [isOpen, booking]);

    const fetchAvailableTeachers = async () => {
        if (!booking) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`/admin/bookings/${booking.id}/available-teachers`);
            const data = await response.json();
            setAvailableTeachers(data.teachers || []);
        } catch (error) {
            toast.error('Failed to load available teachers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!booking || !selectedTeacherId) {
            toast.error('Please select a teacher');
            return;
        }

        setIsSubmitting(true);
        router.post(`/admin/bookings/${booking.id}/reassign-teacher`, {
            teacher_id: selectedTeacherId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Teacher reassigned successfully');
                resetForm();
                onClose();
            },
            onError: (errors) => {
                toast.error(errors.error || 'Failed to reassign teacher');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const resetForm = () => {
        setSelectedTeacherId('');
        setAvailableTeachers([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#338078] font-['Poppins']">
                        <Icon icon="mdi:account-switch" className="w-6 h-6" />
                        Reassign Teacher
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Student:</span>
                            <span className="font-medium font-['Nunito']">{booking.student.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Current Teacher:</span>
                            <span className="font-medium font-['Nunito']">{booking.teacher.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Subject:</span>
                            <span className="font-medium font-['Nunito']">{booking.subject.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-['Nunito']">Schedule:</span>
                            <span className="font-medium font-['Nunito']">{booking.formatted_date}, {booking.formatted_time}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 font-['Nunito'] mb-2">
                            Select New Teacher <span className="text-red-500">*</span>
                        </label>
                        
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Icon icon="mdi:loading" className="w-6 h-6 animate-spin text-[#338078]" />
                                <span className="ml-2 text-gray-500 font-['Nunito']">Loading teachers...</span>
                            </div>
                        ) : availableTeachers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 font-['Nunito']">
                                <Icon icon="mdi:account-off" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No other teachers available for this subject</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                {availableTeachers.map((teacher) => (
                                    <label
                                        key={teacher.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                            selectedTeacherId === String(teacher.id)
                                                ? 'border-[#338078] bg-[#338078]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="teacher"
                                            value={teacher.id}
                                            checked={selectedTeacherId === String(teacher.id)}
                                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {teacher.avatar ? (
                                                <img src={teacher.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon="mdi:account" className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium font-['Nunito'] text-gray-900">{teacher.name}</p>
                                            {teacher.hourly_rate && (
                                                <p className="text-sm text-gray-500 font-['Nunito']">
                                                    ${teacher.hourly_rate}/hr
                                                </p>
                                            )}
                                        </div>
                                        {selectedTeacherId === String(teacher.id) && (
                                            <Icon icon="mdi:check-circle" className="w-5 h-5 text-[#338078]" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 font-['Nunito']">
                        <Icon icon="mdi:information" className="inline w-4 h-4 mr-1" />
                        Both the student and teachers will be notified of this change.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="rounded-full font-['Nunito']"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedTeacherId || isLoading}
                        className="rounded-full bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito']"
                    >
                        {isSubmitting ? 'Reassigning...' : 'Confirm Reassignment'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
