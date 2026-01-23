import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect, FormEventHandler, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from '@iconify/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    admin: any;
    roles: any[];
    availablePermissions?: any;
}



export default function AdminStaffModal({ isOpen, onClose, admin, roles, availablePermissions }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        id: admin?.id || null,
        name: admin?.name || '',
        email: admin?.email || '',
        phone: admin?.phone || '',
        role_id: admin?.role_id?.toString() || '',
        password: '',
        avatar: null as File | null,
        full_access: admin?.full_access ?? true,
        permissions: admin?.permissions || [],
        send_via_email: true,
        send_via_sms: false,
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                id: admin?.id || null,
                name: admin?.name || '',
                email: admin?.email || '',
                phone: admin?.phone || '',
                role_id: admin?.role_id?.toString() || '',
                password: '',
                avatar: null,
                full_access: admin?.full_access ?? true,
                permissions: admin?.permissions || [],
                send_via_email: true,
                send_via_sms: false,
            });
            setAvatarPreview(admin?.avatar ? `/storage/${admin.avatar}` : null);
        }
    }, [isOpen, admin?.id]); // Only trigger when isOpen or admin ID changes, not the whole admin object

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('password', password);
        toast.success('Password generated!');
    };

    const togglePermission = (perm: string) => {
        const newPerms = data.permissions.includes(perm)
            ? data.permissions.filter((p: string) => p !== perm)
            : [...data.permissions, perm];
        setData('permissions', newPerms);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('id', data.id || '');
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('role_id', data.role_id);
        formData.append('password', data.password);
        formData.append('full_access', data.full_access ? '1' : '0');
        formData.append('permissions', JSON.stringify(data.permissions));
        formData.append('send_via_email', data.send_via_email ? '1' : '0');
        formData.append('send_via_sms', data.send_via_sms ? '1' : '0');
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        router.post('/admin/settings/admins', formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(data.id ? 'Staff updated' : 'Staff created');
                onClose();
                reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto font-[Nunito]" aria-describedby="admin-staff-modal-description">
                <DialogHeader>
                    <DialogTitle className="text-[20px] font-bold text-[#101928]">
                        Admin Role List
                    </DialogTitle>
                    <p id="admin-staff-modal-description" className="text-sm text-gray-500">
                        Create or edit admin staff details and assign roles.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8 mt-4">
                    {/* Admin Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#338078]">
                            <Icon icon="ph:diamond-fill" className="w-4 h-4" />
                            <span className="font-semibold text-[#101928]">Admin Details</span>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Upload Image</span>
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Icon icon="ph:user" className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[#338078] text-sm font-medium hover:underline"
                            >
                                Upload
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        {/* Name and Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Admin Full Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-white focus:ring-1 focus:ring-[#338078] outline-none"
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344054]">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-white focus:ring-1 focus:ring-[#338078] outline-none"
                                    placeholder="johndoe@email.com"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#344054]">Phone Number (optional)</label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full h-[48px] px-4 rounded-[8px] border border-gray-200 bg-white focus:ring-1 focus:ring-[#338078] outline-none"
                                placeholder="e.g., +234 812 345 6789"
                            />
                        </div>
                    </div>

                    {/* Role Assignment Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#338078]">
                            <Icon icon="ph:diamond-fill" className="w-4 h-4" />
                            <span className="font-semibold text-[#101928]">Role Assignment</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Assign Role:</span>
                            <Select value={data.role_id} onValueChange={(v) => setData('role_id', v)}>
                                <SelectTrigger className="w-[180px] h-[40px] bg-white border-gray-200">
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
                        </div>

                        {/* Full Access Checkbox */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-[#338078]/10 text-[#338078] px-3 py-1 rounded">
                                <span className="text-sm font-medium">Full Access</span>
                                <Checkbox
                                    checked={data.full_access}
                                    onCheckedChange={(checked) => setData('full_access', !!checked)}
                                    className="border-[#338078] data-[state=checked]:bg-[#338078]"
                                />
                            </div>
                        </div>

                        {/* Custom Permissions */}
                        <div className="space-y-3">
                            <span className="text-sm text-gray-500">Custom Permissions:</span>
                            <div className="flex flex-wrap gap-3 max-h-[200px] overflow-y-auto">
                                {availablePermissions && Object.entries(availablePermissions).flatMap(([_, perms]: [string, any]) =>
                                    Object.entries(perms).map(([key, label]: [string, any]) => ({ key, label }))
                                ).map((perm) => (
                                    <div
                                        key={perm.key}
                                        className="flex items-center gap-2 bg-[#338078]/10 text-[#338078] px-3 py-1 rounded"
                                    >
                                        <Checkbox
                                            id={`perm-${perm.key}`}
                                            checked={data.permissions.includes(perm.key)}
                                            onCheckedChange={() => togglePermission(perm.key)}
                                            className="border-[#338078] data-[state=checked]:bg-[#338078]"
                                        />
                                        <label
                                            htmlFor={`perm-${perm.key}`}
                                            className="text-sm font-medium cursor-pointer select-none"
                                        >
                                            {perm.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Login Credentials Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[#338078]">
                            <Icon icon="ph:diamond-fill" className="w-4 h-4" />
                            <span className="font-semibold text-[#101928]">Login Credentials</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Set Password:</span>
                            <input
                                type="text"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-[200px] h-[40px] px-4 rounded-[8px] border border-gray-200 bg-white focus:ring-1 focus:ring-[#338078] outline-none text-sm"
                                placeholder="Admin1234"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={generatePassword}
                            className="flex items-center gap-2 text-[#338078] text-sm font-medium hover:underline"
                        >
                            <Icon icon="ph:circle-fill" className="w-3 h-3" />
                            Auto-Generate Password
                        </button>

                        {/* Send Credentials Via */}
                        <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-500">Send Credentials via:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Email</span>
                                <Switch
                                    checked={data.send_via_email}
                                    onCheckedChange={(v) => setData('send_via_email', v)}
                                    className="data-[state=checked]:bg-[#338078]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">SMS</span>
                                <Switch
                                    checked={data.send_via_sms}
                                    onCheckedChange={(v) => {
                                        // TODO: SMS not implemented yet
                                        toast.warning('SMS notifications are not yet implemented');
                                        setData('send_via_sms', v);
                                    }}
                                    className="data-[state=checked]:bg-[#338078]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#338078] text-white px-8 py-3 rounded-[8px] font-semibold hover:bg-[#2a6b64] transition-all disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Admin'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-red-500 font-medium hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
