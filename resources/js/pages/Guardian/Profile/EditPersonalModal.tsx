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
    user: any;
    guardian: any;
}

export default function EditPersonalModal({ open, onOpenChange, user, guardian }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name,
        phone: user.phone || '',
        city: guardian.city || '',
        country: guardian.country || '',
    });

    useEffect(() => {
        if (open) {
            setData({
                name: user.name,
                phone: user.phone || '',
                city: guardian.city || '',
                country: guardian.country || '',
            });
        }
    }, [open, user, guardian]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/guardian/profile', {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-[20px]">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6 text-left">
                        <div className="flex justify-between items-center">
                            <div>
                                <DialogTitle className="font-['Nunito'] font-bold text-[24px] text-[#1a1d56]">
                                    Personal Information
                                </DialogTitle>
                                <DialogDescription className="font-['Nunito'] text-[16px] text-[#818181] mt-1">
                                    Tell us about yourself
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Username & Phone Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-['Nunito'] text-[16px] text-[#333333]">Username</label>
                                <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3 border border-transparent focus-within:border-[#338078] transition-colors">
                                    <Icon icon="solar:user-broken" className="text-[#333333] w-5 h-5 mr-3" />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter your username"
                                        className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] placeholder:text-[#a0a0a0] text-[#333]"
                                    />
                                </div>
                                {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-['Nunito'] text-[16px] text-[#333333]">Phone Number</label>
                                <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3 border border-transparent focus-within:border-[#338078] transition-colors">
                                    <Icon icon="solar:phone-broken" className="text-[#333333] w-5 h-5 mr-3" />
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter your Phone Number"
                                        className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] placeholder:text-[#a0a0a0] text-[#333]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="flex flex-col gap-2">
                            <label className="font-['Nunito'] text-[16px] text-[#333333]">Email Address</label>
                            <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3">
                                <Icon icon="solar:letter-broken" className="text-[#333333] w-5 h-5 mr-3" />
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    placeholder="Enter your Delivery Address"
                                    className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] placeholder:text-[#a0a0a0] text-[#6b7280] cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-2">
                            <label className="font-['Nunito'] text-[16px] text-[#333333]">Location</label>
                            <div className="bg-[#f4f4f6] rounded-[10px] flex items-center px-4 py-3 border border-transparent focus-within:border-[#338078] transition-colors">
                                <Icon icon="solar:map-point-broken" className="text-[#333333] w-5 h-5 mr-3" />
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Enter your city (e.g. Lagos)"
                                    className="bg-transparent border-none outline-none w-full font-['Nunito'] text-[14px] placeholder:text-[#a0a0a0] text-[#333]"
                                />
                                <span className="text-gray-400 mx-2">|</span>
                                <input
                                    type="text"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    placeholder="Country"
                                    className="bg-transparent border-none outline-none w-1/3 font-['Nunito'] text-[14px] placeholder:text-[#a0a0a0] text-[#333]"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">* Please enter City and Country</p>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white font-['Nunito'] font-medium text-[16px] py-3 px-8 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save and Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
