import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TableLoader from '@/components/TableLoader';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ScheduleCallModal from './components/ScheduleCallModal';
import ApproveVerificationModal from './components/ApproveVerificationModal';
import RejectVerificationModal from './components/RejectVerificationModal';
import TeacherStatusBadge from '@/components/Teachers/TeacherStatusBadge';
import TeacherSuspensionModal from '@/components/Teachers/TeacherSuspensionModal';

interface VerificationRequest {
    id: number;
    status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected' | 'under_review';
    rejection_reason?: string;
    video_verification_status: 'not_scheduled' | 'scheduled' | 'completed' | 'failed';
    video_verification_scheduled_at: string | null;
    application_submitted_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    subjects: Array<{ id: number; name: string }>;
    certificates: Array<{
        id: number;
        certificate_type: string;
        verification_status: string;
    }>;
    verificationChecklist: {
        id_front: { label: string; uploaded: boolean; verified: boolean; status: string };
        id_back: { label: string; uploaded: boolean; verified: boolean; status: string };
        cv: { label: string; uploaded: boolean; verified: boolean; status: string };
        video_verification: { label: string; completed: boolean; status: string };
        certificates: { label: string; total: number; verified: number };
    };
    hasIncompleteVerifications: boolean;
}

interface Props {
    requests: {
        data: VerificationRequest[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        status?: string;
        date?: string;
        application_status?: string;
    };
}

export default function VerificationIndex({ requests, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all'); // Video Verification Status
    const [applicationStatus, setApplicationStatus] = useState(filters.application_status || 'pending');
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modal states
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<VerificationRequest | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search, status: filterStatus, date: filterDate, application_status: applicationStatus });
    };

    const applyFilters = (newFilters: any) => {
        setIsLoading(true);
        router.get('/admin/verifications', newFilters, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === requests.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(requests.data.map(r => r.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleScheduleCall = (request: VerificationRequest) => {
        setSelectedTeacher(request);
        setIsScheduleModalOpen(true);
    };

    const handleCopyUrl = (id: number) => {
        const url = `${window.location.origin}/admin/verifications/${id}/room`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Room URL copied to clipboard');
        });
    };

    const handleApproveAction = (request: VerificationRequest) => {
        setSelectedTeacher(request);
        setIsApproveModalOpen(true);
    };

    const handleRejectAction = (request: VerificationRequest) => {
        setSelectedTeacher(request);
        setIsRejectModalOpen(true);
    };

    const handleSuspendAction = (request: VerificationRequest) => {
        setSelectedTeacher(request);
        setIsSuspendModalOpen(true);
    };

    const getIdFileCount = (request: VerificationRequest) => {
        return request.certificates.filter(c =>
            ['id_card_front', 'id_card_back'].includes(c.certificate_type)
        ).length;
    };

    const getCertFileCount = (request: VerificationRequest) => {
        return request.certificates.filter(c =>
            !['id_card_front', 'id_card_back'].includes(c.certificate_type)
        ).length;
    };

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title="Verification Requests" />

            <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
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

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-[#101928] font-['Nunito']">Verification Request Table</h2>

                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 flex-1">
                            <div className="relative flex-1 min-w-[280px] max-w-sm">
                                <Icon icon="uil:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Search by Name/Email"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 h-12 rounded-full border-gray-200 focus:ring-[#338078] focus:border-[#338078] bg-white"
                                />
                            </div>

                            <div className="min-w-[180px]">
                                <Select
                                    value={applicationStatus}
                                    onValueChange={(value) => setApplicationStatus(value)}
                                >
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200">
                                        <SelectValue placeholder="Application Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="min-w-[180px]">
                                <Select
                                    value={filterStatus}
                                    onValueChange={(value) => setFilterStatus(value)}
                                >
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200">
                                        <SelectValue placeholder="Video Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Video Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="live_video">Live Video</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative min-w-[180px]">
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="h-12 px-4 rounded-xl border-gray-200 focus:ring-[#338078] focus:border-[#338078] bg-white text-gray-600 text-sm"
                                />
                                <Icon icon="tabler:calendar" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none bg-white px-0.5" />
                            </div>

                            <Button
                                type="submit"
                                className="h-12 px-8 rounded-xl border border-[#338078] text-[#338078] bg-white hover:bg-[#338078]/5 font-semibold"
                            >
                                Search
                            </Button>
                        </form>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {isLoading && <TableLoader />}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="bg-[#f9fafb] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 w-12">
                                            <Checkbox
                                                checked={selectedIds.length === requests.data.length && requests.data.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                                className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                            />
                                        </th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Profile Photo</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Name</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Email</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">ID Verification</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Certificate</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Video Status</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Submitted On</th>
                                        <th className="px-4 py-5 text-sm font-bold text-[#344054]">Status</th>
                                        <th className="px-6 py-5 text-sm font-bold text-[#344054] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {requests.data.length > 0 ? (
                                        requests.data.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-6">
                                                    <Checkbox
                                                        checked={selectedIds.includes(request.id)}
                                                        onCheckedChange={() => toggleSelect(request.id)}
                                                        className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                                    />
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                        {request.user.avatar ? (
                                                            <img src={`/storage/${request.user.avatar}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#f3f4f6] flex items-center justify-center">
                                                                <Icon icon="solar:user-bold" className="text-gray-300 w-7 h-7" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <span className="text-sm font-bold text-[#101928]">{request.user.name}</span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <span className="text-sm text-gray-500">{request.user.email}</span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <span className="text-sm font-medium text-gray-700">{getIdFileCount(request)} Files</span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <span className="text-sm font-medium text-gray-700">{getCertFileCount(request)} Files</span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            icon={request.video_verification_status === 'scheduled' ? "solar:videocamera-record-bold" : "solar:videocamera-record-linear"}
                                                            className={cn("w-5 h-5", request.video_verification_status === 'scheduled' ? "text-blue-500" : "text-gray-400")}
                                                        />
                                                        <span className="text-sm text-gray-600 capitalize">
                                                            {request.video_verification_status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <span className="text-sm text-gray-600">
                                                        {request.application_submitted_at ? format(new Date(request.application_submitted_at), 'MMM d, yyyy') : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <TeacherStatusBadge
                                                        status={request.status}
                                                        tooltipContent={request.status === 'rejected' ? request.rejection_reason : undefined}
                                                    />
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                                                <Icon icon="tabler:dots-vertical" className="w-5 h-5" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] bg-white border border-gray-100">
                                                            <DropdownMenuItem
                                                                onSelect={() => handleApproveAction(request)}
                                                                disabled={request.status === 'approved' || request.status === 'active'}
                                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${['approved', 'active'].includes(request.status) ? 'opacity-50 cursor-not-allowed' : 'text-gray-700 hover:bg-[#338078]/5'}`}
                                                            >
                                                                <span>Approve</span>
                                                                <Icon icon="solar:verified-check-bold" className="w-5 h-5 text-green-500" />
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() => router.visit(`/admin/verifications/${request.id}`)}
                                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#338078]/5 transition-colors"
                                                            >
                                                                <span>View</span>
                                                                <Icon icon="solar:eye-bold" className="w-5 h-5 text-gray-400" />
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() => handleScheduleCall(request)}
                                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#338078]/5 transition-colors"
                                                            >
                                                                <span>Schedule Call</span>
                                                                <Icon icon="solar:plain-bold" className="w-5 h-5 text-[#338078]" />
                                                            </DropdownMenuItem>

                                                            {request.video_verification_status === 'scheduled' && (
                                                                <DropdownMenuItem
                                                                    onSelect={() => handleCopyUrl(request.id)}
                                                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#338078]/5 transition-colors"
                                                                >
                                                                    <span>Copy Url</span>
                                                                    <Icon icon="solar:copy-bold" className="w-5 h-5 text-gray-400" />
                                                                </DropdownMenuItem>
                                                            )}

                                                            {!['approved', 'active'].includes(request.status) ? (
                                                                <DropdownMenuItem
                                                                    onSelect={() => handleRejectAction(request)}
                                                                    disabled={request.status === 'rejected'}
                                                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${request.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                                                >
                                                                    <span>Reject</span>
                                                                    <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-500" />
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onSelect={() => handleSuspendAction(request)}
                                                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                                                                >
                                                                    <span>{request.status === 'suspended' ? 'Manage Suspension' : 'Suspend'}</span>
                                                                    <Icon icon="solar:forbidden-circle-bold" className="w-5 h-5 text-orange-500" />
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                        <Icon icon="solar:document-text-linear" className="text-gray-300 w-8 h-8" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium italic">No verification requests found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedTeacher && (
                <ScheduleCallModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => {
                        setIsScheduleModalOpen(false);
                        setSelectedTeacher(null);
                    }}
                    teacher={{
                        id: selectedTeacher.id,
                        user: {
                            name: selectedTeacher.user.name
                        },
                        video_verification_status: selectedTeacher.video_verification_status,
                        video_verification_scheduled_at: selectedTeacher.video_verification_scheduled_at
                    }}
                />
            )}
            {selectedTeacher && (
                <ApproveVerificationModal
                    isOpen={isApproveModalOpen}
                    onClose={() => {
                        setIsApproveModalOpen(false);
                        setSelectedTeacher(null);
                    }}
                    teacherId={selectedTeacher.id}
                    teacherName={selectedTeacher.user.name}
                    verificationChecklist={selectedTeacher.verificationChecklist}
                    hasIncompleteVerifications={selectedTeacher.hasIncompleteVerifications}
                />
            )}
            {selectedTeacher && (
                <RejectVerificationModal
                    isOpen={isRejectModalOpen}
                    onClose={() => {
                        setIsRejectModalOpen(false);
                        setSelectedTeacher(null);
                    }}
                    teacherId={selectedTeacher.id}
                />
            )}
            {selectedTeacher && (
                <TeacherSuspensionModal
                    isOpen={isSuspendModalOpen}
                    onClose={() => {
                        setIsSuspendModalOpen(false);
                        setSelectedTeacher(null);
                    }}
                    teacher={selectedTeacher}
                />
            )}
        </AdminLayout>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
