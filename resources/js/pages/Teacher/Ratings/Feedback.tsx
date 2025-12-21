import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Review {
    id: number;
    user: { name: string; avatar: string | null };
    rating: number;
    comment: string;
    created_at: string;
    booking: { subject: { name: string } } | null;
}

interface Props {
    receivedFeedback: Review[];
    givenFeedback: Review[];
}

export default function FeedbackPage({ receivedFeedback, givenFeedback }: Props) {
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    const { data, setData, put, processing, reset } = useForm({
        rating: 0,
        comment: '',
    });

    const openEditModal = (review: Review) => {
        setEditingReview(review);
        setData({
            rating: review.rating,
            comment: review.comment || '',
        });
    };

    const submitUpdate = () => {
        if (!editingReview) return;

        put(`/teacher/ratings/${editingReview.id}`, {
            onSuccess: () => {
                setEditingReview(null);
                reset();
            },
        });
    };

    return (
        <TeacherLayout>
            <Head title="Detailed Feedback - Teacher portal" />

            <div className="flex flex-col gap-8 p-4 md:p-6 max-w-[800px] mx-auto w-full">

                <div className="flex items-center gap-4">
                    <Link href="/teacher/ratings" className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                        <Icon icon="mdi:arrow-left" className="w-6 h-6 text-[#1a1d56]" />
                    </Link>
                    <h1 className="font-['Nunito'] font-bold text-[28px] text-[#1a1d56]">
                        Feedback Details
                    </h1>
                </div>

                <Tabs defaultValue="received-feedback" className="w-full">
                    <TabsList className="bg-white rounded-[24px] p-2 mb-8 inline-flex w-full md:w-auto shadow-sm border border-[#e5e7eb] h-auto gap-2">
                        <TabsTrigger
                            value="received-feedback"
                            className="flex-1 md:flex-none rounded-[18px] px-8 py-3.5 font-['Nunito'] font-bold text-[16px] data-[state=active]:!bg-[#338078] data-[state=active]:!text-white text-[#6b7280] transition-all border-none"
                        >
                            Received Feedback
                        </TabsTrigger>
                        <TabsTrigger
                            value="given-feedback"
                            className="flex-1 md:flex-none rounded-[18px] px-8 py-3.5 font-['Nunito'] font-bold text-[16px] data-[state=active]:!bg-[#338078] data-[state=active]:!text-white text-[#6b7280] transition-all border-none"
                        >
                            Feedback Given
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="received-feedback" className="flex flex-col gap-5 border-none p-0 outline-none">
                        {receivedFeedback.length > 0 ? receivedFeedback.map(review => (
                            <div key={review.id} className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src={review.user.avatar ? `/storage/${review.user.avatar}` : `https://ui-avatars.com/api/?name=${review.user.name}&background=338078&color=fff`}
                                    alt={review.user.name}
                                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-['Nunito'] font-bold text-[18px] text-[#1a1d56]">{review.user.name}</h4>
                                        <button className="text-[#338078] text-[15px] font-medium hover:underline">Reply</button>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon key={i} icon="solar:star-bold" className={`w-4 h-4 ${i < review.rating ? 'text-[#fbbf24]' : 'text-[#e5e7eb]'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[14px] font-bold text-[#4b5563] ml-1">{review.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[15px] text-[#4b5563] leading-relaxed mb-3">{review.comment || <span className="italic text-gray-400">No comment provided.</span>}</p>
                                    <p className="text-[#338078] text-[13px] font-bold mb-1">{review.booking?.subject?.name || 'Class Session'}</p>
                                    <p className="text-[13px] text-[#9ca3af]">
                                        {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-gray-300">
                                <p className="text-gray-400 font-['Nunito'] italic">You haven't received any feedback from students yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="given-feedback" className="flex flex-col gap-5 border-none p-0 outline-none">
                        {givenFeedback.length > 0 ? givenFeedback.map(review => (
                            <div key={review.id} className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src={review.user.avatar ? `/storage/${review.user.avatar}` : `https://ui-avatars.com/api/?name=${review.user.name}&background=338078&color=fff`}
                                    alt={review.user.name}
                                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h4 className="font-['Nunito'] font-bold text-[18px] text-[#1a1d56]">{review.booking?.subject?.name || 'Class Session'}</h4>
                                            <p className="text-[#338078] text-[15px] font-medium">To Student: {review.user.name}</p>
                                        </div>
                                        <button
                                            onClick={() => openEditModal(review)}
                                            className="text-[#338078] text-[15px] font-medium hover:underline"
                                        >
                                            Edit Feedback
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon key={i} icon="solar:star-bold" className={`w-4 h-4 ${i < review.rating ? 'text-[#fbbf24]' : 'text-[#e5e7eb]'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[14px] font-bold text-[#4b5563] ml-1">{review.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[15px] text-[#4b5563] leading-relaxed mb-3">{review.comment || <span className="italic text-gray-400">No comment provided.</span>}</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[13px] text-[#9ca3af]">
                                            {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-gray-300">
                                <p className="text-gray-400 font-['Nunito'] italic">You haven't submitted any feedback to students yet.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Review Modal */}
            <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
                <DialogContent className="sm:max-w-[480px] bg-white rounded-[24px] p-6 shadow-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="font-['Nunito'] font-bold text-[22px] text-[#1a1d56]">
                            Edit Feedback
                        </DialogTitle>
                    </DialogHeader>
                    {editingReview && (
                        <div className="flex flex-col gap-5 py-4">
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <img
                                    src={editingReview.user.avatar ? `/storage/${editingReview.user.avatar}` : `https://ui-avatars.com/api/?name=${editingReview.user.name}&background=338078&color=fff`}
                                    alt={editingReview.user.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div>
                                    <p className="font-['Nunito'] font-bold text-[17px] text-[#1a1d56]">{editingReview.booking?.subject?.name || 'Class Session'}</p>
                                    <p className="font-['Nunito'] text-[14px] text-[#338078]">For: {editingReview.user.name}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 items-center py-2">
                                <p className="font-['Nunito'] font-semibold text-[15px] text-[#333]">Update your rating</p>
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
                                <label className="font-['Nunito'] font-semibold text-[14px] text-[#333]">Update your comment</label>
                                <Textarea
                                    placeholder="Share your updated feedback..."
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
                            onClick={submitUpdate}
                            disabled={processing}
                            className="bg-[#338078] text-white font-['Nunito'] font-bold text-[16px] py-4 rounded-[50px] hover:bg-[#2a6b64] transition-all w-full disabled:opacity-50 shadow-lg shadow-[#338078]/20"
                        >
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TeacherLayout>
    );
}
