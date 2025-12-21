import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    child: any;
}

export default function EditPersonalModal({ open, onOpenChange, child }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: child.name,
        gender: child.gender,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: child.name,
                gender: child.gender,
            });
        }
    }, [open, child]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/guardian/children/${child.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-[20px]">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6 text-left">
                        <DialogTitle className="font-['Nunito'] font-bold text-[24px] text-[#1a1d56]">
                            Personal Information
                        </DialogTitle>
                        <DialogDescription className="font-['Nunito'] text-[16px] text-[#818181] mt-1">
                            Update your child's basic details
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-['Nunito'] text-[16px] text-[#333333]">Child's Full Name</label>
                            <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3 border border-transparent focus-within:border-[#338078] transition-colors">
                                <Icon icon="solar:user-broken" className="text-[#333333] w-5 h-5 mr-3" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter child's full name"
                                    className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] placeholder:text-[#a0a0a0] text-[#333]"
                                />
                            </div>
                            {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-['Nunito'] text-[16px] text-[#333333]">Gender</label>
                            <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3 border border-transparent focus-within:border-[#338078] transition-colors relative">
                                <Icon icon="ph:gender-intersex" className="text-[#333333] w-5 h-5 mr-3" />
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value as any)}
                                    className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] text-[#333] appearance-none"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <Icon icon="tabler:chevron-down" className="absolute right-4 text-gray-400 w-4 h-4" />
                            </div>
                            {errors.gender && <span className="text-red-500 text-xs">{errors.gender}</span>}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white font-['Nunito'] font-medium text-[16px] py-3 px-8 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
