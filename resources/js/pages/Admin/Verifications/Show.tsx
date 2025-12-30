import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import ScheduleCallModal from './components/ScheduleCallModal';
import DocumentUploadModal from '@/components/Teachers/DocumentUploadModal';
import SendMessageModal from './components/SendMessageModal';
import RejectVerificationModal from './components/RejectVerificationModal';
import TeacherPerformanceStats from '@/components/Teachers/TeacherPerformanceStats';
import TeacherActionButtons from '@/components/Teachers/TeacherActionButtons';
import TeacherSuspensionModal from '@/components/Teachers/TeacherSuspensionModal';
import DeleteAccountModal from '@/components/Teachers/DeleteAccountModal';
import ApproveVerificationModal from './components/ApproveVerificationModal';
import { Button } from '@/components/ui/button';
import TeacherStatusBadge from '@/components/Teachers/TeacherStatusBadge';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Teacher {
    id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected' | 'under_review';
    rejection_reason?: string;
    video_verification_status: string;
    video_verification_scheduled_at: string | null;
    video_verification_room_id: string | null;
    country: string;
    gender?: string;
    city: string;
    experience_years: number;
    hourly_rate: number;
    preferred_currency: string;
    bio: string;
    qualifications: string;
    qualification_level: string;
    timezone: string;
    teaching_mode: string;
    application_submitted_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
    subjects: { id: number; name: string }[];
    certificates: {
        id: number;
        title: string;
        verification_status: string;
        certificate_type: string;
        file_path: string;
        file_name: string;
        created_at: string;
    }[];
}

interface Props {
    teacher: Teacher;
    stats: {
        has_required_docs: boolean;
        verified_docs_count: number;
        total_docs_count: number;
        sessions_count: number;
        reviews_count: number;
        average_rating: number;
    };
    earnings?: {
        wallet_balance: number;
        total_earned: number;
        pending_payouts: number;
    };
    verificationChecklist: {
        id_front: { label: string; uploaded: boolean; verified: boolean; status: string };
        id_back: { label: string; uploaded: boolean; verified: boolean; status: string };
        cv: { label: string; uploaded: boolean; verified: boolean; status: string };
        video_verification: { label: string; completed: boolean; status: string };
        certificates: { label: string; total: number; verified: number };
    };
    hasIncompleteVerifications: boolean;
}

