import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface SendMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: {
        id: number;
        user: {
            name: string;
        };
    };
}

const quickMessages = [
    "Please upload a clearer photo of your ID document.",
    "We need additional information about your teaching qualifications.",
    "Your uploaded documents are being reviewed. We'll contact you soon.",
    "Please ensure your video call availability is up to date.",
];

export default function SendMessageModal({ isOpen, onClose, teacher }: SendMessageModalProps) {
    const [showQuickMessages, setShowQuickMessages] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/verifications/${teacher.id}/message`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleSelectQuickMessage = (msg: string) => {
        setData('message', msg);
        setShowQuickMessages(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                        <div className="w-10 h-10 rounded-xl bg-[#338078]/10 flex items-center justify-center">
                            <Icon icon="solar:chat-round-line-bold" className="w-5 h-5 text-[#338078]" />
                        </div>
                        Send Message
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-2">
                        Send a message to <strong>{teacher.user.name}</strong> regarding their verification.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Quick Messages Toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowQuickMessages(!showQuickMessages)}
                            className="text-sm text-[#338078] font-medium flex items-center gap-1 hover:underline"
                        >
                            <Icon icon="solar:bolt-bold" className="w-4 h-4" />
                            Quick Messages
                            <Icon
                                icon={showQuickMessages ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                                className="w-3 h-3 ml-1"
                            />
                        </button>

                        {showQuickMessages && (
                            <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-xl">
                                {quickMessages.map((msg, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelectQuickMessage(msg)}
                                        className="w-full text-left text-sm p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                    >
                                        {msg}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            rows={5}
                            placeholder="Type your message to the teacher..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#338078]/20 focus:border-[#338078] resize-none text-sm"
                        />
                        {errors.message && (
                            <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                        )}
                    </div>

                    {/* Info Note */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                        <Icon icon="solar:info-circle-linear" className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>
                            This message will be sent via email and will also appear in the teacher's notification center.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.message.trim()}
                            className="flex-1 h-11 rounded-xl bg-[#338078] hover:bg-[#2a6a63] text-white font-bold"
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
