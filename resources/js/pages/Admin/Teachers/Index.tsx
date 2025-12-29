import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import TeacherStatusBadge from '@/components/Teachers/TeacherStatusBadge';
import TeacherApprovalModal from '@/components/Teachers/TeacherApprovalModal';
import TeacherRejectionModal from '@/components/Teachers/TeacherRejectionModal';
import TeacherSuspensionModal from '@/components/Teachers/TeacherSuspensionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Combobox } from "@/components/ui/combobox";
import TableLoader from '@/components/TableLoader';

interface Teacher {
    id: number;
    status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
    country: string;
    city: string;
    experience_years: number;
    hourly_rate: number;
    created_at: string;
    rating?: number;
    classes_held?: number;
    suspension_reason?: string;
    rejection_reason?: string;
    has_required_docs_verified?: boolean;
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
    subjects?: Array<{
        id: number;
        name: string;
    }>;
}

interface FilterOption {
    value: string;
    label: string;
}

interface SubjectOption {
    id: number;
    name: string;
}

interface Props {
    teachers: {
        data: Teacher[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: {
        all: number;
        active: number;
        pending: number;
        suspended: number;
        rejected: number;
    };
    filters: {
        status?: string;
        search?: string;
        country?: string;
        subject?: string;
        rating?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    filter_options: {
        subjects: SubjectOption[];
        statuses: FilterOption[];
        ratings: FilterOption[];
    };
}

export default function TeachersIndex({ teachers, stats, filters, filter_options }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Filter States
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');
    const [filterRating, setFilterRating] = useState(filters.rating || 'all');
    const [filterSubject, setFilterSubject] = useState(filters.subject || 'all');

    const [isTableLoading, setIsTableLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Updating...');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const applyFilters = (newFilters: any) => {
        // Determine loading message based on action
        if (newFilters.search !== undefined) setLoadingMessage('Searching teachers...');
        else if (newFilters.status) setLoadingMessage('Filtering by status...');
        else if (newFilters.subject) setLoadingMessage('Filtering by subject...');
        else if (newFilters.rating) setLoadingMessage('Filtering by rating...');
        else if (Object.keys(newFilters).length === 0) setLoadingMessage('Refreshing data...');
        else setLoadingMessage('Updating results...');

        setIsTableLoading(true);
        router.get('/admin/teachers', {
            ...filters,
            status: filterStatus === 'all' ? undefined : filterStatus,
            rating: filterRating === 'all' ? undefined : filterRating,
            subject: filterSubject === 'all' ? undefined : filterSubject,
            ...newFilters,
        }, {
            preserveState: true,
            onFinish: () => setIsTableLoading(false)
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === teachers.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(teachers.data.map(t => t.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const openApprovalModal = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setApprovalModalOpen(true);
    };

    const openRejectionModal = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setRejectionModalOpen(true);
    };

    const openSuspensionModal = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setSuspensionModalOpen(true);
    };

    const handleActivate = (teacher: Teacher) => {
        if (confirm(`Are you sure you want to activate ${teacher.user.name}?`)) {
            router.post(`/admin/teachers/${teacher.id}/status`, {
                status: 'approved',
            });
        }
    };

    // Helper to get label for current selection
    const getStatusLabel = () => {
        if (filterStatus === 'all') return 'Select Status';
        return filter_options.statuses.find(s => s.value === filterStatus)?.label || 'Select Status';
    };

    const getSubjectLabel = () => {
        if (filterSubject === 'all') return 'Select Subject';
        return filter_options.subjects.find(s => String(s.id) === filterSubject)?.name || 'Select Subject';
    };

    const getRatingLabel = () => {
        if (filterRating === 'all') return 'Rating';
        return filter_options.ratings.find(r => r.value === filterRating)?.label || 'Rating';
    };

    return (
        <>
            <Head title="Teacher Management" />

            <div className="w-full">
                {/* Breadcrumb with Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex items-center gap-2 md:gap-3.5 overflow-x-auto">
                        <Link
                            href="/admin/dashboard"
                            className="text-gray-500 text-[16px] md:text-[20px] font-light font-['Nunito'] hover:text-gray-700 transition-colors whitespace-nowrap"
                        >
                            Dashboard
                        </Link>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-400 flex-shrink-0" />
                        <span className="text-[#141522] text-[16px] md:text-[20px] font-semibold font-['Nunito'] whitespace-nowrap">
                            Teacher Management
                        </span>
                    </div>
                    <Link
                        href="/admin/teachers/create"
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-[#338078] hover:bg-[#2a6a63] text-white rounded-xl font-['Nunito'] font-medium text-sm md:text-base transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Icon icon="mdi:plus" className="w-5 h-5" />
                        Create New Teacher
                    </Link>
                </div>

                {/* Search and Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6 md:mb-8">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full lg:flex-1 lg:max-w-[400px]">
                        <div className="relative">
                            <Icon
                                icon="basil:search-solid"
                                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            />
                            <Input
                                type="text"
                                placeholder="Search by Name / Email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 md:pl-14 pr-4 md:pr-6 py-5 md:py-6 rounded-full border border-gray-200 bg-white text-[14px] font-['Nunito'] shadow-sm placeholder:text-gray-400 w-full"
                            />
                        </div>
                    </form>

                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between pl-4 md:pl-6 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-white text-[13px] md:text-[14px] text-gray-600 font-['Nunito'] min-w-[140px] md:min-w-[160px] hover:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent">
                                    <span className="truncate">{getStatusLabel()}</span>
                                    <Icon icon="tabler:chevron-down" className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] bg-white">
                                <DropdownMenuItem
                                    onSelect={() => { setFilterStatus('all'); applyFilters({ status: 'all' }); }}
                                    className="cursor-pointer font-['Nunito']"
                                >
                                    All Statuses
                                </DropdownMenuItem>
                                {filter_options.statuses.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onSelect={() => { setFilterStatus(option.value); applyFilters({ status: option.value }); }}
                                        className="cursor-pointer font-['Nunito']"
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Subject Filter (Combobox) */}
                        <Combobox
                            options={[
                                { value: 'all', label: 'All Subjects' },
                                ...filter_options.subjects.map(s => ({ value: String(s.id), label: s.name }))
                            ]}
                            value={filterSubject}
                            onChange={(value) => {
                                const newValue = value || 'all';
                                setFilterSubject(newValue);
                                applyFilters({ subject: newValue });
                            }}
                            placeholder="Select Subject"
                            searchPlaceholder="Search subject..."
                            className="w-[140px] sm:w-[180px] lg:w-[200px] rounded-xl border-gray-200 bg-white text-[13px] md:text-[14px] text-gray-600 font-['Nunito'] hover:bg-gray-50 h-[42px] md:h-[46px]"
                        />

                        {/* Rating Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between pl-4 md:pl-6 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-white text-[13px] md:text-[14px] text-gray-600 font-['Nunito'] min-w-[100px] sm:min-w-[120px] md:min-w-[140px] hover:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent">
                                    <span className="truncate">{getRatingLabel()}</span>
                                    <Icon icon="tabler:chevron-down" className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[140px] bg-white">
                                <DropdownMenuItem
                                    onSelect={() => { setFilterRating('all'); applyFilters({ rating: 'all' }); }}
                                    className="cursor-pointer font-['Nunito']"
                                >
                                    All Ratings
                                </DropdownMenuItem>
                                {filter_options.ratings.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onSelect={() => { setFilterRating(option.value); applyFilters({ rating: option.value }); }}
                                        className="cursor-pointer font-['Nunito']"
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Search Button */}
                        <button
                            onClick={() => applyFilters({})}
                            className="px-6 md:px-8 py-2.5 md:py-3 rounded-full border border-[#338078] text-[#338078] text-[13px] md:text-[14px] font-medium font-['Nunito'] hover:bg-[#338078] hover:text-white transition-colors whitespace-nowrap"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Teachers Table */}
                <div className="bg-white rounded-none overflow-hidden relative min-h-[400px]">
                    {isTableLoading && <TableLoader message={loadingMessage} />}

                    {/* Table wrapper with horizontal scroll */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-[#F9FAFB]">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4 w-[40px] md:w-[50px]">
                                        <Checkbox
                                            checked={teachers.data.length > 0 && selectedIds.length === teachers.data.length}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                        />
                                    </th>
                                    <th className="text-left px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                        Profile
                                    </th>
                                    <th className="text-left px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                        Name
                                    </th>
                                    <th className="text-left px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito'] hidden sm:table-cell">
                                        Email
                                    </th>
                                    <th className="text-left px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito'] hidden md:table-cell">
                                        Subject(s)
                                    </th>
                                    <th className="text-left px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                        Rating
                                    </th>
                                    <th className="text-center px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito'] hidden sm:table-cell">
                                        Classes
                                    </th>
                                    <th className="text-left px-3 md:px-4 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                        Status
                                    </th>
                                    <th className="text-right px-4 md:px-6 py-3 md:py-4 text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={isTableLoading ? 'opacity-50 transition-opacity duration-200' : 'transition-opacity duration-200'}>
                                {teachers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500 font-['Nunito'] text-sm md:text-base">
                                            No teachers found
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.data.map((teacher) => (
                                        <tr
                                            key={teacher.id}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                            onClick={() => router.visit(`/admin/teachers/${teacher.id}`)}
                                        >
                                            <td className="px-4 md:px-6 py-4 md:py-6" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(teacher.id)}
                                                    onCheckedChange={() => toggleSelect(teacher.id)}
                                                    className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                                />
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#338078] to-[#FFCC00] flex items-center justify-center text-white font-semibold text-xs md:text-sm font-['Nunito'] shadow-sm">
                                                    {teacher.user.avatar ? (
                                                        <img src={`/storage/${teacher.user.avatar}`} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        teacher.user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6">
                                                <span className="text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito'] line-clamp-1">
                                                    {teacher.user.name}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6 hidden sm:table-cell">
                                                <span className="text-[13px] md:text-[14px] text-gray-500 font-['Nunito'] line-clamp-1">
                                                    {teacher.user.email}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6 hidden md:table-cell">
                                                <span className="text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito'] line-clamp-1">
                                                    {teacher.subjects?.map(s => s.name).join(', ') || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6">
                                                <div className="flex items-center gap-1">
                                                    <Icon icon="solar:star-bold" className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FFCC00]" />
                                                    <span className="text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                                        {teacher.rating ? Number(teacher.rating).toFixed(1) : '0.0'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6 text-center hidden sm:table-cell">
                                                <span className="text-[13px] md:text-[14px] font-bold text-[#101928] font-['Nunito']">
                                                    {teacher.classes_held || 0}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-4 md:py-6">
                                                <TeacherStatusBadge
                                                    status={teacher.status}
                                                    tooltipContent={
                                                        teacher.status === 'suspended' && teacher.suspension_reason
                                                            ? `Suspended: ${teacher.suspension_reason}`
                                                            : teacher.status === 'rejected' && teacher.rejection_reason
                                                                ? `Rejected: ${teacher.rejection_reason}`
                                                                : undefined
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 md:px-6 py-4 md:py-6" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent">
                                                            <Icon icon="tabler:dots-vertical" className="w-4 h-4 md:w-5 md:h-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[200px] bg-white p-2 rounded-xl shadow-lg border border-gray-100">
                                                        {teacher.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onSelect={() => router.visit(`/admin/verifications/${teacher.id}`)}
                                                                    className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#338078] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1 border border-[#338078]/20"
                                                                >
                                                                    <span className="font-bold">Process Verification</span>
                                                                    <Icon icon="solar:verified-check-bold" className="w-5 h-5" />
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onSelect={() => {
                                                                        // Guardrail: if docs not verified, redirect or show warning
                                                                        if (!teacher.has_required_docs_verified) {
                                                                            if (confirm('Teacher has not completed document verification. Would you like to process verification first?')) {
                                                                                router.visit(`/admin/verifications/${teacher.id}`);
                                                                                return;
                                                                            }
                                                                        }
                                                                        openApprovalModal(teacher);
                                                                    }}
                                                                    className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                                >
                                                                    <span>Approve Teacher</span>
                                                                    <Icon icon="mdi:approve" className="w-5 h-5 text-green-600" />
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        <DropdownMenuItem
                                                            onSelect={() => router.visit(`/admin/teachers/${teacher.id}/edit`)}
                                                            className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                        >
                                                            <span>Edit Profile</span>
                                                            <Icon icon="solar:pen-new-square-linear" className="w-5 h-5 hover:text-gray-50" />
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onSelect={() => router.visit(`/admin/teachers/${teacher.id}`)}
                                                            className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                        >
                                                            <span>View Profile</span>
                                                            <Icon icon="solar:eye-linear" className="w-5 h-5 hover:text-gray-50" />
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onSelect={() => router.visit(`/admin/teachers/${teacher.id}/analytics`)}
                                                            className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                        >
                                                            <span>View Performance</span>
                                                            <Icon icon="solar:chart-square-linear" className="w-5 h-5 hover:text-gray-50" />
                                                        </DropdownMenuItem>

                                                        {teacher.status === 'pending' && (
                                                            <DropdownMenuItem
                                                                onSelect={() => openRejectionModal(teacher)}
                                                                className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50"
                                                            >
                                                                <span>Reject</span>
                                                                <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-red-600" />
                                                            </DropdownMenuItem>
                                                        )}

                                                        {(teacher.status === 'approved' || teacher.status === 'active') && (
                                                            <DropdownMenuItem
                                                                onSelect={() => openSuspensionModal(teacher)}
                                                                className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50"
                                                            >
                                                                <span>Suspend</span>
                                                                <Icon icon="solar:forbidden-circle-linear" className="w-5 h-5 text-orange-600" />
                                                            </DropdownMenuItem>
                                                        )}

                                                        {teacher.status === 'suspended' && (
                                                            <DropdownMenuItem
                                                                onSelect={() => handleActivate(teacher)}
                                                                className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50"
                                                            >
                                                                <span>Activate</span>
                                                                <Icon icon="solar:restart-circle-linear" className="w-5 h-5 text-[#338078]" />
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {teachers.last_page > 1 && (
                        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white gap-3">
                            <p className="text-xs md:text-sm text-gray-500 font-['Nunito']">
                                Showing <span className="font-bold text-[#101928]">{teachers.data.length}</span> of <span className="font-bold text-[#101928]">{stats.all}</span> teachers
                            </p>
                            <div className="flex items-center gap-1.5 md:gap-2">
                                {teachers.links.map((link, index) => {
                                    const isFirst = index === 0;
                                    const isLast = index === teachers.links.length - 1;
                                    const isPrevNext = isFirst || isLast;

                                    if (!link.url && isPrevNext) {
                                        return (
                                            <span
                                                key={index}
                                                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-gray-300 cursor-not-allowed"
                                            >
                                                <Icon icon={isFirst ? 'mdi:chevron-left' : 'mdi:chevron-right'} className="w-5 h-5" />
                                            </span>
                                        );
                                    }

                                    if (!link.url) return null;

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-sm font-['Nunito'] transition-colors ${link.active
                                                ? 'bg-[#338078] text-white font-bold'
                                                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            {isPrevNext ? (
                                                <Icon icon={isFirst ? 'mdi:chevron-left' : 'mdi:chevron-right'} className="w-5 h-5" />
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div >

            {/* Modals */}
            {
                selectedTeacher && (
                    <>
                        <TeacherApprovalModal
                            isOpen={approvalModalOpen}
                            onClose={() => {
                                setApprovalModalOpen(false);
                                setSelectedTeacher(null);
                            }}
                            teacher={selectedTeacher}
                        />
                        <TeacherRejectionModal
                            isOpen={rejectionModalOpen}
                            onClose={() => {
                                setRejectionModalOpen(false);
                                setSelectedTeacher(null);
                            }}
                            teacher={selectedTeacher}
                        />
                        <TeacherSuspensionModal
                            isOpen={suspensionModalOpen}
                            onClose={() => {
                                setSuspensionModalOpen(false);
                                setSelectedTeacher(null);
                            }}
                            teacher={selectedTeacher}
                        />
                    </>
                )
            }
        </>
    );
}

TeachersIndex.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
