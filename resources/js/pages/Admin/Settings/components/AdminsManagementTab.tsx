import { useState } from 'react';
import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import RoleManagementModal from './RoleManagementModal';
import AdminStaffModal from './AdminStaffModal';
import ViewAdminModal from './ViewAdminModal';

interface Props {
    roles: any[];
    admins: any[];
    availablePermissions: any;
}

export default function AdminsManagementTab({ roles, admins, availablePermissions }: Props) {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [editingAdmin, setEditingAdmin] = useState<any>(null);
    const [viewingAdmin, setViewingAdmin] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);

    const openRoleModal = (role?: any) => {
        setEditingRole(role || null);
        setIsRoleModalOpen(true);
    };

    const openAdminModal = (admin?: any) => {
        setEditingAdmin(admin || null);
        setIsAdminModalOpen(true);
    };

    const openViewModal = (admin: any) => {
        setViewingAdmin(admin);
        setIsViewModalOpen(true);
    };

    const handleSearch = () => {
        // Filter is applied client-side for now
        toast.info('Search applied');
    };

    const toggleAdminSelection = (adminId: number) => {
        setSelectedAdmins(prev =>
            prev.includes(adminId)
                ? prev.filter(id => id !== adminId)
                : [...prev, adminId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedAdmins.length === filteredAdmins.length) {
            setSelectedAdmins([]);
        } else {
            setSelectedAdmins(filteredAdmins.map(a => a.id));
        }
    };

    const handleDeactivate = (admin: any) => {
        if (confirm(`Are you sure you want to suspend ${admin.name}?`)) {
            router.patch(`/admin/settings/admins/${admin.id}/status`, {}, {
                onSuccess: () => toast.success('Admin suspended successfully'),
                onError: () => toast.error('Failed to suspend admin'),
            });
        }
    };

    const handleReactivate = (admin: any) => {
        if (confirm(`Are you sure you want to reactivate ${admin.name}?`)) {
            router.patch(`/admin/settings/admins/${admin.id}/status`, {}, {
                onSuccess: () => toast.success('Admin reactivated successfully'),
                onError: () => toast.error('Failed to reactivate admin'),
            });
        }
    };

    const handleRemove = (admin: any) => {
        if (confirm(`Are you sure you want to remove ${admin.name}?`)) {
            router.delete(`/admin/settings/admins/${admin.id}`, {
                onSuccess: () => toast.success('Admin removed successfully'),
                onError: () => toast.error('Failed to remove admin'),
            });
        }
    };

    // Filter admins based on search and status
    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = searchQuery === '' ||
            admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && admin.status !== 'suspended') ||
            (statusFilter === 'suspended' && admin.status === 'suspended');

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-12 pb-20">
            {/* Admin Role List Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-[24px] font-semibold text-[#101928]">Admin Role List</h3>
                    <button
                        onClick={() => openAdminModal()}
                        className="flex items-center gap-2 bg-[#338078] text-white px-6 py-3 rounded-[8px] font-medium hover:bg-[#2a6b64] transition-all text-sm"
                    >
                        Add New Admin
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-[400px]">
                        <Icon icon="ph:magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Name/Email"
                            className="w-full h-[48px] pl-12 pr-4 rounded-[30px] border border-gray-200 bg-white focus:ring-1 focus:ring-[#338078] outline-none text-sm"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] h-[48px] rounded-[8px] border-gray-200">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                    <button
                        onClick={handleSearch}
                        className="h-[48px] px-6 rounded-[8px] border border-[#338078] text-[#338078] font-medium hover:bg-[#338078]/5 transition-all text-sm"
                    >
                        Search
                    </button>
                </div>

                {/* Admin Table */}
                <div className="bg-white rounded-[16px] border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={selectedAdmins.length === filteredAdmins.length && filteredAdmins.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="border-gray-300"
                                    />
                                </TableHead>
                                <TableHead className="py-4">Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAdmins.map((admin) => (
                                <TableRow key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="py-4">
                                        <Checkbox
                                            checked={selectedAdmins.includes(admin.id)}
                                            onCheckedChange={() => toggleAdminSelection(admin.id)}
                                            className="border-gray-300"
                                        />
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#338078]/10 text-[#338078] flex items-center justify-center font-bold text-xs overflow-hidden">
                                                {admin.avatar ? (
                                                    <img src={`/storage/${admin.avatar}`} alt={admin.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    admin.name.charAt(0)
                                                )}
                                            </div>
                                            <span className="font-medium text-[#101928]">{admin.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[#667085]">
                                        {admin.role_detail?.name || 'Super Admin'}
                                    </TableCell>
                                    <TableCell className="text-[#667085]">{admin.email}</TableCell>
                                    <TableCell>
                                        {admin.status === 'suspended' ? (
                                            <div className="flex items-center gap-2">
                                                <Icon icon="ph:prohibit-fill" className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-medium text-red-600">Suspended</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Icon icon="ph:check-circle-fill" className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-medium text-green-700">Active</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-[#667085]">
                                                    <Icon icon="ph:dots-three-vertical-bold" className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px]">
                                                <DropdownMenuItem onClick={() => openViewModal(admin)} className="gap-3 cursor-pointer">
                                                    <Icon icon="ph:eye" className="w-4 h-4" />
                                                    <span>View</span>
                                                </DropdownMenuItem>
                                                {admin.status === 'suspended' ? (
                                                    <DropdownMenuItem onClick={() => handleReactivate(admin)} className="gap-3 cursor-pointer">
                                                        <Icon icon="ph:arrow-counter-clockwise" className="w-4 h-4" />
                                                        <span>Reactivate</span>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleDeactivate(admin)} className="gap-3 cursor-pointer">
                                                        <Icon icon="ph:file-x" className="w-4 h-4" />
                                                        <span>Deactivate</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => openAdminModal(admin)} className="gap-3 cursor-pointer">
                                                    <Icon icon="ph:pencil-simple" className="w-4 h-4" />
                                                    <span>Edit Role</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRemove(admin)} className="gap-3 cursor-pointer text-red-600 focus:text-red-600">
                                                    <Icon icon="ph:trash" className="w-4 h-4" />
                                                    <span>Remove</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredAdmins.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                                        No admins found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Administrative Roles Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#101928]">Administrative Roles</h3>
                        <p className="text-sm text-[#667085]">Define what each staff member can see and do.</p>
                    </div>
                    <button
                        onClick={() => openRoleModal()}
                        className="flex items-center gap-2 bg-[#338078] text-white px-6 py-2 rounded-[30px] font-medium hover:bg-[#2a6b64] transition-all text-sm"
                    >
                        <Icon icon="ph:plus-bold" className="w-4 h-4" />
                        Create New Role
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <div key={role.id} className="bg-white p-6 border border-gray-100 rounded-[16px] hover:border-[#338078]/50 transition-all group overflow-hidden relative">
                            {role.is_system && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-[#338078]/10 text-[#338078] text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                                        System Role
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col h-full space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#338078]">
                                        <Icon icon={role.slug === 'super-admin' ? 'ph:shield-star-fill' : 'ph:user-gear-light'} className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openRoleModal(role)}
                                            className="p-2 hover:bg-gray-50 rounded-full text-[#667085] transition-colors"
                                        >
                                            <Icon icon="ph:pencil-simple-light" className="w-5 h-5" />
                                        </button>
                                        {!role.is_system && (
                                            <button className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors">
                                                <Icon icon="ph:trash-light" className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[16px] font-bold text-[#101928]">{role.name}</h4>
                                    <p className="text-xs text-[#667085] mt-1">{role.users_count} Admins Assigned</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions?.slice(0, 3).map((p: string) => (
                                        <span key={p} className="bg-gray-50 text-[10px] font-medium text-gray-500 px-2 py-1 rounded">
                                            {p.split('.')[0]}
                                        </span>
                                    ))}
                                    {role.permissions?.length > 3 && (
                                        <span className="bg-gray-50 text-[10px] font-medium text-gray-500 px-2 py-1 rounded">
                                            +{role.permissions.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modals */}
            <RoleManagementModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                role={editingRole}
                availablePermissions={availablePermissions}
            />
            <AdminStaffModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                admin={editingAdmin}
                roles={roles}
                availablePermissions={availablePermissions}
            />
            <ViewAdminModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                admin={viewingAdmin}
                roles={roles}
            />
        </div>
    );
}
