import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface Review {
    id: number;
    user: { name: string; avatar: string | null };
    rating: number;
    comment: string;
    created_at: string;
    booking: { subject: { name: string } } | null;
}

interface Props {
    reviews: Review[];
}

export default function AllReviews({ reviews }: Props) {
    return (
        <TeacherLayout>
            <Head title="All Student Reviews - Teacher portal" />

            <div className="flex flex-col gap-8 p-4 md:p-6 max-w-[800px] mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/ratings" className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0">
                        <Icon icon="mdi:arrow-left" className="w-6 h-6 text-[#1a1d56]" />
                    </Link>
                    <h1 className="font-['Nunito'] font-bold text-[24px] md:text-[28px] text-[#1a1d56]">
                        Rating & Feedback
                    </h1>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#e5e7eb] w-full"></div>

                {/* Recent Reviews Header */}
                <div className="flex justify-between items-center mt-2">
                    <h2 className="font-['Nunito'] font-bold text-[20px] text-[#1a1d56]">Recent Reviews</h2>
                    <span className="font-['Nunito'] font-medium text-[14px] text-[#338078]">
                        View All Review
                    </span>
                </div>

                <div className="flex flex-col gap-5 mt-2">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 flex gap-4 shadow-sm">
                            <img
                                src={review.user.avatar ? `/storage/${review.user.avatar}` : `https://ui-avatars.com/api/?name=${review.user.name}&background=338078&color=fff`}
                                alt={review.user.name}
                                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h4 className="font-['Nunito'] font-bold text-[18px] text-[#1a1d56]">{review.user.name}</h4>
                                        <p className="text-[#338078] text-[13px] font-bold">{review.booking?.subject?.name || 'Class Session'}</p>
                                    </div>
                                    <button className="text-[#338078] text-[14px] font-bold hover:underline">Reply</button>
                                </div>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Icon key={i} icon="solar:star-bold" className={`w-4 h-4 ${i < review.rating ? 'text-[#fbbf24]' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[14px] font-bold text-gray-600">{review.rating.toFixed(1)}</span>
                                </div>
                                <p className="text-[15px] text-gray-600 leading-relaxed mb-3">
                                    {review.comment}
                                </p>
                                <p className="text-[13px] text-gray-400">
                                    {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-gray-300">
                            <p className="text-gray-400 font-['Nunito'] italic">No student reviews found yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
