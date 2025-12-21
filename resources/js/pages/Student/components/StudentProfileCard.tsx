import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

interface StudentProfileCardProps {
    student: {
        name: string;
        email: string;
        subjects_count?: number;
        active_plan?: string;
    };
}

export default function StudentProfileCard({ student }: StudentProfileCardProps) {
    return (
        <div className="bg-white rounded-[28px] p-10 shadow-[0_0_40px_rgba(51,128,120,0.08)] border border-gray-100/50 w-full max-w-4xl">
            {/* Info Grid */}
            <div className="space-y-6 mb-12">
                {/* Row 1: Student Name & Email */}
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
                    <div className="flex items-center gap-3 min-w-[240px]">
                        <Icon icon="ph:student" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Student: <span className="font-light text-[#181818]/75 ml-1">{student.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi-light:email" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Email: <span className="font-light text-[#181818]/75 ml-1">{student.email}</span>
                        </p>
                    </div>
                </div>

                {/* Horizontal Separator */}
                <div className="w-full h-[1px] bg-gray-100/80" />

                {/* Row 2: Subjects & Active Plan */}
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
                    <div className="flex items-center gap-3 min-w-[240px]">
                        <Icon icon="mdi:book-open-page-variant-outline" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Enrolled Subjects: <span className="font-light text-[#181818]/75 ml-1">{student.subjects_count || 0}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icon icon="icon-park-outline:plan" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Active Plan: <span className="font-light text-[#181818]/75 ml-1">{student.active_plan || 'Free'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between mt-auto">
                <Link
                    href="/student/profile"
                    className="text-[#338078] font-bold text-[16px] hover:underline"
                >
                    View Profile
                </Link>
                <Link
                    href="/student/teachers"
                    className="rounded-full bg-[#338078] hover:bg-[#2a6962] px-10 py-4 text-[14px] font-bold text-white shadow-xl shadow-[#338078]/20 transition-all hover:scale-[1.03]"
                >
                    Find Teachers
                </Link>
            </div>
        </div>
    );
}
