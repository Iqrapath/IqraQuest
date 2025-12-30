import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StudentContactEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
            phone?: string;
            role: string;
        };
        status: string;
        joined_at: string;
        city: string;
        country: string;
    };
    mode?: 'edit' | 'create';
    onNext?: (user: any) => void;
}

export default function StudentContactEditModal({
    isOpen,
    onClose,
    student,
    mode = 'edit',
    onNext,
}: StudentContactEditModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState({
        name: student?.user?.name || '',
        email: student?.user?.email || '',
        phone: student?.user?.phone || '',
        status: student?.status || 'active',
        city: student?.city || '',
        country: student?.country || '',
        role: student?.user?.role || 'student',
    });

    useEffect(() => {
        if (mode === 'edit' && student) {
            setData({
                name: student.user.name,
                email: student.user.email,
                phone: student.user.phone || '',
                status: student.status,
                city: student.city || '',
                country: student.country || '',
                role: student.user.role,
            });
        } else if (mode === 'create') {
            setData({
                name: '',
                email: '',
                phone: '',
                status: 'active',
                city: '',
                country: '',
                role: 'student',
            });
        }
    }, [student, mode, isOpen]);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (mode === 'create') {
            try {
                const response = await axios.post('/admin/students', data);
                if (response.data.success) {
                    toast.success('User Created', {
                        description: 'The user has been created successfully.',
                    });
                    if (onNext) {
                        onNext(response.data.user);
                    } else {
                        onClose();
                        window.location.reload(); // Fallback if no onNext
                    }
                }
            } catch (error: any) {
                toast.error('Creation Failed', {
                    description: error.response?.data?.message || 'Please check the input and try again.',
                });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            router.post(`/admin/students/${student.user.id}/update-contact`, data, {
                onSuccess: () => {
                    toast.success('Profile Updated', {
                        description: 'Student contact information has been updated.',
                    });
                    onClose();
                    setIsSubmitting(false);
                },
                onError: () => {
                    toast.error('Update Failed', {
                        description: 'Please check the input and try again.',
                    });
                    setIsSubmitting(false);
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] p-0 overflow-hidden bg-transparent border-none shadow-none text-left">
                <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-xl w-full relative">
                    <DialogClose className="absolute right-6 top-6 text-[#101828] hover:text-gray-600">
                        {/* <Icon icon="solar:close-circle-bold" className="w-6 h-6" /> */}
                    </DialogClose>

                    <DialogHeader className="mb-6 md:mb-8 text-left">
                        <DialogTitle className="font-['Nunito'] font-bold text-2xl text-[#170F49]">
                            {mode === 'create' ? 'Add New Student' : 'User Basic Information'}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {mode === 'create' ? 'Create a new student profile.' : "Make changes to the user's profile information here."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Row 1: Name & Phone */}
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Full Name</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Icon icon="solar:user-bold" className="w-5 h-5" />
                                </div>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    className="bg-[#F4F4FA] border-[#CACED7] h-12 rounded-[14px] pl-12 font-['Nunito'] text-[#111827]"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Phone Number</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Icon icon="solar:phone-broken" className="w-5 h-5" />
                                </div>
                                <Input
                                    value={data.phone}
                                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                                    className="bg-[#F4F4FA] border-[#CACED7] h-12 rounded-[14px] pl-12 font-['Nunito'] text-[#111827]"
                                    placeholder="Enter your Phone Number"
                                />
                            </div>
                        </div>

                        {/* Row 2: Email (Full Width) */}
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Email Address</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Icon icon="carbon:email" className="w-5 h-5" />
                                </div>
                                <Input
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    className="bg-[#F4F4FA] border-[#CACED7] h-12 rounded-[14px] pl-12 font-['Nunito'] text-[#111827]"
                                    placeholder="Enter your Delivery Address"
                                />
                            </div>
                        </div>

                        {/* Row 3: Location (Full Width) */}
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Location</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Icon icon="ion:location-outline" className="w-5 h-5" />
                                </div>
                                <Input
                                    value={data.city}
                                    onChange={(e) => setData({ ...data, city: e.target.value })}
                                    className="bg-[#F4F4FA] border-[#CACED7] h-12 rounded-[14px] pl-12 font-['Nunito'] text-[#111827]"
                                    placeholder="Select your location"
                                />
                            </div>
                        </div>

                        {/* Row 4: Role & Status */}
                        {/* Role */}
                        <div className="space-y-2">
                            <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Role</Label>
                            <Select value={data.role} onValueChange={(val) => setData({ ...data, role: val })}>
                                <SelectTrigger className="bg-[#F4F4FA] border-[#CACED7] h-12 rounded-[14px] font-['Nunito'] text-[#111827] pl-4">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="guardian">Guardian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Account Status</Label>
                            <Select value={data.status} onValueChange={(val) => setData({ ...data, status: val })}>
                                <SelectTrigger className="bg-[#F4F4FA] border-[#CACED7] h-12 rounded-[14px] font-['Nunito'] text-[#111827] pl-4">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    {/* <SelectItem value="pending">Pending</SelectItem> */}
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    {/* <SelectItem value="rejected">Rejected</SelectItem> */}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Row 5: Registration Date - Only show in Edit mode */}
                        {mode === 'edit' && (
                            <div className="space-y-2 col-span-1">
                                <Label className="font-['Nunito'] text-base text-[#2D2C2D] font-normal">Registration Date</Label>
                                <div className="bg-[#F4F4FA] border border-[#CACED7] h-12 rounded-[14px] px-4 flex items-center font-['Nunito'] text-[#111827] opacity-60">
                                    {student?.joined_at}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-8 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#338078] hover:bg-[#2a6b64] text-white rounded-[40px] px-8 py-6 text-base font-medium font-['Nunito'] w-full md:w-auto"
                        >
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Save and Continue' : 'Save Changes')}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
