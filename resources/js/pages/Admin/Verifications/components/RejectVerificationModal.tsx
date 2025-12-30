import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface RejectVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: number;
}

export default function RejectVerificationModal({ isOpen, onClose, teacherId }: RejectVerificationModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/admin/verifications/${teacherId}/reject`, {
            onSuccess: () => {
                reset();
                onClose();
                toast.success('Verification rejected successfully');
            },
            onError: () => {
                toast.error('Failed to reject verification');
            }
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl font-['Nunito']">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-600" />
                        </div>
                        Reject Verification
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-2">
                        Please provide a reason for rejecting this verification request. This reason will be shared with the teacher.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#101928] mb-2 font-['Nunito']">
                            Rejection Reason
                        </label>
                        <textarea
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            rows={4}
                            placeholder="e.g., ID document is unclear, Missing qualifications..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-500 resize-none text-sm outline-none transition-all placeholder:text-gray-400 font-['Nunito']"
                            required
                        />
                        {errors.reason && (
                            <p className="text-red-500 text-xs mt-1 font-bold">{errors.reason}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border-gray-200 font-bold hover:bg-gray-50 text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.reason.trim()}
                            className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.98]"
                        >
                            {processing ? (
                                <>
                                    <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    Reject Application
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
