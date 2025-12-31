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
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    role: any;
    availablePermissions: any;
}

export default function RoleManagementModal({ isOpen, onClose, role, availablePermissions }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        id: role?.id || null,
        name: role?.name || '',
        slug: role?.slug || '',
        permissions: role?.permissions || []
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                id: role?.id || null,
                name: role?.name || '',
                slug: role?.slug || '',
                permissions: role?.permissions || []
            });
        }
    }, [isOpen, role]);

    const togglePermission = (perm: string) => {
        const newPerms = data.permissions.includes(perm)
            ? data.permissions.filter((p: string) => p !== perm)
            : [...data.permissions, perm];
        setData('permissions', newPerms);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.roles.save'), {
            onSuccess: () => {
                toast.success(data.id ? 'Role updated' : 'Role created');
                onClose();
                reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto font-[Nunito]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#338078]/10 text-[#338078] flex items-center justify-center">
                            <Icon icon="ph:shield-check-light" className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-[20px] font-bold text-[#101928]">
                            {data.id ? 'Edit Admin Role' : 'Create New Admin Role'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Role Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    if (!data.id) setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                }}
                                className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] focus:ring-1 focus:ring-[#338078] outline-none"
                                placeholder="e.g. Financial Officer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Slug (System Key)</label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                disabled={!!data.id}
                                className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-[#FAFAFA] focus:ring-1 focus:ring-[#338078] outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#101928] font-bold">
                            <Icon icon="ph:key-light" className="w-5 h-5" />
                            <span>Assign Permissions:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(availablePermissions).map(([category, perms]: [string, any]) => (
                                <div key={category} className="space-y-3">
                                    <h5 className="text-xs font-bold text-[#338078] uppercase tracking-wider">{category}</h5>
                                    <div className="space-y-3">
                                        {Object.entries(perms).map(([slug, label]: [string, any]) => (
                                            <div key={slug} className="flex items-center gap-3">
                                                <Checkbox
                                                    id={slug}
                                                    checked={data.permissions.includes(slug)}
                                                    onCheckedChange={() => togglePermission(slug)}
                                                    className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                                />
                                                <label htmlFor={slug} className="text-sm text-[#344054] cursor-pointer">
                                                    {label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            {processing ? 'Saving...' : (data.id ? 'Update Role' : 'Create Role')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
