import { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import EditPersonalModal from './EditPersonalModal';
import EditAboutModal from './EditAboutModal';
import EditDetailsModal from './EditDetailsModal';
import EditPreferencesModal from './EditPreferencesModal';

interface Subject {
    id: number;
    name: string;
}

interface Student {
    id: number;
    user_id: number;
    bio: string | null;
    city: string | null;
    country: string | null;
    timezone: string | null;
    preferred_days: any; // Can be array of strings or objects now
    preferred_hours: string | null;
    availability_type: string | null;
    learning_goal_description: string | null;
    subjects: Subject[];
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    created_at: string;
}

interface Props {
    auth: {
        user: User;
    };
    student: Student;
    subjects: Subject[];
    flash: any;
}

export default function ProfileIndex({ auth, student, subjects, flash }: Props) {
    const { user } = auth;

    // Modal States
    const [personalModalOpen, setPersonalModalOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

    // Avatar upload
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const { setData: setAvatarData, post: postAvatar, processing: avatarProcessing } = useForm({
        avatar: null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarData('avatar', e.target.files[0]);

            const formData = new FormData();
            formData.append('avatar', e.target.files[0]);

            postAvatar('/student/profile/avatar');
        }
    };

    // Helper to format days for display
    const getFormattedDays = () => {
        if (!student.preferred_days) return [];
        if (Array.isArray(student.preferred_days)) {
            // Check if objects or strings
            if (student.preferred_days.length > 0 && typeof student.preferred_days[0] === 'object') {
                return student.preferred_days.map((d: any) => d.day);
            }
            return student.preferred_days;
        }
        return [];
    };

    const formattedDays = getFormattedDays();

    return (
        <>
            <Head title="Profile" />

            <div className="max-w-[1000px] flex flex-col gap-6 pb-20">
                <h1 className="font-['Nunito'] font-semibold text-[20px] text-black">
                    Profile Settings
                </h1>

                {flash?.success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Header Card */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-lg overflow-hidden relative group">
                            <img
                                src={user.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${user.name}&background=338078&color=fff`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => avatarInputRef.current?.click()}
                            >
                                <Icon icon="fa6-solid:camera" className="text-white w-6 h-6" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="font-['Nunito'] font-medium text-[16px] text-[#338078]"
                        >
                            {avatarProcessing ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <h2 className="font-['Nunito'] font-bold text-[24px] text-[#111928]">
                            {user.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="font-['Nunito'] text-[14px] text-[#6b7280]">
                                Joined: {format(new Date(user.created_at), 'MMMM yyyy')}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-[#338078]">
                                <Icon icon="mdi:map-marker-outline" className="w-4 h-4" />
                                <span className="font-['Nunito'] text-[14px]">
                                    {student.city && student.country ? `${student.city}, ${student.country}` : 'Location not set'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            Profile Details
                        </h3>
                        <button
                            onClick={() => setPersonalModalOpen(true)}
                            className="flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Name:</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{user.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Email:</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{user.email}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Phone:</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{user.phone || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Location:</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">
                                {student.city && student.country ? `${student.city}, ${student.country}` : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* About Me Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            About Me
                        </h3>
                        <button
                            onClick={() => setAboutModalOpen(true)}
                            className="flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>
                    <p className="font-['Nunito'] font-light text-[15px] text-[#4b5563] leading-relaxed pr-8">
                        {student.bio || "No bio added yet."}
                    </p>
                </div>

                {/* Student Details Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            Student Details
                        </h3>
                        <button
                            onClick={() => setDetailsModalOpen(true)}
                            className="flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Days Display */}
                        <div className="flex flex-col gap-2">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Preferred Learning Time</span>
                            <div className="flex flex-wrap gap-4">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <div className={cn(
                                            "w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center",
                                            formattedDays.includes(day) ? "bg-[#338078] border-[#338078]" : "border-[#d1d5db]"
                                        )}>
                                            {formattedDays.includes(day) && <Icon icon="mdi:check" className="text-white w-3 h-3" />}
                                        </div>
                                        <span className="font-['Nunito'] text-[14px] text-[#4b5563]">{day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Available Time:</span>
                                <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{student.availability_type || '-'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Time Zone:</span>
                                <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{student.timezone || '-'}</span>
                            </div>
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
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Subjects</span>
                            <div className="flex flex-wrap gap-6">
                                {subjects.map(subject => {
                                    const selected = student.subjects.map((s: any) => s.id).includes(subject.id);
                                    return (
                                        <div key={subject.id} className="flex items-center space-x-2">
                                            <div className={cn(
                                                "w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center",
                                                selected ? "bg-[#338078] border-[#338078]" : "border-[#d1d5db]"
                                            )}>
                                                {selected && <Icon icon="mdi:check" className="text-white w-3 h-3" />}
                                            </div>
                                            <span className="font-['Nunito'] text-[14px] text-[#4b5563]">{subject.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Goal Display */}
                        <div className="flex flex-col gap-1">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Learning Goal</span>
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">
                                {student.learning_goal_description || 'No goal set'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <EditPersonalModal
                    open={personalModalOpen}
                    onOpenChange={setPersonalModalOpen}
                    user={user}
                    student={student}
                />
                <EditAboutModal
                    open={aboutModalOpen}
                    onOpenChange={setAboutModalOpen}
                    student={student}
                />
                <EditDetailsModal
                    open={detailsModalOpen}
                    onOpenChange={setDetailsModalOpen}
                    student={student}
                />
                <EditPreferencesModal
                    open={preferencesModalOpen}
                    onOpenChange={setPreferencesModalOpen}
                    student={student}
                    subjects={subjects}
                />

            </div>
        </>
    );
}

ProfileIndex.layout = (page: React.ReactNode) => <StudentLayout children={page} />;
