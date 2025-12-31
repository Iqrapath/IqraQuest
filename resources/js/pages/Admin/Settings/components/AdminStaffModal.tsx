import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect, FormEventHandler } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    admin: any;
    roles: any[];
}

export default function AdminStaffModal({ isOpen, onClose, admin, roles }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        id: admin?.id || null,
        name: admin?.name || '',
        email: admin?.email || '',
        role_id: admin?.role_id?.toString() || '',
        password: '',
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                id: admin?.id || null,
                name: admin?.name || '',
                email: admin?.email || '',
                role_id: admin?.role_id?.toString() || '',
                password: '',
            });
        }
    }, [isOpen, admin]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.admins.save'), {
            onSuccess: () => {
                toast.success(data.id ? 'Staff updated' : 'Staff created');
                onClose();
                reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] font-[Nunito]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#338078]/10 text-[#338078] flex items-center justify-center">
                            <Icon icon="ph:user-plus-light" className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-[20px] font-bold text-[#101928]">
                            {data.id ? 'Edit Admin Staff' : 'Add New Admin Staff'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#344054]">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] focus:ring-1 focus:ring-[#338078] outline-none"
                            placeholder="e.g. Amina Yusuf"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#344054]">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] focus:ring-1 focus:ring-[#338078] outline-none"
                            placeholder="amina@iqrapath.com"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#344054]">Assign Role</label>
                        <Select value={data.role_id} onValueChange={(v) => setData('role_id', v)}>
                            <SelectTrigger className="w-full h-[48px] bg-[#FAFAFA] border-gray-200">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role_id && <p className="text-xs text-red-500">{errors.role_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#344054]">
                            {data.id ? 'Update Password (Leave blank to keep current)' : 'Set Password'}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] focus:ring-1 focus:ring-[#338078] outline-none"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>

                    <DialogFooter className="pt-6 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-[30px] border border-gray-200 font-medium text-gray-500 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#338078] text-white px-8 py-2 rounded-[30px] font-semibold hover:bg-[#2a6b64] transition-all disabled:opacity-50 shadow-sm"
                        >
                            {processing ? 'Saving...' : (data.id ? 'Save Changes' : 'Add Staff')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
