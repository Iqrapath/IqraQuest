import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/waiting-area/message', {
            onSuccess: () => {
                reset();
                onClose();
                toast.success('Message sent to support');
            },
            onError: () => {
                toast.error('Failed to send message');
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
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                        <div className="w-10 h-10 rounded-xl bg-[#338078]/10 flex items-center justify-center">
                            <Icon icon="solar:headphones-round-sound-bold" className="w-5 h-5 text-[#338078]" />
                        </div>
                        Contact Support
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        Have a question about your verification? Send us a message and we'll get back to you shortly.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#101928] mb-2 font-['Nunito']">
                            Message
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            rows={5}
                            placeholder="Type your message here..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#338078]/20 focus:border-[#338078] resize-none text-sm outline-none transition-all placeholder:text-gray-400 font-['Nunito']"
                        />
                        {errors.message && (
                            <p className="text-red-500 text-xs mt-1 font-bold">{errors.message}</p>
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
                            disabled={processing || !data.message.trim()}
                            className="flex-1 h-11 rounded-xl bg-[#338078] hover:bg-[#2a6a63] text-white font-bold transition-all active:scale-[0.98]"
                        >
                            {processing ? (
                                <>
                                    <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:plain-bold" className="w-4 h-4 mr-2" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
