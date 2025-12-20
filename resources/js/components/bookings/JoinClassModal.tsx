import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { BookingData } from './BookingCard';
import { useEffect, useState } from 'react';

interface JoinClassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: BookingData | null;
    studentName: string;
}

export function JoinClassModal({ open, onOpenChange, booking, studentName }: JoinClassModalProps) {
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        if (!booking || !open) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            const endTime = new Date(booking.end_time);
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Session ended');
                return;
            }

            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;

            if (hours > 0) {
                setTimeRemaining(`${hours} Hour${hours > 1 ? 's' : ''} ${remainingMinutes} Minute${remainingMinutes !== 1 ? 's' : ''}`);
            } else {
                setTimeRemaining(`${remainingMinutes} Minute${remainingMinutes !== 1 ? 's' : ''}`);
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 60000);

        return () => clearInterval(interval);
    }, [booking, open]);

    if (!booking) return null;

    const handleJoinNow = () => {
        router.visit(`/classroom/${booking.id}`);
    };

    const handleGoBack = () => {
        onOpenChange(false);
    };

    const formatDateTime = () => {
        const startDate = new Date(booking.start_time);
        const endDate = new Date(booking.end_time);

        const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
        const monthDay = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return `${dayName}, ${monthDay} | ${startTime} - ${endTime}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] p-0 bg-white rounded-2xl border-0 shadow-xl" showCloseButton={false}>
                {/* Accessibility: Hidden title and description for screen readers */}
                <VisuallyHidden>
                    <DialogTitle>Join Class - {booking.subject.name}</DialogTitle>
                    <DialogDescription>
                        Join your {booking.subject.name} class with Sheikh {booking.teacher.name}
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col items-center px-6 sm:px-10 py-8 sm:py-10">
                    {/* IqraQuest Classroom Icon */}
                    <div className="mb-5 h-16 w-16 rounded-full bg-[#338078] flex items-center justify-center">
                        <Icon icon="mdi:school-outline" className="h-8 w-8 text-white" />
                    </div>

                    {/* Greeting */}
                    <h2 className="font-['Poppins'] font-normal text-xl text-[#181818] text-center mb-6">
                        Dear {studentName}, You are about to join the class
                    </h2>

                    {/* Class Info Card */}
                    <div className="w-full bg-[#f9fafb] border border-[#e4f7f4] rounded-2xl p-5">
                        {/* Class Info Title */}
                        <h3 className="font-['Poppins'] font-medium text-lg text-[#338078] text-center mb-3">
                            Class Info
                        </h3>

                        {/* Date/Time */}
                        <p className="font-['Poppins'] font-normal text-sm text-[#6b7280] text-center mb-5">
                            {formatDateTime()}
                        </p>

                        {/* Class Information Section */}
                        <div className="border-t border-[#e5e7eb] pt-4">
                            <h4 className="font-['Poppins'] font-semibold text-base text-[#181818] mb-3">
                                Class Information Section
                            </h4>

                            <div className="flex flex-col gap-2">
                                {/* Teacher */}
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:account-outline" className="h-4 w-4 text-[#6b7280] flex-shrink-0" />
                                    <span className="font-['Poppins'] text-sm text-[#6b7280]">Teacher:</span>
                                    <span className="font-['Poppins'] text-sm text-[#181818]">Sheikh {booking.teacher.name}</span>
                                </div>

                                {/* Subject */}
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:book-open-outline" className="h-4 w-4 text-[#6b7280] flex-shrink-0" />
                                    <span className="font-['Poppins'] text-sm text-[#6b7280]">Subject:</span>
                                    <span className="font-['Poppins'] text-sm text-[#181818]">{booking.subject.name}</span>
                                </div>

                                {/* Time Remaining */}
                                <div className="flex items-start gap-2">
                                    <Icon icon="mdi:clock-outline" className="h-4 w-4 text-[#6b7280] flex-shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-['Poppins'] text-sm text-[#6b7280]">Time Remaining:</span>
                                        <span className="font-['Poppins'] font-semibold text-base text-[#181818]">{timeRemaining}</span>
                                    </div>
                                </div>

                                {/* Classroom */}
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:video-outline" className="h-4 w-4 text-[#338078] flex-shrink-0" />
                                    <span className="font-['Poppins'] text-sm text-[#6b7280]">Classroom:</span>
                                    <span className="font-['Poppins'] text-sm text-[#338078]">IqraQuest Virtual Classroom</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Side by side */}
                    <div className="flex items-center justify-center gap-4 mt-6 w-full">
                        <Button
                            onClick={handleJoinNow}
                            className="flex-1 max-w-[140px] rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-base h-11 cursor-pointer"
                        >
                            Join Now
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleGoBack}
                            className="flex-1 max-w-[140px] rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-base h-11 cursor-pointer"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
