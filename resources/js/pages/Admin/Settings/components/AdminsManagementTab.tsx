import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import RoleManagementModal from './RoleManagementModal';
import AdminStaffModal from './AdminStaffModal';
// import DangerZone from './DangerZone'; // Moved to Close Account tab

interface Props {
    roles: any[];
    admins: any[];
    availablePermissions: any;
}

export default function AdminsManagementTab({ roles, admins, availablePermissions }: Props) {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [editingAdmin, setEditingAdmin] = useState<any>(null);

    const openRoleModal = (role?: any) => {
        setEditingRole(role || null);
        setIsRoleModalOpen(true);
    };

    const openAdminModal = (admin?: any) => {
        setEditingAdmin(admin || null);
        setIsAdminModalOpen(true);
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Roles Management Section */}
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
                        <Card key={role.id} className="p-6 border-gray-100 hover:border-[#338078]/50 transition-all group overflow-hidden relative">
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
                                        <Badge key={p} variant="secondary" className="bg-gray-50 text-[10px] font-medium text-gray-500 border-none">
                                            {p.split('.')[0]}
                                        </Badge>
                                    ))}
                                    {role.permissions?.length > 3 && (
                                        <Badge variant="secondary" className="bg-gray-50 text-[10px] font-medium text-gray-500 border-none">
                                            +{role.permissions.length - 3} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Admin Staff Table */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[18px] font-semibold text-[#101928]">Administrative Staff</h3>
                        <p className="text-sm text-[#667085]">Manage users with administrative access.</p>
                    </div>
                    <button
                        onClick={() => openAdminModal()}
                        className="flex items-center gap-2 bg-white border border-[#338078] text-[#338078] px-6 py-2 rounded-[30px] font-medium hover:bg-[#338078]/5 transition-all text-sm"
                    >
                        <Icon icon="ph:user-plus-bold" className="w-4 h-4" />
                        Add New Admin
                    </button>
                </div>

                <div className="bg-white rounded-[16px] border border-gray-100 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="py-4">Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#338078]/10 text-[#338078] flex items-center justify-center font-bold text-xs">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-[#101928]">{admin.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${admin.role_detail ? 'bg-[#338078]/10 text-[#338078]' : 'bg-gray-100 text-gray-600'} border-none font-medium`}>
                                            {admin.role_detail?.name || 'Super Admin'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[#667085]">{admin.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-sm font-medium text-green-700">Active</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openAdminModal(admin)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-[#667085]"
                                            >
                                                <Icon icon="ph:pencil-simple-light" className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                                                <Icon icon="ph:trash-light" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Danger Zone Section */}
            {/* Danger Zone Section moved to Close Account tab */}
            {/* <DangerZone /> */}

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
            />
        </div>
    );
}
