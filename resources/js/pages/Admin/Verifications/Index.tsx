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
import TableLoader from '@/components/TableLoader';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ScheduleCallModal from './components/ScheduleCallModal';

interface VerificationRequest {
    id: number;
    status: string;
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
    };
}

export default function VerificationIndex({ requests, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');
    const [filterDate, setFilterDate] = useState(filters.date || '');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modal states
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<VerificationRequest | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search, status: filterStatus, date: filterDate });
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

                            <div className="relative min-w-[180px]">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm focus:ring-[#338078] focus:border-[#338078] appearance-none cursor-pointer"
                                >
                                    <option value="all">Select Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="live_video">Live Video</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
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
                                                    <div className="flex items-center gap-2">
                                                        <Icon icon="solar:hourglass-bold" className="text-orange-400 w-4 h-4" />
                                                        <span className="text-sm font-bold text-orange-400 capitalize">{request.status}</span>
                                                    </div>
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
                                                                onSelect={() => router.visit(`/admin/verifications/${request.id}`)}
                                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#338078]/5 transition-colors"
                                                            >
                                                                <span>Verify</span>
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

                                                            <DropdownMenuItem
                                                                className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <span>Reject</span>
                                                                <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-500" />
                                                            </DropdownMenuItem>
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
        </AdminLayout>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
