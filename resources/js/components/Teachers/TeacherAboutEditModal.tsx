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
import { Textarea } from '@/components/ui/textarea';

interface Teacher {
    id: number;
    user: {
        name: string;
    };
    bio?: string;
}

interface TeacherAboutEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: Teacher;
}

export default function TeacherAboutEditModal({
    isOpen,
    onClose,
    teacher,
}: TeacherAboutEditModalProps) {
    const [bio, setBio] = useState(teacher.bio || '');
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        if (!bio.trim()) {
            setError('About section cannot be empty');
            return false;
        }

        if (bio.trim().length < 20) {
            setError('About section must be at least 20 characters');
            return false;
        }

        if (bio.trim().length > 1000) {
            setError('About section cannot exceed 1000 characters');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        router.put(`/admin/teachers/${teacher.id}`, {
            bio: bio.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('About section updated successfully');
                onClose();
            },
            onError: (err) => {
                setIsSubmitting(false);
                if (err.bio) {
                    setError(err.bio as string);
                }
                toast.error('Failed to update about section');
            },
        });
    };

    const handleChange = (value: string) => {
        setBio(value);
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[565px] p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 md:px-12 pt-8 md:pt-12 pb-0">
                    <DialogTitle className="font-['Nunito'] font-semibold text-xl md:text-[24px] text-[#170f49] leading-[1.2]">
                        About {teacher.user.name}
                    </DialogTitle>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 md:px-12 pt-6 md:pt-8 pb-6 md:pb-8">
                    <div className="flex flex-col gap-6">
                        {/* Bio Textarea */}
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="bio"
                                className="sr-only"
                            >
                                About
                            </Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`bg-white border ${error ? 'border-red-500' : 'border-[#9e9e9e]'} min-h-[150px] font-['Nunito'] font-light text-xs md:text-[12.5px] text-[#1f2a37] leading-[1.5] resize-none rounded-[12px] p-4`}
                                placeholder="Tell us about your teaching experience and qualifications..."
                                rows={6}
                            />
                            <div className="flex justify-between items-center">
                                {error ? (
                                    <p className="text-xs text-red-500 font-['Nunito']">{error}</p>
                                ) : (
                                    <span className="text-xs text-gray-500 font-['Nunito']">
                                        {bio.length}/1000 characters
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
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
