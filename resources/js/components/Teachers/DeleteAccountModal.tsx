import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: number;
    deleteUrl: string;
    teacherName?: string;
}

export default function DeleteAccountModal({
    isOpen,
    onClose,
    teacherId,
    deleteUrl,
    teacherName
}: DeleteAccountModalProps) {
    const handleDelete = () => {
        router.delete(deleteUrl, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl font-['Nunito']">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5 text-red-600" />
                        </div>
                        Delete Account
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-2">
                        Are you sure you want to delete {teacherName ? <span className="font-bold text-gray-900">{teacherName}'s</span> : 'this'} account? This action cannot be undone and will remove all associated data, including their teaching profile, subjects, and certificates.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border-gray-200 font-bold transition-all active:scale-[0.98] text-base"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.98]"
                    >
                        Delete Permanently
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
