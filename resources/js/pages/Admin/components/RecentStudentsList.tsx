import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

interface Student {
    id: number;
    name: string;
    avatar_url: string | null;
}

interface RecentStudentsListProps {
    students: Student[];
    totalStudents: number;
}

export default function RecentStudentsList({ students, totalStudents }: RecentStudentsListProps) {
    return (
        <div className="bg-[#F0FDF9] rounded-[32px] p-6 shadow-sm border border-[#CCFBF1] relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#101928] font-['Nunito']">Recent Students</h2>
                    <p className="text-gray-500 text-sm font-['Nunito'] mt-1">You have {totalStudents.toLocaleString()} students</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#115E59] flex items-center justify-center text-white hover:bg-[#0f524e] transition-colors shadow-lg">
                    <Icon icon="heroicons:plus" className="w-6 h-6" />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between bg-white/50 p-3 rounded-xl hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                            <img
                                src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.name}&background=random`}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-bold text-[#101928] text-sm font-['Nunito']">{student.name}</span>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-[#2DD4BF] flex items-center justify-center text-[#2DD4BF] hover:bg-[#f0fdf9] transition-colors">
                            <Icon icon="heroicons:chat-bubble-oval-left" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <Link
                    href="/admin/students"
                    className="text-[#115E59] font-bold text-sm font-['Nunito'] hover:underline"
                >
                    View more
                </Link>
            </div>
        </div>
    );
}
