import { Link } from '@inertiajs/react';

interface TeacherAboutSectionProps {
    teacher: {
        id: number;
        bio: string;
    };
}

export default function TeacherAboutSection({ teacher }: TeacherAboutSectionProps) {
    return (
        <div className="bg-white rounded-[12px] shadow-[0px_0px_25px_0px_rgba(51,128,120,0.08)] p-[32px] w-full mb-8">
            <div className="flex flex-col gap-[32px]">
                {/* Title */}
                <h3 className="font-['Nunito'] font-bold text-[24px] text-[#111928] leading-[1.2]">
                    About Me
                </h3>

                {/* Bio Text */}
                <p className="font-['Nunito'] text-[16px] text-[#6B7280] leading-[1.6] whitespace-pre-wrap">
                    {teacher.bio || "No biography available."}
                </p>

                {/* Edit Link */}
                <div className="flex justify-end">
                    <Link
                        href={`/admin/teachers/${teacher.id}/edit`}
                        className="font-['Nunito'] text-[16px] text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
}
