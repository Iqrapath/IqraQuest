import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { BookingData, StatusBadge } from './BookingCard';
import { useState, useEffect } from 'react';

interface SessionSummaryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: BookingData | null;
    userRole?: 'student' | 'guardian' | 'teacher';
    teacherNotes?: string;
    onSubmitReview?: (rating: number, feedback: string) => void;
    onUpdateReview?: (rating: number, feedback: string) => void;
}

export function SessionSummaryModal({
    open,
    onOpenChange,
    booking,
    userRole = 'student',
    teacherNotes,
    onSubmitReview,
    onUpdateReview,
}: SessionSummaryModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [studentNotes, setStudentNotes] = useState('');
    const [isAddingNotes, setIsAddingNotes] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);

    // Pre-fill with existing review data when modal opens
    useEffect(() => {
        if (booking?.review) {
            setRating(booking.review.rating);
            setFeedback(booking.review.comment || '');
        } else {
            setRating(0);
            setFeedback('');
        }
        setIsEditingReview(false);
    }, [booking, open]);

    if (!booking) return null;

    const hasExistingReview = booking.has_review && booking.review;

    const handleRebook = () => {
        // Navigate with rebook_from param to pre-fill subject and duration
        router.visit(`/${userRole}/book/${booking.teacher.id}?rebook_from=${booking.id}`);
    };

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download
        window.open(`/${userRole}/bookings/${booking.id}/summary/pdf`, '_blank');
    };

    const handleSubmitReview = () => {
        console.log('handleSubmitReview called', { rating, feedback, onSubmitReview: !!onSubmitReview });
        if (onSubmitReview && rating > 0) {
            console.log('Calling onSubmitReview with', rating, feedback);
            onSubmitReview(rating, feedback);
        }
    };

    const formatDateTime = () => {
        const startDate = new Date(booking.start_time);
        const endDate = new Date(booking.end_time);

        const date = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return { date, startTime, endTime };
    };

    const formatDuration = () => {
        const minutes = booking.duration_minutes;
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours} Hour${hours > 1 ? 's' : ''}`;
            }
            return `${hours} Hour${hours > 1 ? 's' : ''} ${remainingMinutes} Min`;
        }
        return `${minutes} Minutes`;
    };

    const { date, startTime, endTime } = formatDateTime();
    const isTeacher = userRole === 'teacher';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto p-0 bg-white rounded-2xl border-0 shadow-xl" showCloseButton={true}>
                <VisuallyHidden>
                    <DialogTitle>Session Summary - {booking.subject.name}</DialogTitle>
                    <DialogDescription>
                        Summary of your {booking.subject.name} class with Sheikh {booking.teacher.name}
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col px-6 sm:px-8 py-6 sm:py-8">
                    {/* Header Section */}
                    <div className="flex gap-4 mb-6">
                        {/* Subject Image */}
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl bg-[#f3f4f6] overflow-hidden flex-shrink-0">
                            {booking.subject.image ? (
                                <img src={booking.subject.image} alt={booking.subject.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#e8f5e9]">
                                    <Icon icon="mdi:book-open-page-variant" className="h-12 w-12 text-[#338078]" />
                                </div>
                            )}
                        </div>

                        {/* Subject Info */}
                        <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h2 className="font-['Poppins'] font-semibold text-xl text-[#181818]">
                                    {booking.subject.name}
                                </h2>
                                <StatusBadge status={booking.display_status} />
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-['Poppins'] text-sm text-[#6b7280]">Teacher:</span>
                                <span className="font-['Poppins'] text-sm text-[#181818]">
                                    Ustadh {booking.teacher.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-['Poppins'] text-sm text-[#6b7280]">Class Duration:</span>
                                <span className="font-['Poppins'] text-sm font-medium text-[#181818]">
                                    {formatDuration()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Date/Time Badge */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#fff9e9] flex items-center rounded-lg px-4 py-2">
                            <span className="font-['Nunito'] text-sm text-[#338078]">{date}</span>
                            <span className="mx-3 text-[#338078] opacity-30">|</span>
                            <span className="font-['Nunito'] text-sm text-[#338078]">{startTime} - {endTime}</span>
                        </div>
                    </div>

                    {/* Mode Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="font-['Poppins'] text-sm text-[#6b7280]">Mode:</span>
                            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-full px-4 py-1.5 flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Icon icon="mdi:school-outline" className="h-4 w-4 text-[#338078]" />
                                    <span className="font-['Nunito'] text-sm text-[#338078]">IqraQuest</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Notes */}
                    {teacherNotes && (
                        <div className="mb-6 pb-6 border-b border-[#e5e7eb]">
                            <p className="font-['Poppins'] text-sm">
                                <span className="text-[#338078]">Notes from Teacher: </span>
                                <span className="text-[#181818]">{teacherNotes}</span>
                            </p>
                        </div>
                    )}

                    {/* Student Notes Section */}
                    {!isTeacher && (
                        <div className="mb-6">
                            <h3 className="font-['Poppins'] font-semibold text-base text-[#181818] mb-2">
                                Student Notes:
                            </h3>
                            {isAddingNotes ? (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        value={studentNotes}
                                        onChange={(e) => setStudentNotes(e.target.value)}
                                        placeholder="Add your personal notes about this session..."
                                        className="w-full h-20 px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl font-['Poppins'] text-sm text-[#181818] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setIsAddingNotes(false)}
                                            className="rounded-full bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] text-sm px-4"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsAddingNotes(false);
                                                setStudentNotes('');
                                            }}
                                            className="rounded-full text-[#6b7280] font-['Nunito'] text-sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="font-['Poppins'] text-sm text-[#6b7280]">
                                    if you want to{' '}
                                    <button
                                        onClick={() => setIsAddingNotes(true)}
                                        className="text-[#338078] hover:underline"
                                    >
                                        add personal notes
                                    </button>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Rate & Review Section */}
                    {!isTeacher && (booking.can_rate || hasExistingReview) && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-['Poppins'] font-semibold text-base text-[#181818]">
                                    {hasExistingReview && !isEditingReview ? 'Your Review:' : 'Rate & Review:'}
                                </h3>
                                {hasExistingReview && !isEditingReview && (
                                    <button
                                        onClick={() => setIsEditingReview(true)}
                                        className="font-['Nunito'] text-sm text-[#338078] hover:underline flex items-center gap-1"
                                    >
                                        <Icon icon="mdi:pencil" className="h-4 w-4" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            {/* Show existing review (read-only) */}
                            {hasExistingReview && !isEditingReview ? (
                                <div className="bg-[#f9fafb] rounded-xl p-4">
                                    {/* Display Stars */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Icon
                                                    key={star}
                                                    icon={star <= (booking.review?.rating || 0) ? 'mdi:star' : 'mdi:star-outline'}
                                                    className={`h-5 w-5 cursor-pointer ${
                                                        star <= (booking.review?.rating || 0) ? 'text-[#f5ad7e]' : 'text-[#d1d5db]'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-['Poppins'] text-sm text-[#6b7280]">
                                            ({booking.review?.rating}/5)
                                        </span>
                                    </div>
                                    {/* Display Comment */}
                                    {booking.review?.comment && (
                                        <p className="font-['Poppins'] text-sm text-[#181818]">
                                            "{booking.review.comment}"
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Star Rating (editable) */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="focus:outline-none cursor-pointer"
                                                >
                                                    <Icon
                                                        icon={star <= (hoverRating || rating) ? 'mdi:star' : 'mdi:star-outline'}
                                                        className={`h-6 w-6 cursor-pointer ${
                                                            star <= (hoverRating || rating) ? 'text-[#f5ad7e]' : 'text-[#d1d5db]'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="font-['Poppins'] text-xs text-[#6b7280]">
                                            {isEditingReview ? '(Update your rating)' : '(Leave a Star Rating)'}
                                        </span>
                                    </div>

                                    {/* Feedback Textarea */}
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Write your feedback..."
                                        className="w-full h-24 px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl font-['Poppins'] text-sm text-[#181818] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent"
                                    />

                                    {/* Cancel edit button */}
                                    {isEditingReview && (
                                        <button
                                            onClick={() => {
                                                setIsEditingReview(false);
                                                setRating(booking.review?.rating || 0);
                                                setFeedback(booking.review?.comment || '');
                                            }}
                                            className="mt-2 font-['Nunito'] text-sm text-[#6b7280] hover:underline"
                                        >
                                            Cancel editing
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {/* Submit Review Button - shows when rating is selected and no existing review */}
                        {!isTeacher && booking.can_rate && rating > 0 && !hasExistingReview && (
                            <Button
                                type="button"
                                onClick={handleSubmitReview}
                                className="rounded-[56px] bg-[#f5ad7e] hover:bg-[#e09a6b] text-white font-['Nunito'] font-semibold text-sm px-6 h-11 cursor-pointer"
                            >
                                <Icon icon="mdi:star" className="h-4 w-4 mr-2" />
                                Submit Review
                            </Button>
                        )}
                        {/* Update Review Button - shows when editing existing review */}
                        {!isTeacher && isEditingReview && rating > 0 && (
                            <Button
                                onClick={() => onUpdateReview?.(rating, feedback)}
                                className="rounded-[56px] bg-[#f5ad7e] hover:bg-[#e09a6b] text-white font-['Nunito'] font-semibold text-sm px-6 h-11 cursor-pointer"
                            >
                                <Icon icon="mdi:pencil" className="h-4 w-4 mr-2" />
                                Update Review
                            </Button>
                        )}
                        {!isTeacher && (
                            <Button
                                onClick={handleRebook}
                                className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm px-6 h-11 cursor-pointer"
                            >
                                Rebook Class
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                            className="rounded-[56px] border-[#338078] text-[#338078] hover:bg-[#338078] hover:text-white font-['Nunito'] font-semibold text-sm px-6 h-11 cursor-pointer"
                        >
                            Download Summary PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