export default function VerificationShow({
    teacher,
    stats,
    earnings = { wallet_balance: 18500, total_earned: 210000, pending_payouts: 15000 },
    verificationChecklist,
    hasIncompleteVerifications
}: Props) {
    const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [uploadType, setUploadType] = useState<'id_card_front' | 'id_card_back' | 'cv' | 'certificate'>('certificate');

    const openUploadModal = (type: 'id_card_front' | 'id_card_back' | 'cv' | 'certificate') => {
        setUploadType(type);
        setIsUploadModalOpen(true);
    };
    const handleVerifyDoc = (certificateId: number, status: 'verified' | 'rejected') => {
        router.post(`/admin/verifications/${teacher.id}/documents/${certificateId}/verify`, {
            status,
        }, {
            preserveScroll: true
        });
    };

    const handleCopyUrl = () => {
        const url = `${window.location.origin}/admin/verifications/${teacher.id}/room`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Room URL copied to clipboard');
        });
    };

    const idFront = teacher.certificates.find(c => c.certificate_type === 'id_card_front');
    const idBack = teacher.certificates.find(c => c.certificate_type === 'id_card_back');
    const cvDoc = teacher.certificates.find(c => c.certificate_type === 'cv');
    const certificates = teacher.certificates.filter(c => !['id_card_front', 'id_card_back', 'cv'].includes(c.certificate_type));

    const verifiedCertsCount = certificates.filter(c => c.verification_status === 'verified').length;
    const totalCertsCount = certificates.length;
    const verifiedCertsRealCount = certificates.filter(c => c.verification_status === 'verified').length;

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return { icon: 'solar:file-check-bold', color: 'text-red-500', bg: 'bg-red-50' };
            case 'doc':
            case 'docx': return { icon: 'solar:file-text-bold', color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'webp': return { icon: 'solar:gallery-bold', color: 'text-green-500', bg: 'bg-green-50' };
            default: return { icon: 'solar:document-bold', color: 'text-gray-400', bg: 'bg-gray-50' };
        }
    };

    const calculateProgress = () => {
        // ... (existing logic)
    };

    const handleApprove = () => {
        setIsApproveModalOpen(true);
    };

    const handleReject = () => {
        setIsRejectModalOpen(true);
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title={`Verification - ${teacher.user.name}`} />

            <div className="flex flex-col gap-6 md:gap-8 p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto min-h-screen bg-white">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 font-medium">Dashboard</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <span className="text-gray-900 font-bold text-lg">Verification Requests</span>
                    </div>
                    <p className="text-gray-500 max-w-3xl leading-relaxed">
                        Review teacher documents and conduct live video verification before approving full access to the platform.
                    </p>
                </div>

                {/* Profile & Earnings Row */}
                <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 items-center md:items-start">
                    {/* Left: Avatar & Basic Info */}
                    <div className="flex flex-col items-center text-center gap-4 min-w-[200px]">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100">
                            {teacher.user.avatar ? (
                                <img src={`/storage/${teacher.user.avatar}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#f3f4f6] flex items-center justify-center">
                                    <Icon icon="solar:user-bold" className="text-gray-300 w-16 h-16" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-[#101928]">{teacher.user.name}</h1>
                            <p className="text-gray-500 font-medium text-sm">Teacher</p>
                            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mt-1">
                                <Icon icon="solar:map-point-linear" className="w-3.5 h-3.5" />
                                <span>{teacher.city}, {teacher.country}</span>
                            </div>
                            <div className="mt-2 flex justify-center">
                                <TeacherStatusBadge
                                    status={teacher.status}
                                    tooltipContent={teacher.status === 'rejected' ? teacher.rejection_reason : undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Earnings Card */}
                    <div className="flex-1 w-full md:w-auto md:min-w-[300px] lg:min-w-[400px]">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm space-y-4 sm:space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Earnings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="bg-[#f0f7ff] rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Icon icon="solar:wallet-2-bold" className="text-[#007bff] w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#007bff] uppercase tracking-wider">Wallet Balance</p>
                                        <p className="text-lg font-extrabold text-[#101928]">{formatCurrency(earnings.wallet_balance)}</p>
                                    </div>
                                </div>
                                <div className="bg-[#effefd] rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Icon icon="solar:graph-up-bold" className="text-[#338078] w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#338078] uppercase tracking-wider">Total Earned</p>
                                        <p className="text-lg font-extrabold text-[#101928]">{formatCurrency(earnings.total_earned)}</p>
                                    </div>
                                </div>
                                <div className="bg-[#fff9ed] rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Icon icon="solar:clock-circle-bold" className="text-[#f59e0b] w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider">Pending Payouts</p>
                                        <p className="text-lg font-extrabold text-[#101928]">{formatCurrency(earnings.pending_payouts)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Link href={`/admin/teachers/${teacher.id}/earnings`} className="underline text-[#338078] text-xs font-bold">View Teacher Earnings</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Professional Info Panel */}
                <div className="bg-[#fcfcfc] rounded-2xl border border-gray-100 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-y-8">
                        <div className="flex items-center gap-3">
                            <Icon icon="solar:letter-linear" className="text-[#338078] w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700">{teacher.user.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="solar:phone-linear" className="text-[#338078] w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700">{teacher.user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="solar:book-linear" className="text-[#338078] w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700">Subjects: {teacher.subjects.map(s => s.name).join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="solar:calendar-linear" className="text-[#338078] w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700">{stats.sessions_count} Sessions</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Icon icon="solar:star-linear" className="text-[#338078] w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700">
                                {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : 'No rating'} ({stats.reviews_count} {stats.reviews_count === 1 ? 'Review' : 'Reviews'})
                            </span>
                        </div>
                    </div>

                    {/* Verification Call Section */}
                    <div className="pt-6 md:pt-8 border-t border-gray-100 overflow-hidden">
                        {/* Status badges row */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-500">Submitted On:</span>
                                <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-700">
                                    {teacher.application_submitted_at ? format(new Date(teacher.application_submitted_at), 'MMM d, yyyy') : '-'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-500">Video Status:</span>
                                <div className={`px-2 sm:px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${teacher.video_verification_status === 'completed' ? 'bg-green-100 text-green-700' :
                                    teacher.video_verification_status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                        teacher.video_verification_status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'
                                    }`}>
                                    <Icon
                                        icon={teacher.video_verification_status === 'completed' ? "solar:check-circle-bold" :
                                            teacher.video_verification_status === 'scheduled' ? "solar:calendar-mark-bold" :
                                                "solar:hourglass-bold"}
                                        className="w-3.5 h-3.5"
                                    />
                                    <span className="capitalize">{teacher.video_verification_status ? teacher.video_verification_status.replace('_', ' ') : 'Not Scheduled'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Scheduled Call Card + Actions */}
                        {teacher.video_verification_status === 'scheduled' && teacher.video_verification_scheduled_at ? (() => {
                            const scheduledAt = new Date(teacher.video_verification_scheduled_at);
                            const now = new Date();
                            const earlyJoinTime = new Date(scheduledAt.getTime() - 15 * 60 * 1000);
                            const lateJoinTime = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
                            const canJoinNow = now >= earlyJoinTime && now <= lateJoinTime;
                            const isTooEarly = now < earlyJoinTime;

                            return (
                                <div className="space-y-4">
                                    {/* Schedule Card */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 border border-blue-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                                <Icon icon="solar:videocamera-record-bold" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">Scheduled Verification Call</p>
                                                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                                                    {format(scheduledAt, 'EEEE, MMM d, yyyy')}
                                                </p>
                                                <p className="text-lg sm:text-2xl font-extrabold text-blue-600">
                                                    {format(scheduledAt, 'h:mm a')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Join Status Message */}
                                        <div className="mt-3 pt-3 border-t border-blue-100">
                                            {canJoinNow ? (
                                                <p className="text-xs sm:text-sm font-bold text-green-600 flex items-center gap-1">
                                                    <Icon icon="solar:check-circle-bold" className="w-4 h-4 shrink-0" />
                                                    <span>Room is open! You can join now.</span>
                                                </p>
                                            ) : isTooEarly ? (
                                                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                                    <Icon icon="solar:clock-circle-linear" className="w-4 h-4 shrink-0" />
                                                    <span>Room opens at <strong>{format(earlyJoinTime, 'h:mm a')}</strong></span>
                                                </p>
                                            ) : (
                                                <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                                                    <Icon icon="solar:close-circle-linear" className="w-4 h-4 shrink-0" />
                                                    <span>Session time passed. Please reschedule.</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        <Link
                                            href={`/admin/verifications/${teacher.id}/room`}
                                            className={`h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold inline-flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${canJoinNow
                                                ? 'bg-[#338078] hover:bg-[#2a6a63] text-base cursor-pointer'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
                                                }`}
                                        >
                                            <Icon icon="solar:videocamera-record-bold" className="w-4 h-4 sm:w-5 sm:h-5" />
                                            {canJoinNow ? 'Join Room' : 'Not Available'}
                                        </Link>
                                        <Button
                                            onClick={handleCopyUrl}
                                            variant="outline"
                                            className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl border-gray-200 text-base font-bold hover:text-base text-sm sm:text-base cursor-pointer"
                                        >
                                            <Icon icon="solar:copy-bold" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                            Copy Link
                                        </Button>
                                        <Button
                                            onClick={() => setIsScheduleCallOpen(true)}
                                            variant="outline"
                                            className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl border-gray-200 text-base font-bold hover:text-base text-sm sm:text-base cursor-pointer"
                                        >
                                            <Icon icon="solar:calendar-minimalistic-bold" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                            Reschedule
                                        </Button>
                                    </div>
                                </div>
                            );
                        })() : (
                            /* Not Scheduled State */
                            <Button
                                onClick={() => setIsScheduleCallOpen(true)}
                                variant="outline"
                                className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl border-gray-200 text-base font-bold hover:text-base text-sm sm:text-base cursor-pointer"
                            >
                                <Icon icon="solar:calendar-add-bold" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                Schedule Verification Call
                            </Button>
                        )}
                    </div>
                </div>

                {/* Documents Review Panel */}
                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#101928] font-['Nunito']">Documents Review Panel</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f9fafb] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 text-xs font-bold text-[#344054] uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-5 text-xs font-bold text-[#344054] uppercase tracking-wider">File</th>
                                        <th className="px-6 py-5 text-xs font-bold text-[#344054] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-xs font-bold text-[#344054] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {teacher.certificates.map(doc => (
                                        <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-medium text-gray-700 capitalize">{doc.certificate_type.replace('_', ' ')}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <a href={`/storage/${doc.file_path}`} target="_blank" className="text-sm text-gray-500 underline decoration-gray-300">
                                                    {doc.file_name}
                                                </a>
                                            </td>
                                            <td className="px-6 py-6">
                                                {doc.verification_status === 'verified' && (
                                                    <Icon icon="solar:check-circle-bold" className="text-green-500 w-5 h-5" />
                                                )}
                                                {doc.verification_status === 'rejected' && (
                                                    <Icon icon="solar:close-circle-bold" className="text-red-500 w-5 h-5" />
                                                )}
                                                {doc.verification_status === 'pending' && (
                                                    <Icon icon="solar:hourglass-bold" className="text-orange-400 w-5 h-5" />
                                                )}
                                            </td>
                                            <td className="px-6 py-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                                            <Icon icon="tabler:dots-vertical" className="w-5 h-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] bg-white border border-gray-100">
                                                        <DropdownMenuItem
                                                            onClick={() => handleVerifyDoc(doc.id, 'verified')}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#338078]/5 transition-colors"
                                                        >
                                                            <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-500" />
                                                            <span>Verify</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleVerifyDoc(doc.id, 'rejected')}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-red-500" />
                                                            <span>Reject</span>
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
                </div>

                {/* Structured Document Section */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-[#101928] font-['Nunito']">Document Section</h2>

                    <div className="grid grid-cols-1 gap-6">
                        {/* ID Verification Large Block */}
                        <div className="bg-[#fcfcfc] rounded-2xl border border-gray-100 p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700">ID Verification:</span>
                                    <div className="flex items-center gap-1">
                                        {(idFront?.verification_status === 'verified' && idBack?.verification_status === 'verified') ? (
                                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium italic">
                                                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                                                <span>Verified</span>
                                            </div>
                                        ) : (idFront || idBack) ? (
                                            <div className="flex items-center gap-1 text-xs text-orange-400 font-medium italic">
                                                <Icon icon="solar:hourglass-bold" className="w-3.5 h-3.5" />
                                                <span>Pending Review</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium italic">
                                                <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5" />
                                                <span>Not Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-8 lg:gap-12 items-stretch sm:items-center">
                                {/* Document Front */}
                                <div className="space-y-4 flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[280px]">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-gray-500">Document Front</p>
                                        {idFront && idFront.verification_status === 'pending' && (
                                            <button
                                                onClick={() => handleVerifyDoc(idFront.id, 'verified')}
                                                className="text-[10px] bg-[#338078] text-white px-2 py-0.5 rounded font-bold hover:bg-[#2a6a63] transition-colors"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                    <div className="w-full aspect-[1.6/1] bg-gray-100 rounded-2xl flex items-center justify-center p-2 border border-gray-100 relative group overflow-hidden">
                                        {idFront ? (
                                            <>
                                                {idFront.file_name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                                    <img src={`/storage/${idFront.file_path}`} alt="ID Front" className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Icon icon="solar:document-bold" className="text-gray-300 w-12 h-12" />
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{idFront.file_name}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <a href={`/storage/${idFront.file_path}`} target="_blank" className="p-2 bg-white rounded-full text-gray-700 hover:text-[#338078]">
                                                        <Icon icon="solar:eye-linear" className="w-5 h-5" />
                                                    </a>
                                                    <button onClick={() => openUploadModal('id_card_front')} className="p-2 bg-white rounded-full text-gray-700 hover:text-[#338078]">
                                                        <Icon icon="solar:upload-linear" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openUploadModal('id_card_front')}
                                                className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                            >
                                                <Icon icon="solar:upload-linear" className="text-gray-300 w-10 h-10" />
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Upload Front</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Document Back */}
                                <div className="space-y-4 flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[280px]">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-gray-500">Document Back</p>
                                        {idBack && idBack.verification_status === 'pending' && (
                                            <button
                                                onClick={() => handleVerifyDoc(idBack.id, 'verified')}
                                                className="text-[10px] bg-[#338078] text-white px-2 py-0.5 rounded font-bold hover:bg-[#2a6a63] transition-colors"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                    <div className="w-full aspect-[1.6/1] bg-gray-100 rounded-2xl flex items-center justify-center p-2 border border-gray-100 relative group overflow-hidden">
                                        {idBack ? (
                                            <>
                                                {idBack.file_name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                                    <img src={`/storage/${idBack.file_path}`} alt="ID Back" className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Icon icon="solar:document-bold" className="text-gray-300 w-12 h-12" />
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{idBack.file_name}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <a href={`/storage/${idBack.file_path}`} target="_blank" className="p-2 bg-white rounded-full text-gray-700 hover:text-[#338078]">
                                                        <Icon icon="solar:eye-linear" className="w-5 h-5" />
                                                    </a>
                                                    <button onClick={() => openUploadModal('id_card_back')} className="p-2 bg-white rounded-full text-gray-700 hover:text-[#338078]">
                                                        <Icon icon="solar:upload-linear" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openUploadModal('id_card_back')}
                                                className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                            >
                                                <Icon icon="solar:upload-linear" className="text-gray-300 w-10 h-10" />
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Upload Back</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-4">
                                <button
                                    onClick={() => openUploadModal('id_card_front')}
                                    className="text-gray-400 text-xs font-bold underline"
                                >
                                    Re-upload ID
                                </button>
                                <button className="text-[#338078] text-xs font-bold underline">Review Documents</button>
                            </div>
                        </div>

                        {/* Certificates Detailed Section */}
                        <div className="bg-[#fcfcfc] rounded-2xl border border-gray-100 p-8 space-y-8">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700">Certificates:</span>
                                <div className="flex items-center gap-1">
                                    {verifiedCertsRealCount > 0 && verifiedCertsRealCount === totalCertsCount ? (
                                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium italic">
                                            <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                                            <span>All {totalCertsCount} Verified</span>
                                        </div>
                                    ) : totalCertsCount > 0 ? (
                                        <div className="flex items-center gap-1 text-xs text-orange-400 font-medium italic">
                                            <Icon icon="solar:hourglass-bold" className="w-3.5 h-3.5" />
                                            <span>{verifiedCertsRealCount}/{totalCertsCount} Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium italic">
                                            <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5" />
                                            <span>No certificates added yet</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => openUploadModal('certificate')}
                                    className="ml-auto flex items-center gap-1.5 bg-[#338078]/10 text-[#338078] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#338078]/20 transition-colors"
                                >
                                    <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                                    Add Another
                                </button>
                            </div>

                            {certificates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {certificates.map(c => (
                                        <div key={c.id} className="flex gap-6 items-center">
                                            {/* ... certificate rendering ... */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-[#338078] leading-tight max-w-[150px]">
                                                        {c.title}
                                                    </p>
                                                    {c.verification_status === 'verified' ? (
                                                        <Icon icon="solar:check-circle-bold" className="text-green-500 w-3 h-3" />
                                                    ) : (
                                                        <Icon icon="solar:hourglass-bold" className="text-orange-400 w-3 h-3" />
                                                    )}
                                                </div>
                                                {c.verification_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleVerifyDoc(c.id, 'verified')}
                                                        className="text-[10px] text-[#338078] font-bold hover:underline"
                                                    >
                                                        Verify Now
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-40 aspect-square bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm group overflow-hidden relative">
                                                    {c.file_name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                                        <img src={`/storage/${c.file_path}`} alt={c.title} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <div className={`w-full h-full ${getFileIcon(c.file_name).bg} flex flex-col items-center justify-center gap-2`}>
                                                            <Icon icon={getFileIcon(c.file_name).icon} className={`${getFileIcon(c.file_name).color} w-12 h-12`} />
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{c.file_name.split('.').pop()}</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a href={`/storage/${c.file_path}`} target="_blank" className="p-2 bg-white rounded-full text-gray-700 hover:text-[#338078] transition-all scale-90 group-hover:scale-100">
                                                            <Icon icon="solar:eye-linear" className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setUploadType('certificate');
                                                            setIsUploadModalOpen(true);
                                                        }}
                                                        className="text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:text-gray-600 transition-colors"
                                                    >
                                                        Replace
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Icon icon="solar:document-add-linear" className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-500">No Certificates Uploaded</p>
                                        <p className="text-xs text-gray-400">Click the button above to add the teacher's credentials.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CV / Resume Section */}
                        <div className="bg-[#fcfcfc] rounded-2xl border border-gray-100 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700">CV/Resume:</span>
                                    <div className="flex items-center gap-1">
                                        {cvDoc?.verification_status === 'verified' ? (
                                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium italic">
                                                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                                                <span>Verified</span>
                                            </div>
                                        ) : cvDoc ? (
                                            <div className="flex items-center gap-1 text-xs text-orange-400 font-medium italic">
                                                <Icon icon="solar:hourglass-bold" className="w-3.5 h-3.5" />
                                                <span>Pending Review</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium italic">
                                                <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5" />
                                                <span>Not Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {cvDoc?.verification_status === 'pending' && (
                                    <button
                                        onClick={() => handleVerifyDoc(cvDoc.id, 'verified')}
                                        className="text-xs bg-[#338078] text-white px-3 py-1 rounded-lg font-bold hover:bg-[#2a6a63] transition-colors"
                                    >
                                        Verify CV
                                    </button>
                                )}
                            </div>
                            {cvDoc ? (
                                <div className="flex items-center gap-4">
                                    {cvDoc.file_name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 relative group">
                                            <img src={`/storage/${cvDoc.file_path}`} alt="CV Preview" className="w-full h-full object-cover" />
                                            <a href={`/storage/${cvDoc.file_path}`} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <Icon icon="solar:eye-linear" className="w-5 h-5" />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className={`p-2 rounded-lg ${getFileIcon(cvDoc.file_name).bg}`}>
                                            <Icon icon={getFileIcon(cvDoc.file_name).icon} className={`${getFileIcon(cvDoc.file_name).color} w-5 h-5`} />
                                        </div>
                                    )}
                                    <a href={`/storage/${cvDoc.file_path}`} target="_blank" className="text-[#338078] text-xs font-bold underline decoration-[#338078]/30">
                                        Download {cvDoc.file_name}
                                    </a>
                                    <button
                                        onClick={() => openUploadModal('cv')}
                                        className="text-gray-400 text-xs font-bold underline ml-2"
                                    >
                                        Replace
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => openUploadModal('cv')}
                                    className="text-[#338078] text-xs font-bold underline"
                                >
                                    Upload CV
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-6">
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <span className={['approved', 'active'].includes(teacher.status) ? 'cursor-not-allowed' : ''}>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={['approved', 'active'].includes(teacher.status)}
                                        className={`h-12 px-6 sm:px-10 rounded-xl font-bold text-white transition-all active:scale-[0.98] justify-center cursor-pointer w-full sm:w-auto ${['approved', 'active'].includes(teacher.status) ? 'bg-gray-200 text-gray-400 pointer-events-none' : 'bg-[#338078] hover:bg-[#2a6a63]'}`}
                                    >
                                        Approve
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {['approved', 'active'].includes(teacher.status) && (
                                <TooltipContent>
                                    <p>Teacher is already approved</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    <Button onClick={() => setIsSendMessageOpen(true)} variant="outline" className="h-12 px-6 sm:px-10 rounded-xl border-[#338078] text-[#338078] font-bold justify-center cursor-pointer">
                        Send Message
                    </Button>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            {!['approved', 'active', 'rejected'].includes(teacher.status) && (
                                <TooltipTrigger asChild>
                                    <span className={teacher.status === 'rejected' ? 'cursor-not-allowed' : ''}>
                                        <button
                                            onClick={handleReject}
                                            disabled={teacher.status === 'rejected'}
                                            className={`font-bold text-sm px-4 cursor-pointer ${teacher.status === 'rejected' ? 'text-gray-300 pointer-events-none' : 'text-[#101928]'}`}
                                        >
                                            Reject
                                        </button>
                                    </span>
                                </TooltipTrigger>
                            )}
                            {teacher.status === 'rejected' && (
                                <TooltipContent>
                                    <p>Application is already rejected</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    {/* Suspend Button - Only for approved staff */}
                    {['approved', 'active', 'suspended'].includes(teacher.status) && (
                        <button
                            onClick={() => setIsSuspendModalOpen(true)}
                            className="text-orange-600 font-bold text-sm px-4 cursor-pointer hover:bg-orange-50 rounded-lg py-2 transition-colors"
                        >
                            {teacher.status === 'suspended' ? 'Manage Suspension' : 'Suspend Account'}
                        </button>
                    )}

                    <button onClick={handleDelete} className="text-red-500 font-bold text-sm px-4 cursor-pointer hover:bg-red-50 rounded-lg py-2 transition-colors">Delete Account</button>
                </div>
            </div>

            <ScheduleCallModal
                isOpen={isScheduleCallOpen}
                onClose={() => setIsScheduleCallOpen(false)}
                teacher={teacher}
            />

            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                teacherId={teacher.id}
                type={uploadType}
                uploadUrl={`/admin/verifications/${teacher.id}/documents/upload`}
            />

            <SendMessageModal
                isOpen={isSendMessageOpen}
                onClose={() => setIsSendMessageOpen(false)}
                teacher={teacher}
            />

            <RejectVerificationModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                teacherId={teacher.id}
            />

            <TeacherSuspensionModal
                isOpen={isSuspendModalOpen}
                onClose={() => setIsSuspendModalOpen(false)}
                teacher={teacher}
            />

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                teacherId={teacher.id}
                teacherName={teacher.user.name}
                deleteUrl={`/admin/verifications/${teacher.id}`}
            />

            <ApproveVerificationModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                teacherId={teacher.id}
                teacherName={teacher.user.name}
                verificationChecklist={verificationChecklist}
                hasIncompleteVerifications={hasIncompleteVerifications}
            />
        </AdminLayout>
    );
}
