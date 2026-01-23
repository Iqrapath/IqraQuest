import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    admin: any;
    roles: any[];
}

const PERMISSIONS = [
    { key: 'full_access', label: 'Full Access' },
    { key: 'manage_bookings', label: 'Manage Bookings' },
    { key: 'handle_payouts', label: 'Handle Payouts' },
    { key: 'change_platform_settings', label: 'Change Platform Settings' },
];

export default function ViewAdminModal({ isOpen, onClose, admin, roles }: Props) {
    if (!admin) return null;

    const roleName = admin.role_detail?.name || 'Super Admin';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] font-[Nunito]" aria-describedby="view-admin-modal-desc">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="text-[18px] font-semibold text-[#101928]">
                        View Admin Role
                    </DialogTitle>
                </DialogHeader>
                <p id="view-admin-modal-desc" className="sr-only">
                    Details of the selected admin and their assigned role.
                </p>

                <div className="space-y-6 mt-4">
                    {/* Role Name Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Role Name:</span>
                        <div className="bg-[#338078]/10 text-[#338078] px-4 py-2 rounded-[8px] font-semibold">
                            {roleName}
                        </div>
                    </div>

                    {/* Assign Role Dropdown */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Assign Role:</span>
                        <Select value={admin.role_id?.toString() || ''} disabled>
                            <SelectTrigger className="w-[180px] h-[40px] bg-white border-gray-200">
                                <SelectValue placeholder={roleName} />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assign Permissions */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#667085]">
                            <Icon icon="ph:pencil-simple" className="w-4 h-4" />
                            <span className="text-sm">Assign Permissions:</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {PERMISSIONS.map((perm) => {
                                const isChecked = admin.full_access || admin.permissions?.includes(perm.key);
                                return (
                                    <div
                                        key={perm.key}
                                        className="flex items-center gap-2 bg-[#338078]/10 text-[#338078] px-3 py-1.5 rounded"
                                    >
                                        <span className="text-sm font-medium">{perm.label}</span>
                                        <Checkbox
                                            checked={isChecked}
                                            disabled
                                            className="border-[#338078] data-[state=checked]:bg-[#338078]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Admin Info */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#338078]/10 text-[#338078] flex items-center justify-center font-bold text-sm overflow-hidden">
                                {admin.avatar ? (
                                    <img src={`/storage/${admin.avatar}`} alt={admin.name} className="w-full h-full object-cover" />
                                ) : (
                                    admin.name?.charAt(0) || 'A'
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-[#101928]">{admin.name}</p>
                                <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
