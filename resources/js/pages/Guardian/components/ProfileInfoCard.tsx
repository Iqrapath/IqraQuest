import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface ProfileInfoCardProps {
    guardian: {
        name: string;
        email: string;
        children_count: number;
    };
    onAddChild: () => void;
}

export default function ProfileInfoCard({ guardian, onAddChild }: ProfileInfoCardProps) {
    return (
        <div className="bg-white rounded-[28px] p-10 shadow-[0_0_40px_rgba(51,128,120,0.08)] border border-gray-100/50 w-full max-w-4xl">
            {/* Info Grid */}
            <div className="space-y-6 mb-12">
                {/* Row 1: Guardian & Email */}
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
                    <div className="flex items-center gap-3 min-w-[240px]">
                        <Icon icon="material-symbols-light:guardian" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Guardian: <span className="font-light text-[#181818]/75 ml-1">{guardian.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi-light:email" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Email: <span className="font-light text-[#181818]/75 ml-1">{guardian.email}</span>
                        </p>
                    </div>
                </div>

                {/* Horizontal Separator */}
                <div className="w-full h-[1px] bg-gray-100/80" />

                {/* Row 2: Registered Children */}
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
                    <div className="flex items-center gap-3 min-w-[240px]">
                        <Icon icon="hugeicons:student" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[15px] font-medium text-[#181818]">
                            Registered Children: <span className="font-light text-[#181818]/75 ml-1">{guardian.children_count}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between mt-auto">
                <Link
                    href="/guardian/children"
                    className="text-[#338078] font-bold text-[16px] hover:underline"
                >
                    View Details
                </Link>
                <Button
                    onClick={onAddChild}
                    className="rounded-full bg-[#338078] hover:bg-[#2a6962] px-10 py-6 h-auto text-[14px] font-bold text-white shadow-xl shadow-[#338078]/20 transition-all hover:scale-[1.03]"
                >
                    Add New Child
                </Button>
            </div>
        </div>
    );
}
