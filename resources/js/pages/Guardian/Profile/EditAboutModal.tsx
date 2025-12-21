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
    guardian: any;
}

export default function EditAboutModal({ open, onOpenChange, guardian }: Props) {
    const { data, setData, post, processing } = useForm({
        bio: guardian.bio || '',
    });

    useEffect(() => {
        if (open) {
            setData({
                bio: guardian.bio || '',
            });
        }
    }, [open, guardian]);

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
                        <div>
                            <DialogTitle className="font-['Nunito'] font-bold text-[24px] text-[#1a1d56]">
                                Tell about yourself
                            </DialogTitle>
                            <DialogDescription className="font-['Nunito'] text-[16px] text-[#818181] mt-1">
                                Tell potential students who you are
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="relative">
                            <textarea
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                className="w-full h-[180px] p-4 border border-[#caced7] rounded-[10px] bg-transparent outline-none resize-none font-['Nunito'] text-[14px] text-[#333] placeholder:text-[#a0a0a0] focus:border-[#338078] transition-colors"
                            />
                            <Icon icon="lucide:chevrons-right" className="absolute bottom-4 right-4 text-[#caced7] w-4 h-4 rotate-45" />
                        </div>

                        <div className="flex justify-end mt-2">
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
