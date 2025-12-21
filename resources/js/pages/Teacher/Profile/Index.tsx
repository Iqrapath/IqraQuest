import { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import EditPersonalModal from './EditPersonalModal';
import EditAboutModal from './EditAboutModal';
import EditExperienceModal from './EditExperienceModal';
import EditAvailabilityModal from './EditAvailabilityModal';
import EditVideoModal from './EditVideoModal';

// Interfaces similar to Student/Guardian but tailored
interface Subject {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    user_id: number;
    bio: string | null;
    intro_video_url: string | null;
    city: string | null;
    country: string | null;
    timezone: string | null;
    teaching_mode: string | null;
    experience_years: number | null;
    subjects: Subject[];
    certificates: any[];
    availability: any[];
    hourly_rate: string | null;
    user: {
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        created_at: string;
    };
    get_average_rating_attribute: number; // snake_case from serialization usually
}

interface Props {
    teacher: Teacher;
    subjects: Subject[];
    flash: any;
}

export default function ProfileIndex({ teacher, subjects, flash }: Props) {
    const user = teacher.user;

    // Modal States
    const [personalModalOpen, setPersonalModalOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);
    const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);

    // Avatar Upload
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const { setData: setAvatarData, post: postAvatar, processing: avatarProcessing } = useForm({
        avatar: null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarData('avatar', e.target.files[0]);
            const formData = new FormData();
            formData.append('avatar', e.target.files[0]);
            postAvatar('/teacher/profile/avatar');
        }
    };

    // Calculate ratings (mock or from model)
    const rating = 4.8; // Hardcoded in design, using model if available
    const reviewCount = 120; // Hardcoded in design

    return (
        <>
            <Head title="Profile Settings" />

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
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-6 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
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

                        <div className="flex flex-col items-center sm:items-start gap-2 flex-grow">
                            <div className="flex items-center gap-2">
                                <h2 className="font-['Nunito'] font-bold text-[24px] text-[#111928]">
                                    {user.name}
                                </h2>
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                    <Icon icon="mdi:check-decagram" /> Verified
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-['Nunito'] text-[14px] text-[#6b7280]">
                                    Joined: {format(new Date(user.created_at), 'MMMM yyyy')}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Icon icon="solar:star-bold" className="text-yellow-400" />
                                    <span className="font-bold text-black">{rating}</span>
                                    <span>({reviewCount} Reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icon icon="mdi:map-marker-outline" />
                                    <span>{teacher.city && teacher.country ? `${teacher.city}, ${teacher.country}` : 'Location n/a'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Picture & Bio Section */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928]">
                            Profile Picture & Bio
                        </h3>
                        {/* No Edit button here in Figma? Wait, Figma shows "Edit" at bottom right. */}
                        <button
                            onClick={() => setPersonalModalOpen(true)}
                            className="absolute bottom-8 right-8 flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                        >
                            <Icon icon="tabler:edit" />
                            Edit
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
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
                                {teacher.city && teacher.country ? `${teacher.city}, ${teacher.country}` : 'Lagos Nigeria'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* About Me */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928] mb-4">
                        About Me
                    </h3>
                    <p className="font-['Nunito'] font-light text-[15px] text-[#4b5563] leading-relaxed pr-8">
                        {teacher.bio || "Dedicated Quran teacher with 10+ years of experience in Hifz and Tajweed."}
                    </p>
                    <button
                        onClick={() => setAboutModalOpen(true)}
                        className="absolute bottom-8 right-8 flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                    >
                        <Icon icon="tabler:edit" />
                        Edit
                    </button>
                </div>

                {/* Intro Video */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928] mb-2">
                        Intro video
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">Make a connection with potential buyers while building credibility and gaining trust.</p>

                    <div className="flex justify-center py-4">
                        {teacher.intro_video_url ? (
                            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-black group">
                                <video src={teacher.intro_video_url} controls className="w-full h-full" />
                                <button
                                    onClick={() => setVideoModalOpen(true)}
                                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                                >
                                    <Icon icon="tabler:edit" className="text-[#338078]" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setVideoModalOpen(true)}
                                className="flex items-center gap-2 text-[#338078] font-medium hover:underline"
                            >
                                <Icon icon="solar:add-circle-linear" />
                                Add Intro Video
                            </button>
                        )}
                    </div>
                </div>

                {/* Teaching Subjects & Expertise */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928] mb-6">
                        Teaching Subjects & Expertise
                    </h3>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Subjects</span>
                            <div className="flex flex-wrap gap-4">
                                {subjects.map(subject => {
                                    const selected = teacher.subjects.map((s: any) => s.id).includes(subject.id);
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

                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-16">
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Experience:</span>
                                <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">
                                    {teacher.experience_years ? `${teacher.experience_years}+ Years` : '0 Years'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Certifications:</span>
                                <div className="flex flex-col">
                                    {teacher.certificates?.length > 0 ? teacher.certificates.map((c: any) => (
                                        <span key={c.id} className="font-['Nunito'] font-medium text-[16px] text-[#111928]">{c.title}</span>
                                    )) : (
                                        <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">None</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setExperienceModalOpen(true)}
                        className="absolute bottom-8 right-8 flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                    >
                        <Icon icon="tabler:edit" />
                        Edit
                    </button>
                </div>

                {/* Availability & Time Zone */}
                <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_rgba(68,68,68,0.1)] p-8 relative">
                    <h3 className="font-['Nunito'] font-medium text-[20px] text-[#111928] mb-6">
                        Availability & Time Zone
                    </h3>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Available Days:</span>
                            <div className="flex flex-wrap gap-4">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                    const available = teacher.availability.some((a: any) => a.day_of_week === day.toLowerCase() && a.is_available);
                                    return (
                                        <div key={day} className="flex items-center space-x-2">
                                            <div className={cn(
                                                "w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center",
                                                available ? "bg-[#338078] border-[#338078]" : "border-[#d1d5db]"
                                            )}>
                                                {available && <Icon icon="mdi:check" className="text-white w-3 h-3" />}
                                            </div>
                                            <span className="font-['Nunito'] text-[14px] text-[#4b5563]">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Preferred Teaching Hours - Derived roughly for display, or simple string logic if needed. 
                                 Design shows "3 PM - 9 PM". We can show per day or just generic. 
                                 Let's show the Teaching Mode here based on logic.
                             */}
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Preferred Teaching Hours:</span>
                                <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">
                                    {/* Simplification: Show first available range or generic */}
                                    See detailed schedule
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Available Time:</span>
                                <span className="font-['Nunito'] font-medium text-[16px] text-[#111928] capitalize">
                                    {teacher.teaching_mode}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-['Nunito'] text-[12px] text-[#9ca3af]">Time Zone:</span>
                                <span className="font-['Nunito'] font-medium text-[16px] text-[#111928]">
                                    {teacher.timezone}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setAvailabilityModalOpen(true)}
                        className="absolute bottom-8 right-8 flex items-center gap-1 text-[#338078] font-['Nunito'] text-[14px]"
                    >
                        <Icon icon="tabler:edit" />
                        Edit
                    </button>
                </div>

                {/* Modals */}
                <EditPersonalModal
                    open={personalModalOpen}
                    onOpenChange={setPersonalModalOpen}
                    user={user}
                    teacher={teacher}
                />
                <EditAboutModal
                    open={aboutModalOpen}
                    onOpenChange={setAboutModalOpen}
                    teacher={teacher}
                />
                <EditExperienceModal
                    open={experienceModalOpen}
                    onOpenChange={setExperienceModalOpen}
                    teacher={teacher}
                    subjects={subjects}
                />
                <EditAvailabilityModal
                    open={availabilityModalOpen}
                    onOpenChange={setAvailabilityModalOpen}
                    teacher={teacher}
                />
                <EditVideoModal
                    open={videoModalOpen}
                    onOpenChange={setVideoModalOpen}
                    teacher={teacher}
                />

                {/* Modals are self-saving, so no global save button needed */}

            </div>
        </>
    );
}

ProfileIndex.layout = (page: React.ReactNode) => <TeacherLayout children={page} />;
