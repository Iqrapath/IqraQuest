import { useState, useEffect, useCallback, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StudentRejectionModal from '@/components/Students/modals/StudentRejectionModal';
import StudentSuspensionModal from '@/components/Students/modals/StudentSuspensionModal';
import StudentContactEditModal from '@/components/Students/modals/StudentContactEditModal';
import StudentLearningPreferencesEditModal from '@/components/Students/modals/StudentLearningPreferencesEditModal';
import TableLoader from '@/components/TableLoader';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    joined_at: string;
    avatar: string | null;
    avatar_url: string | null;
    role: string;
    status: string;
    student_id: number | null;
    profile?: any;
}

interface PageProps {
    [key: string]: unknown;
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        role?: string;
        subject?: string;
    };
    subjects: string[];
}


function StudentsIndex() {
    const { users, filters, subjects } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);

    // Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [prefsModalOpen, setPrefsModalOpen] = useState(false);

    // Debounce timer ref
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const applyFilters = useCallback((searchTerm: string, status: string, role: string, subject: string) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            setIsTableLoading(true);
            router.get('/admin/students', {
                search: searchTerm || undefined,
                status: status !== 'all' ? status : undefined,
                // role: role !== 'all' ? role : undefined, 
                subject: subject !== 'all' ? subject : undefined,
            }, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsTableLoading(false),
            });
        }, 300);
    }, []);

    useEffect(() => {
        if (
            search !== (filters.search || '') ||
            statusFilter !== (filters.status || 'all') ||
            subjectFilter !== (filters.subject || 'all')
        ) {
            applyFilters(search, statusFilter, roleFilter, subjectFilter);
        }
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [search, statusFilter, roleFilter, subjectFilter]);

    const toggleSelectAll = () => {
        if (selectedIds.length === users.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.data.map(u => u.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleApprove = (user: User) => {
        setIsTableLoading(true);
        router.patch(`/admin/students/${user.id}/status`, { status: 'active' }, {
            onSuccess: () => toast.success(`${user.name}'s account approved.`),
            onFinish: () => setIsTableLoading(false),
        });
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-500';
            case 'pending': return 'text-orange-500';
            case 'suspended': return 'text-red-500';
            case 'rejected': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    return (
        <>
            <Head title="Student Management" />

            <div className="">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 font-['Nunito']">
                            <span>Dashboard</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[#101928] font-bold">Student Management</span>
                        </div>
                    </div>
                    <Link
                        href="/admin/students/create"
                        className="bg-[#338078] hover:bg-[#2a6a63] text-white font-bold px-6 py-2.5 rounded-xl transition-colors font-['Nunito'] text-sm"
                    >
                        Add New Student
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 mb-8">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full xl:w-auto min-w-[300px]">
                        <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Name / Email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-full font-['Nunito'] text-sm focus:ring-1 focus:ring-[#338078] focus:border-[#338078] outline-none bg-white"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        {/* Status Filter */}
                        <div className="relative">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px] bg-white border border-gray-200 rounded-lg font-['Nunito'] text-sm text-gray-600 focus:ring-1 focus:ring-[#338078] outline-none h-auto py-2.5">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">Select Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject Filter - Combobox */}
                        <div className="relative">
                            <Combobox
                                options={(subjects || []).map(s => ({ value: s, label: s }))}
                                value={subjectFilter === 'all' ? '' : subjectFilter}
                                onChange={(val) => setSubjectFilter(val || 'all')}
                                placeholder="Select Subject"
                                className="w-[200px] bg-white border border-gray-200 rounded-lg font-['Nunito'] text-sm text-gray-600 h-auto py-2.5 justify-between"
                            />
                        </div>

                        {/* Rating Filter (Visual Only) */}
                        <div className="relative">
                            <button className="flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-200 rounded-lg font-['Nunito'] text-sm text-gray-400 bg-white min-w-[100px] cursor-not-allowed">
                                <span>Rating</span>
                                <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                            </button>
                        </div>

                        <button className="px-6 py-2.5 border border-[#338078] text-[#338078] rounded-full font-['Nunito'] text-sm font-bold hover:bg-[#338078] hover:text-white transition-colors">
                            Search
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/50 rounded-xl overflow-hidden relative min-h-[400px]">
                    {isTableLoading && <TableLoader message="Loading users..." />}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-[#F2F4F7]">
                                <tr>
                                    <th className="px-6 py-4 w-[50px]">
                                        <Checkbox
                                            checked={users.data.length > 0 && selectedIds.length === users.data.length}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                        />
                                    </th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-[#101928] uppercase tracking-wider font-['Nunito']">Profile</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-[#101928] uppercase tracking-wider font-['Nunito']">Name</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-[#101928] uppercase tracking-wider font-['Nunito']">Email</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-[#101928] uppercase tracking-wider font-['Nunito']">Role</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-[#101928] uppercase tracking-wider font-['Nunito']">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-[#101928] uppercase tracking-wider font-['Nunito']">Actions</th>
                                    {/* Action Header empty in Figma usually */}
                                </tr>
                            </thead>
                            <tbody className={isTableLoading ? 'opacity-50' : ''}>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-['Nunito']">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedIds.includes(user.id)}
                                                    onCheckedChange={() => toggleSelect(user.id)}
                                                    className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#338078] text-white font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-[#101928] font-['Nunito']">
                                                    {user.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500 font-['Nunito']">
                                                    {user.email}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-[#101928] font-['Nunito']">
                                                    {user.role === 'guardian' ? 'Parent' : 'Student'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-bold font-['Nunito'] capitalize ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors outline-none cursor-pointer">
                                                            <Icon icon="tabler:dots-vertical" className="w-5 h-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[220px] bg-white p-2 rounded-xl shadow-lg border border-gray-100 z-50">
                                                        {/* Approve */}
                                                        {user.status === 'pending' && (
                                                            <DropdownMenuItem
                                                                onSelect={() => handleApprove(user)}
                                                                className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                            >
                                                                <span>Approve</span>
                                                                <Icon icon="solar:verified-check-bold" className="w-5 h-5 text-green-500" />
                                                            </DropdownMenuItem>
                                                        )}

                                                        {/* Edit Contact Info */}
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setSelectedUser(user);
                                                                setContactModalOpen(true);
                                                            }}
                                                            className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1 group"
                                                        >
                                                            <span>Edit Contact Info</span>
                                                            <div className="p-1 rounded bg-transparent group-hover:bg-transparent">
                                                                <Icon icon="solar:pen-new-square-linear" className="w-5 h-5 text-base" />
                                                            </div>
                                                        </DropdownMenuItem>

                                                        {/* View Full Profile */}
                                                        <DropdownMenuItem
                                                            onSelect={() => router.visit(`/admin/students/${user.id}`)}
                                                            className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                        >
                                                            <span>View Full Profile</span>
                                                            <Icon icon="solar:eye-linear" className="w-5 h-5 text-base" />
                                                        </DropdownMenuItem>

                                                        {/* Edit Preferences */}
                                                        {user.role === 'student' && (
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedUser(user);
                                                                    setPrefsModalOpen(true);
                                                                }}
                                                                className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50 mb-1"
                                                            >
                                                                <span>Edit Preferences</span>
                                                                <Icon icon="solar:eye-linear" className="w-5 h-5 text-base" />
                                                            </DropdownMenuItem>
                                                        )}

                                                        {/* Suspend/Reject */}
                                                        {(user.status === 'active' || user.status === 'approved') && (
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedUser(user);
                                                                    setSuspensionModalOpen(true);
                                                                }}
                                                                className="flex items-center justify-between cursor-pointer font-['Nunito'] text-[#101928] px-3 py-2.5 rounded-lg hover:bg-gray-50"
                                                            >
                                                                <span>Suspend</span>
                                                                <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-red-500" />
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
                    {users.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                            <p className="text-sm text-gray-500 font-['Nunito']">
                                Showing <span className="font-bold text-[#101928]">{users.data.length}</span> of <span className="font-bold text-[#101928]">{users.total}</span> users
                            </p>
                            <div className="flex items-center gap-2">
                                {users.links.map((link, index) => {
                                    if (!link.url) return null;
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-['Nunito'] transition-colors ${link.active
                                                ? 'bg-[#338078] text-white font-bold'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedUser && (
                <>
                    <StudentRejectionModal
                        isOpen={rejectionModalOpen}
                        onClose={() => {
                            setRejectionModalOpen(false);
                            setSelectedUser(null);
                        }}
                        student={{
                            id: selectedUser.id,
                            user: { id: selectedUser.id, name: selectedUser.name }
                        }}
                    />
                    <StudentSuspensionModal
                        isOpen={suspensionModalOpen}
                        onClose={() => {
                            setSuspensionModalOpen(false);
                            setSelectedUser(null);
                        }}
                        student={{
                            id: selectedUser.id,
                            user: { id: selectedUser.id, name: selectedUser.name },
                            status: selectedUser.status
                        }}
                    />
                    <StudentContactEditModal
                        isOpen={contactModalOpen}
                        onClose={() => setContactModalOpen(false)}
                        student={{
                            id: selectedUser.profile?.id || selectedUser.student_id,
                            user: {
                                id: selectedUser.id,
                                name: selectedUser.name,
                                email: selectedUser.email,
                                phone: selectedUser.phone || '',
                                role: selectedUser.role,
                            },
                            status: selectedUser.status,
                            city: selectedUser.profile?.city || '',
                            country: selectedUser.profile?.country || '',
                            joined_at: selectedUser.joined_at,
                        }}
                    />
                    <StudentLearningPreferencesEditModal
                        open={prefsModalOpen}
                        onOpenChange={setPrefsModalOpen}
                        student={{
                            id: selectedUser.profile?.id,
                            user: { name: selectedUser.name },
                            subjects: selectedUser.profile?.subjects || [],
                            availability_type: selectedUser.profile?.teaching_mode,
                            level: selectedUser.profile?.age_group,
                            notes: selectedUser.profile?.additional_notes,
                            preferred_hours: selectedUser.profile?.preferred_hours,
                            // Ensure properties match modal expectations
                        }}
                        availableSubjects={subjects}
                    />
                </>
            )}
        </>
    );
}

StudentsIndex.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;

export default StudentsIndex;
