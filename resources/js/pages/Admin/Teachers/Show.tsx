import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import TeacherStatusBadge from '@/components/Teachers/TeacherStatusBadge';
import TeacherApprovalModal from '@/components/Teachers/TeacherApprovalModal';
import TeacherRejectionModal from '@/components/Teachers/TeacherRejectionModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Teacher {
    id: number;
    status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
    country: string;
    city: string;
    experience_years: number;
    hourly_rate: number;
    preferred_currency: string;
    bio: string;
    qualifications: string;
    qualification_level: string;
    timezone: string;
    teaching_mode: string;
    created_at: string;
    user: {
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
    subjects?: Array<{
        id: number;
        name: string;
        pivot: {
            proficiency_level: string;
            years_teaching: number;
        };
    }>;
    certificates?: Array<{
        id: number;
        title: string;
        issuing_organization: string;
        issue_date: string;
        verification_status: string;
        file_path: string;
    }>;
    availability?: Array<{
        day: string;
        start_time: string;
        end_time: string;
        is_available: boolean;
    }>;
}

interface Props {
    teacher: Teacher;
    stats: {
        total_subjects: number;
        total_certificates: number;
        verified_certificates: number;
        availability_days: number;
    };
}

export default function TeacherShow({ teacher, stats }: Props) {
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

    return (
        <>
            <Head title={`Teacher Management - ${teacher.user.name}`} />

            <div className="py-8 px-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/teachers"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
                        Back to Teachers
                    </Link>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3d7872] to-[#F2A100] flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                                {teacher.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{teacher.user.name}</h1>
                                <p className="text-gray-600">{teacher.user.email}</p>
                                <div className="mt-2">
                                    <TeacherStatusBadge status={teacher.status} />
                                </div>
                            </div>
                        </div>
                        {teacher.status === 'pending' && (
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setApprovalModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Icon icon="mdi:check-circle" className="w-5 h-5 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => setRejectionModalOpen(true)}
                                    variant="destructive"
                                >
                                    <Icon icon="mdi:close-circle" className="w-5 h-5 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_subjects}</p>
                            </div>
                            <Icon icon="mdi:book-open-variant" className="w-10 h-10 text-[#3d7872]" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Certificates</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.verified_certificates}/{stats.total_certificates}</p>
                            </div>
                            <Icon icon="mdi:certificate-outline" className="w-10 h-10 text-[#F2A100]" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Experience</p>
                                <p className="text-2xl font-bold text-gray-900">{teacher.experience_years} years</p>
                            </div>
                            <Icon icon="mdi:chart-line" className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Hourly Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{teacher.preferred_currency} {teacher.hourly_rate}</p>
                            </div>
                            <Icon icon="mdi:cash" className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <Icon icon="mdi:account" className="w-6 h-6 mr-2 text-[#3d7872]" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{teacher.user.email}</p>
                                </div>
                                {teacher.user.phone && (
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{teacher.user.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-medium">{teacher.city}, {teacher.country}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Timezone</p>
                                    <p className="font-medium">{teacher.timezone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Teaching Mode</p>
                                    <p className="font-medium capitalize">{teacher.teaching_mode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Joined</p>
                                    <p className="font-medium">{new Date(teacher.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {teacher.bio && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center">
                                    <Icon icon="mdi:text" className="w-6 h-6 mr-2 text-[#3d7872]" />
                                    Biography
                                </h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{teacher.bio}</p>
                            </div>
                        )}

                        {/* Subjects */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <Icon icon="mdi:book-open-variant" className="w-6 h-6 mr-2 text-[#3d7872]" />
                                Subjects ({teacher.subjects?.length || 0})
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {teacher.subjects && teacher.subjects.length > 0 ? (
                                    teacher.subjects.map((subject) => (
                                        <div key={subject.id} className="border rounded-lg p-4">
                                            <p className="font-semibold text-gray-900">{subject.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Proficiency: {subject.pivot.proficiency_level}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Teaching: {subject.pivot.years_teaching} years
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 col-span-2">No subjects added</p>
                                )}
                            </div>
                        </div>

                        {/* Certificates */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <Icon icon="mdi:certificate-outline" className="w-6 h-6 mr-2 text-[#3d7872]" />
                                Certificates ({teacher.certificates?.length || 0})
                            </h2>
                            <div className="space-y-3">
                                {teacher.certificates && teacher.certificates.length > 0 ? (
                                    teacher.certificates.map((cert) => (
                                        <div key={cert.id} className="border rounded-lg p-4 flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{cert.title}</p>
                                                <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                                                <p className="text-sm text-gray-500">Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
                                                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${cert.verification_status === 'verified'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {cert.verification_status}
                                                </span>
                                            </div>
                                            <a
                                                href={`/storage/${cert.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#3d7872] hover:text-[#2d5852]"
                                            >
                                                <Icon icon="mdi:download" className="w-6 h-6" />
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No certificates uploaded</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Qualifications & Availability */}
                    <div className="space-y-6">
                        {/* Qualifications */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Qualifications</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Level</p>
                                    <p className="font-medium">{teacher.qualification_level}</p>
                                </div>
                                {teacher.qualifications && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Details</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{teacher.qualifications}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Availability</h2>
                            <div className="space-y-2">
                                {teacher.availability && teacher.availability.length > 0 ? (
                                    teacher.availability.map((slot, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <span className="font-medium capitalize">{slot.day}</span>
                                            <span className="text-sm text-gray-600">
                                                {slot.start_time} - {slot.end_time}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No availability set</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TeacherApprovalModal
                isOpen={approvalModalOpen}
                onClose={() => setApprovalModalOpen(false)}
                teacher={teacher}
            />
            <TeacherRejectionModal
                isOpen={rejectionModalOpen}
                onClose={() => setRejectionModalOpen(false)}
                teacher={teacher}
            />
        </>
    );
}

TeacherShow.layout = (page: React.ReactNode) => <AdminLayout children={page} />;
