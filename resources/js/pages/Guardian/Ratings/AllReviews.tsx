import GuardianLayout from '@/layouts/GuardianLayout';
import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

interface Review {
    id: number;
    teacher: { user: { name: string; avatar: string | null } };
    user: { name: string }; // Student name
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
        <GuardianLayout>
            <Head title="All Reviews - Rating & Feedback" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[800px] mx-auto w-full">

                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Link href="/guardian/ratings" className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0">
                        <Icon icon="mdi:arrow-left" className="w-6 h-6 text-[#1a1d56]" />
                    </Link>
                    <h1 className="font-['Nunito'] font-bold text-[24px] md:text-[28px] text-[#1a1d56]">
                        Rating & Feedback
                    </h1>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#e5e7eb] w-full"></div>

                {/* Header */}
                <div className="flex justify-between items-center mt-2">
                    <h2 className="font-['Nunito'] font-bold text-[20px] text-[#1a1d56]">Recent Reviews (All Children)</h2>
                </div>

                {/* All Reviews List */}
                <div className="flex flex-col gap-5 mt-2">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 flex gap-4 shadow-sm">
                            <img
                                src={review.teacher.user.avatar ? `/storage/${review.teacher.user.avatar}` : `https://ui-avatars.com/api/?name=${review.teacher.user.name}&background=338078&color=fff`}
                                alt={review.teacher.user.name}
                                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h4 className="font-['Nunito'] font-bold text-[18px] text-[#1a1d56]">{review.teacher.user.name}</h4>
                                        <p className="text-[13px] text-[#338078]">For: <span className="font-bold">{review.user.name}</span></p>
                                    </div>
                                    <button className="text-[#338078] text-[15px] font-medium hover:underline">Reply</button>
                                </div>
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Icon key={i} icon="solar:star-bold" className={`w-4 h-4 ${i < review.rating ? 'text-[#fbbf24]' : 'text-[#e5e7eb]'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[14px] font-bold text-[#4b5563] ml-1">{review.rating.toFixed(1)}</span>
                                </div>
                                <p className="text-[15px] text-[#6b7280] leading-relaxed mb-3">{review.comment}</p>
                                <p className="text-[13px] text-[#9ca3af]">
                                    {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-12 font-['Nunito'] italic bg-white border border-dashed rounded-[24px]">No reviews found for your children.</p>
                    )}
                </div>
            </div>
        </GuardianLayout>
    );
}
