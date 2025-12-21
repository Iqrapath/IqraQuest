import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuardianLayout from '@/layouts/GuardianLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import UserStatusBadge from '@/components/UserStatusBadge';
import EditPersonalModal from './components/EditPersonalModal';
import EditPreferencesModal from './components/EditPreferencesModal';
import EditScheduleModal from './components/EditScheduleModal';

interface Subject {
    id: number;
    name: string;
}

interface Child {
    id: number;
    name: string;
    email: string;
    age: number | null;
    gender: string;
    subjects: number[];
    created_at: string;
    status: 'active' | 'suspended' | 'inactive' | 'pending';
    learning_goal_description: string | null;
    preferred_days: string[] | null;
}

interface Props {
    child: Child;
    subjects: Subject[];
    flash: any;
}

export default function EditChild({ child, subjects, flash }: Props) {
    // Modal States
    const [personalModalOpen, setPersonalModalOpen] = useState(false);
    const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    return (
        <div className="flex flex-col gap-8 pb-20">
            <Head title={`Child Profile: ${child.name}`} />

            {/* Breadcrumb / Header */}
            <div className="flex items-center gap-2 text-[clamp(1rem,2vw,1.25rem)] font-medium">
                <Link href="/guardian/dashboard" className="text-[#374151] hover:underline">Dashboard</Link>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-1" />
                <Link href="/guardian/children" className="text-[#374151] hover:underline">Children Details</Link>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-1" />
                <span className="text-[#338078]">Profile</span>
            </div>

            <div className="max-w-[1000px] flex flex-col gap-6">
                <h1 className="font-['Nunito'] font-semibold text-[20px] text-black">
                    Child Profile Settings
                </h1>

                {flash?.success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Header Card (Mirrors Student Profile Trend) */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="w-[120px] h-[120px] rounded-full bg-[#EDF7F6] border-4 border-white shadow-lg flex items-center justify-center text-[#338078]">
                        <Icon icon="ph:student" className="w-[70px] h-[70px]" />
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <div className="flex items-center gap-3">
                            <h2 className="font-['Nunito'] font-bold text-[24px] text-[#111928]">
                                {child.name}
                            </h2>
                            <UserStatusBadge status={child.status} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-['Nunito'] text-[14px] text-[#6b7280]">
                                Registered: {format(new Date(child.created_at), 'MMMM yyyy')}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-[#338078]">
                                <Icon icon="mdi:email-outline" className="w-4 h-4" />
                                <span className="font-['Nunito'] text-[14px]">
                                    {child.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            Personal Information
                        </h3>
                        <button
                            onClick={() => setPersonalModalOpen(true)}
                            className="flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Full Name:</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{child.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Gender:</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928] capitalize">{child.gender}</span>
                        </div>
                    </div>
                </div>

                {/* Learning Preferences Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            Learning Preferences
                        </h3>
                        <button
                            onClick={() => setPreferencesModalOpen(true)}
                            className="flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Subjects Display */}
                        <div className="flex flex-col gap-2">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Selected Subjects</span>
                            <div className="flex flex-wrap gap-4">
                                {subjects.filter(s => child.subjects.includes(s.id)).map(subject => (
                                    <div key={subject.id} className="bg-[#EDF7F6] text-[#338078] px-4 py-1.5 rounded-full text-sm font-medium border border-[#338078]/10 flex items-center gap-2">
                                        <Icon icon="mdi:check-circle" className="w-4 h-4" />
                                        {subject.name}
                                    </div>
                                ))}
                                {child.subjects.length === 0 && <span className="text-[#818181] text-sm">No subjects selected</span>}
                            </div>
                        </div>

                        {/* Goal Display */}
                        <div className="flex flex-col gap-1 pt-2 border-t border-gray-50">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Learning Goal</span>
                            <p className="font-['Nunito'] font-medium text-[15px] text-[#4b5563] leading-relaxed">
                                {child.learning_goal_description || 'No goal set yet.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preferred Schedule Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            Preferred Schedule
                        </h3>
                        <button
                            onClick={() => setScheduleModalOpen(true)}
                            className="flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const selected = child.preferred_days?.includes(day);
                            return (
                                <div key={day} className="flex items-center space-x-2">
                                    <div className={cn(
                                        "w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center",
                                        selected ? "bg-[#338078] border-[#338078]" : "border-[#d1d5db]"
                                    )}>
                                        {selected && <Icon icon="mdi:check" className="text-white w-3 h-3" />}
                                    </div>
                                    <span className={cn(
                                        "font-['Nunito'] text-[14px]",
                                        selected ? "text-[#111928] font-medium" : "text-[#9ca3af]"
                                    )}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditPersonalModal
                open={personalModalOpen}
                onOpenChange={setPersonalModalOpen}
                child={child}
            />
            <EditPreferencesModal
                open={preferencesModalOpen}
                onOpenChange={setPreferencesModalOpen}
                child={child}
                subjects={subjects}
            />
            <EditScheduleModal
                open={scheduleModalOpen}
                onOpenChange={setScheduleModalOpen}
                child={child}
            />
        </div>
    );
}

EditChild.layout = (page: React.ReactNode) => <GuardianLayout children={page} />;
