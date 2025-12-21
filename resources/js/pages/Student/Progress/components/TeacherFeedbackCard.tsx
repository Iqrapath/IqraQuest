import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Feedback {
    teacher_name: string;
    teacher_avatar: string | null;
    rating: number;
    comment: string;
    date: string;
}

interface Props {
    feedback: Feedback;
}

export default function TeacherFeedbackCard({ feedback }: Props) {
    return (
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.05)] p-6 border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                        <img
                            src={feedback.teacher_avatar || `https://ui-avatars.com/api/?name=${feedback.teacher_name}&background=EDF7F6&color=338078`}
                            alt={feedback.teacher_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="font-['Nunito'] font-bold text-[18px] text-[#1a1d56]">{feedback.teacher_name}</h4>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Icon
                                    key={i}
                                    icon="solar:star-bold"
                                    className={cn(
                                        "w-4 h-4",
                                        i < Math.floor(feedback.rating) ? "text-yellow-400" : "text-gray-200"
                                    )}
                                />
                            ))}
                            <span className="text-[13px] font-bold text-[#1a1d56] ml-1">{feedback.rating}</span>
                        </div>
                    </div>
                </div>

                <button className="text-[#338078] font-medium text-[13px] hover:underline flex items-center gap-1">
                    Reply
                </button>
            </div>

            <p className="text-[15px] font-['Nunito'] text-gray-600 leading-relaxed pr-8">
                {feedback.comment}
            </p>

            <div className="text-[13px] text-gray-400 font-medium mt-1">
                {feedback.date}
            </div>
        </div>
    );
}
