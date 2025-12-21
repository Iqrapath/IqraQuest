import StudentLayout from '@/layouts/StudentLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Review {
    id: number;
    teacher: { user: { name: string; avatar: string | null } };
    rating: number;
    comment: string;
    created_at: string;
    booking: { subject: { name: string } } | null;
}

interface Booking {
    id: number;
    teacher: { user: { name: string; avatar: string | null } };
    subject: { name: string };
    end_time: string;
}

interface Props {
    pendingBookings: Booking[];
    recentReviews: Review[];
    stats: {
        averageRating: number;
        totalReviews: number;
        responseTime: string;
        attendanceRate: number;
        positiveFeedbackRate: number;
    };
}

export default function RatingsIndex({ pendingBookings, recentReviews, stats }: Props) {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        booking_id: 0,
        rating: 5,
        comment: '',
    });

    const openRateModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setData({ booking_id: booking.id, rating: 5, comment: '' });
    };

    const submitRating = () => {
        post('/student/ratings', {
            onSuccess: () => {
                setSelectedBooking(null);
                reset();
            },
        });
    };

    return (
        <StudentLayout>
            <Head title="Rating & Feedback" />

            <div className="flex flex-col gap-8 p-4 md:p-6 max-w-[800px] mx-auto w-full">

                {/* Main Title */}
                <h1 className="font-['Nunito'] font-bold text-[28px] text-[#1a1d56]">
                    Rating & Feedback
                </h1>

                {/* Section 1: Overall Rating (Image 1) */}
                <div className="bg-gradient-to-r from-transparent to-[#fffbeb] rounded-full p-8 flex flex-col items-center text-center">
                    <h2 className="font-['Nunito'] font-bold text-[20px] text-[#1a1d56] mb-4">Overall Rating</h2>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-['Nunito'] font-bold text-[48px] text-[#1a1d56]">{stats.averageRating}/5</span>
                        <Icon icon="solar:star-bold" className="w-10 h-10 text-[#fbbf24]" />
                    </div>
                    <p className="font-['Nunito'] text-[15px] text-[#6b7280] mb-6">
                        Based on {stats.totalReviews} teachers reviews
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-[400px] h-3 bg-green border border-[#e5e7eb] rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-[#1a1d56] to-[#338078] rounded-full"
                            style={{ width: `${stats.positiveFeedbackRate}%` }}
                        ></div>
                    </div>
                    <p className="font-['Nunito'] text-[14px] text-[#4b5563]">Positive Feedback: {stats.positiveFeedbackRate}%</p>
                </div>

                <div className="h-px bg-[#e5e7eb] my-2"></div>

                {/* Section 2: Recent Reviews (Image 1) */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-['Nunito'] font-bold text-[20px] text-[#1a1d56]">Recent Reviews</h2>
                        <div className="flex gap-4">
                            <Link href="/student/ratings/feedback" className="font-['Nunito'] font-medium text-[14px] text-[#338078] hover:underline">
                                View Feedback Summary
                            </Link>
                            <Link href="/student/ratings/all" className="font-['Nunito'] font-medium text-[14px] text-[#338078] hover:underline">
                                View All
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {recentReviews.length > 0 ? recentReviews.map(review => (
                            <div key={review.id} className="bg-white border border-[#e5e7eb] rounded-[20px] p-6 flex gap-4 shadow-sm">
                                <img
                                    src={review.teacher.user.avatar ? `/storage/${review.teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${review.teacher.user.name}&background=338078&color=fff`}
                                    alt={review.teacher.user.name}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-['Nunito'] font-bold text-[17px] text-[#1a1d56]">{review.teacher.user.name}</h4>
                                        <Link href="/student/ratings/feedback" className="text-[#338078] text-[14px] font-medium hover:underline">Reply</Link>
                                    </div>
                                    <div className="flex items-center gap-1 my-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Icon key={i} icon="solar:star-bold" className={`w-4 h-4 ${i < review.rating ? 'text-[#fbbf24]' : 'text-[#e5e7eb]'}`} />
                                        ))}
                                        <span className="ml-1 text-[13px] font-bold text-[#4b5563]">{review.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[14px] text-[#6b7280] leading-relaxed mb-2">{review.comment}</p>
                                    <p className="text-[12px] text-[#9ca3af]">
                                        {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 font-['Nunito'] italic text-center py-4">No reviews yet.</p>
                        )}
                    </div>
                </div>

                {/* Section 3: Pending Ratings (Image 1) */}
                <div className="flex flex-col gap-4">
                    <h2 className="font-['Nunito'] font-bold text-[20px] text-[#1a1d56]">Pending Ratings:</h2>
                    {pendingBookings.length > 0 ? pendingBookings.map(booking => (
                        <div key={booking.id} className="bg-[#fffbeb] rounded-[24px] p-8 flex flex-col gap-6 shadow-sm border border-[#fef3c7]">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#6b7280] text-[15px]">Subject:</span>
                                    <span className="text-[#1a1d56] font-bold text-[17px]">{booking.subject.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#6b7280] text-[15px]">Teacher:</span>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={booking.teacher.user.avatar ? `/storage/${booking.teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${booking.teacher.user.name}&background=338078&color=fff`}
                                            alt={booking.teacher.user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="text-[#1a1d56] font-bold text-[17px]">{booking.teacher.user.name}</span>
                                    </div>
                                </div>
                                <p className="text-[#9ca3af] text-[13px]">
                                    {new Date(booking.end_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={() => openRateModal(booking)}
                                className="bg-[#338078] text-white font-bold px-10 py-3 rounded-[12px] self-start transition-opacity hover:opacity-90 active:scale-95"
                            >
                                Rate Now
                            </button>
                        </div>
                    )) : (
                        <p className="text-gray-400 font-['Nunito'] italic text-center py-4 bg-white border border-dashed rounded-xl">No pending ratings.</p>
                    )}
                </div>

                {/* Section 4: Performance Summary (Image 1) */}
                <div className="flex flex-col gap-4">
                    <h2 className="font-['Nunito'] font-bold text-[20px] text-[#1a1d56]">Performance Summary</h2>
                    <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-8 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:checkbox-marked" className="w-[18px] h-[18px] text-[#338078]" />
                            <span className="text-[#6b7280] text-[15px]">Response Time:</span>
                            <span className="text-[#1a1d56] font-bold text-[16px] ml-auto">{stats.responseTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:checkbox-marked" className="w-[18px] h-[18px] text-[#338078]" />
                            <span className="text-[#6b7280] text-[15px]">Attendance Rate:</span>
                            <span className="text-[#1a1d56] font-bold text-[16px] ml-auto">{stats.attendanceRate}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:checkbox-marked" className="w-[18px] h-[18px] text-[#338078]" />
                            <span className="text-[#6b7280] text-[15px]">Positive Feedback:</span>
                            <span className="text-[#1a1d56] font-bold text-[16px] ml-auto">
                                {stats.positiveFeedbackRate}% ({stats.totalReviews > 0 ? `${Math.round(stats.totalReviews * stats.positiveFeedbackRate / 100)} out of ${stats.totalReviews}` : '0 out of 0'} teachers rated 4+ stars)
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Reuse Rate Modal from before */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="sm:max-w-[480px] bg-white rounded-[24px] p-6 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-['Nunito'] font-bold text-[22px] text-[#1a1d56]">
                            Rate Your Session
                        </DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="flex flex-col gap-5 py-4">
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <img
                                    src={selectedBooking.teacher.user.avatar ? `/storage/${selectedBooking.teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${selectedBooking.teacher.user.name}&background=338078&color=fff`}
                                    alt={selectedBooking.teacher.user.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div>
                                    <p className="font-['Nunito'] font-bold text-[17px] text-[#1a1d56]">{selectedBooking.subject.name}</p>
                                    <p className="font-['Nunito'] text-[14px] text-[#338078]">with {selectedBooking.teacher.user.name}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 items-center py-2">
                                <p className="font-['Nunito'] font-semibold text-[15px] text-[#333]">How was your experience?</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Icon
                                                icon="solar:star-bold"
                                                className={`w-10 h-10 ${data.rating >= star ? 'text-[#fbbf24]' : 'text-[#e5e7eb]'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-['Nunito'] font-semibold text-[14px] text-[#333]">Comment (Optional)</label>
                                <Textarea
                                    placeholder="Share your feedback about this session..."
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    className="resize-none font-['Nunito'] rounded-[12px] border-[#e5e7eb] focus:border-[#338078] focus:ring-0"
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <button
                            onClick={submitRating}
                            disabled={processing}
                            className="bg-[#338078] text-white font-['Nunito'] font-bold text-[16px] py-4 rounded-[50px] hover:bg-[#2a6b64] transition-all w-full disabled:opacity-50 shadow-lg shadow-[#338078]/20"
                        >
                            {processing ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
