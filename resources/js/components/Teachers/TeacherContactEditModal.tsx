import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';

interface Teacher {
    id: number;
    user: {
        name: string;
        email: string;
        phone?: string;
    };
    city: string;
    country: string;
}

interface TeacherContactEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: Teacher;
}

export default function TeacherContactEditModal({
    isOpen,
    onClose,
    teacher,
}: TeacherContactEditModalProps) {
    const [formData, setFormData] = useState({
        name: teacher.user.name,
        email: teacher.user.email,
        phone: teacher.user.phone || '',
        city: teacher.city,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Full Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (optional but if provided, should be valid)
        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Location validation
        if (!formData.city.trim()) {
            newErrors.city = 'Location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        router.put(`/admin/teachers/${teacher.id}`, {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Contact information updated successfully');
                onClose();
            },
            onError: (err) => {
                setIsSubmitting(false);
                setErrors(err as Record<string, string>);
                toast.error('Failed to update contact information');
            },
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[629px] p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 md:px-12 pt-8 md:pt-12 pb-0">
                    <DialogTitle className="font-['Nunito'] font-semibold text-xl md:text-[24px] text-[#170f49] leading-[1.2]">
                        Personal Information
                    </DialogTitle>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 md:px-12 pt-8 md:pt-12 pb-6 md:pb-8">
                    <div className="flex flex-col gap-6">
                        {/* Full Name & Email Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="name"
                                    className="font-['Nunito'] font-normal text-sm md:text-[16px] text-[#2d2c2d]"
                                >
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className={`bg-[#f4f4fa] border ${errors.name ? 'border-red-500' : 'border-[#caced7]'} h-12 font-['Nunito']`}
                                    placeholder="Enter full name"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 font-['Nunito']">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-['Nunito'] font-normal text-sm md:text-[16px] text-[#2d2c2d]"
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className={`bg-[#f4f4fa] border ${errors.email ? 'border-red-500' : 'border-[#caced7]'} h-12 pl-10 font-['Nunito']`}
                                        placeholder="Enter email"
                                    />
                                    <Icon
                                        icon="carbon:email"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 font-['Nunito']">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Phone & Location Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="phone"
                                    className="font-['Nunito'] font-normal text-sm md:text-[16px] text-[#2d2c2d]"
                                >
                                    Phone Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className={`bg-[#f4f4fa] border ${errors.phone ? 'border-red-500' : 'border-[#caced7]'} h-12 pl-10 font-['Nunito']`}
                                        placeholder="Enter phone number"
                                    />
                                    <Icon
                                        icon="solar:phone-broken"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-xs text-red-500 font-['Nunito']">{errors.phone}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="city"
                                    className="font-['Nunito'] font-normal text-sm md:text-[16px] text-[#2d2c2d]"
                                >
                                    Location
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="city"
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        className={`bg-[#f4f4fa] border ${errors.city ? 'border-red-500' : 'border-[#caced7]'} h-12 pl-10 font-['Nunito']`}
                                        placeholder="Enter location"
                                    />
                                    <Icon
                                        icon="weui:location-outlined"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                                    />
                                </div>
                                {errors.city && (
                                    <p className="text-xs text-red-500 font-['Nunito']">{errors.city}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#338078] hover:bg-[#2a6a63] text-white px-6 py-3 rounded-lg font-['Nunito'] font-medium text-sm md:text-[16px] disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save and Continue'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
