import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GuardianOnboardingModal from '@/components/GuardianOnboardingModal';
import UserStatusBadge from '@/components/UserStatusBadge';

interface Child {
    id: number;
    name: string;
    age: number | string;
    subjects: string;
    status: string;
}

interface ChildrenDetailsProps {
    guardian_name: string;
    children: Child[];
    total_children: number;
}

export default function ChildrenDetails({ guardian_name, children, total_children }: ChildrenDetailsProps) {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleDelete = (childId: number) => {
        if (confirm('Are you sure you want to remove this child from your account?')) {
            setIsDeleting(childId);
            // logic would go here: router.delete(`/guardian/children/${childId}`, ...)
            setTimeout(() => setIsDeleting(null), 1000); // placeholder
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Head title="Children Details" />

            {/* Breadcrumb / Header */}
            <div className="flex items-center gap-2 text-[clamp(1rem,2vw,1.25rem)] font-medium">
                <Link href="/guardian/dashboard" className="text-[#374151] hover:underline">Dashboard</Link>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-1" />
                <span className="text-[#338078]">View Children Details</span>
            </div>

            {/* Guardian Info & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Icon icon="material-symbols-light:guardian" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[#1a1d56] text-xl">
                            <span className="font-semibold">Guardian:</span> <span className="opacity-70">{guardian_name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icon icon="ph:student" className="w-7 h-7 text-[#338078]" />
                        <p className="text-[#1a1d56] text-xl">
                            <span className="font-semibold">Registered Children:</span> <span className="opacity-70">{total_children}</span>
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#338078] hover:bg-[#2a6b64] text-white rounded-[56px] px-8 py-6 h-auto font-semibold text-lg"
                >
                    Add New Child
                </Button>
            </div>

            {/* Children Table Card */}
            <div className="bg-white rounded-[40px] shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100/80">
                                <th className="px-10 py-8 text-left text-gray-400 font-medium text-lg">Child</th>
                                <th className="px-10 py-8 text-left text-gray-400 font-medium text-lg">Age</th>
                                <th className="px-10 py-8 text-left text-gray-400 font-medium text-lg">Subjects</th>
                                <th className="px-10 py-8 text-left text-gray-400 font-medium text-lg">Status</th>
                                <th className="px-10 py-8 text-right text-gray-400 font-medium text-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {children.map((child) => (
                                <tr key={child.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-10 py-10">
                                        <span className="text-[#1a1d56] font-medium text-lg">{child.name}</span>
                                    </td>
                                    <td className="px-10 py-10">
                                        <span className="text-[#1a1d56] font-medium text-lg">{child.age}</span>
                                    </td>
                                    <td className="px-10 py-10">
                                        <span className="text-[#1a1d56] font-medium text-lg">{child.subjects || 'N/A'}</span>
                                    </td>
                                    <td className="px-10 py-10">
                                        <UserStatusBadge status={child.status.toLowerCase() as any} />
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <Icon icon="mi:options-vertical" className="w-6 h-6 text-gray-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-gray-100">
                                                <DropdownMenuItem
                                                    onClick={() => router.visit(`/guardian/children/${child.id}/edit`)}
                                                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[#338078]/5 text-[#1a1d56]"
                                                >
                                                    <span className="font-medium">Edit Profile</span>
                                                    <Icon icon="lucide:edit" className="w-5 h-5" />
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.visit(`/guardian/children/${child.id}/progress`)}
                                                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-[#338078]/5 text-[#1a1d56]"
                                                >
                                                    <span className="font-medium">View Progress</span>
                                                    <Icon icon="solar:history-bold-duotone" className="w-5 h-5" />
                                                </DropdownMenuItem>
                                                <div className="h-px bg-gray-50 my-1" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(child.id)}
                                                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-red-50 text-red-500"
                                                >
                                                    <span className="font-medium">Delete</span>
                                                    <Icon icon="lucide:x-circle" className="w-5 h-5" />
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Link */}
            <div className="mt-4">
                <Link href="#" className="text-[#338078] font-semibold text-lg hover:underline transition-all">
                    View All Subscriptions
                </Link>
            </div>

            <GuardianOnboardingModal
                isOpen={isAddModalOpen}
                initialStep={2}
                onComplete={() => {
                    setIsAddModalOpen(false);
                    router.reload();
                }}
                onSkip={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}

ChildrenDetails.layout = (page: React.ReactNode) => <GuardianLayout children={page} />;
