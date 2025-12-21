import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Payout } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    payout: Payout | null;
}

type NotificationType = 'payout_success' | 'reminder_update' | 'rejection_reason';
type SendChannel = 'in_app' | 'email' | 'all';
type DeliveryTime = 'now' | 'later';

const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; message: string }> = {
    payout_success: {
        title: 'Payout Approved',
        message: 'Hello [Teacher_Name], your payout request of ₦[Amount] has been approved and will be credited shortly.',
    },
    reminder_update: {
        title: 'Update Your Account Details',
        message: 'Hello [Teacher_Name], please update your payment account details to receive your payout of ₦[Amount].',
    },
    rejection_reason: {
        title: 'Payout Request Update',
        message: 'Hello [Teacher_Name], your payout request of ₦[Amount] could not be processed. Please contact support for more details.',
    },
};

export default function SendPayoutNotificationModal({ isOpen, onClose, payout }: Props) {
    const [notificationType, setNotificationType] = useState<NotificationType>('payout_success');
    const [message, setMessage] = useState('');
    const [sendChannel, setSendChannel] = useState<SendChannel>('in_app');
    const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>('now');
    const [scheduledAt, setScheduledAt] = useState('');
    const [sending, setSending] = useState(false);

    const teacherName = payout?.teacher?.user?.name || 'Teacher';
    const amount = payout ? Number(payout.amount).toLocaleString() : '0';

    // Initialize message when payout changes or modal opens
    useEffect(() => {
        if (isOpen && payout) {
            let initialMessage = NOTIFICATION_TEMPLATES.payout_success.message;
            initialMessage = initialMessage.replace('[Teacher_Name]', teacherName);
            initialMessage = initialMessage.replace('[Amount]', amount);
            setMessage(initialMessage);
            setNotificationType('payout_success');
            setSendChannel('in_app');
            setDeliveryTime('now');
            setScheduledAt('');
        }
    }, [isOpen, payout, teacherName, amount]);

    if (!isOpen || !payout) return null;

    const handleTypeChange = (type: NotificationType) => {
        setNotificationType(type);
        // Update message with template, replacing placeholders
        let newMessage = NOTIFICATION_TEMPLATES[type].message;
        newMessage = newMessage.replace('[Teacher_Name]', teacherName);
        newMessage = newMessage.replace('[Amount]', amount);
        setMessage(newMessage);
    };

    const handleSend = () => {
        if (!payout.teacher?.user?.id) {
            toast.error('Teacher user not found');
            return;
        }

        setSending(true);

        router.post('/admin/notifications', {
            title: NOTIFICATION_TEMPLATES[notificationType].title,
            message: message,
            type: 'custom',
            target_audience: 'specific',
            target_user_ids: [payout.teacher.user.id],
            frequency: 'one_time',
            scheduled_at: deliveryTime === 'later' ? scheduledAt : null,
            send_now: deliveryTime === 'now',
            send_channels: {
                in_app: sendChannel === 'in_app' || sendChannel === 'all',
                email: sendChannel === 'email' || sendChannel === 'all',
            },
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Notification sent successfully');
                onClose();
            },
            onError: (errors) => {
                console.error('Send error:', errors);
                toast.error('Failed to send notification');
            },
            onFinish: () => setSending(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] w-full max-w-lg mx-4 p-6 shadow-xl">
                {/* Header */}
                <h2 className="font-['Nunito'] font-semibold text-[20px] text-[#192020] mb-6">
                    Send Notification to: {teacherName}
                </h2>

                {/* Content Card */}
                <div className="border border-gray-200 rounded-[16px] p-5 space-y-5">
                    {/* Choose Type */}
                    <div>
                        <h3 className="font-['Nunito'] font-medium text-[16px] text-[#192020] mb-3">
                            Choose Type:
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={notificationType === 'payout_success'}
                                    onCheckedChange={() => handleTypeChange('payout_success')}
                                    className="data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                />
                                <span className="flex items-center gap-2">
                                    <span className="text-green-500">✅</span>
                                    <span className="text-[14px] text-[#192020]">Payout Success</span>
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={notificationType === 'reminder_update'}
                                    onCheckedChange={() => handleTypeChange('reminder_update')}
                                    className="data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                />
                                <span className="flex items-center gap-2">
                                    <span className="text-amber-500">🔔</span>
                                    <span className="text-[14px] text-[#192020]">Reminder to Update Account</span>
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                    checked={notificationType === 'rejection_reason'}
                                    onCheckedChange={() => handleTypeChange('rejection_reason')}
                                    className="data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                />
                                <span className="flex items-center gap-2">
                                    <span className="text-red-500">❌</span>
                                    <span className="text-[14px] text-[#192020]">Rejected Reason Explanation</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Message Body */}
                    <div>
                        <h3 className="font-['Nunito'] font-medium text-[16px] text-[#192020] mb-3">
                            Message Body
                        </h3>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-[12px] border border-gray-200 focus:border-[#338078] focus:ring-1 focus:ring-[#338078] outline-none transition-all text-[14px] text-gray-600 resize-none"
                        />
                    </div>

                    {/* Send As */}
                    <div className="flex items-center gap-4">
                        <span className="font-['Nunito'] font-medium text-[14px] text-[#192020]">Send As:</span>
                        <div className="flex items-center gap-2">
                            {(['in_app', 'email', 'all'] as const).map((channel) => (
                                <button
                                    key={channel}
                                    type="button"
                                    onClick={() => setSendChannel(channel)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                                        sendChannel === channel
                                            ? 'bg-[#338078] text-white border-[#338078]'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                    )}
                                >
                                    {channel === 'in_app' ? 'In-App' : 
                                     channel === 'email' ? 'Email' : 'All'}
                                    <div className={cn(
                                        "w-4 h-2 rounded-full transition-colors",
                                        sendChannel === channel ? 'bg-white/30' : 'bg-gray-200'
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Schedule Delivery Time */}
                    <div className="flex items-center gap-4">
                        <span className="font-['Nunito'] font-medium text-[14px] text-[#192020]">Schedule Delivery Time:</span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setDeliveryTime('now')}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                                    deliveryTime === 'now'
                                        ? 'bg-[#338078] text-white border-[#338078]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                )}
                            >
                                Send Now
                                <div className={cn(
                                    "w-4 h-2 rounded-full transition-colors",
                                    deliveryTime === 'now' ? 'bg-white/30' : 'bg-gray-200'
                                )} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeliveryTime('later')}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                                    deliveryTime === 'later'
                                        ? 'bg-[#338078] text-white border-[#338078]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                )}
                            >
                                Schedule for Later
                                <div className={cn(
                                    "w-4 h-2 rounded-full transition-colors",
                                    deliveryTime === 'later' ? 'bg-white/30' : 'bg-gray-200'
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Schedule Date/Time (if later) */}
                    {deliveryTime === 'later' && (
                        <div>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-2 rounded-[12px] border border-gray-200 focus:border-[#338078] focus:ring-1 focus:ring-[#338078] outline-none transition-all text-[14px]"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-1 text-red-500 font-medium text-[14px] hover:text-red-600"
                    >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending || (deliveryTime === 'later' && !scheduledAt)}
                        className={cn(
                            "px-6 py-2.5 rounded-full bg-[#338078] text-white font-medium text-[14px]",
                            "hover:bg-[#2a6b64] disabled:opacity-50 disabled:cursor-not-allowed",
                            "flex items-center gap-2"
                        )}
                    >
                        {sending ? (
                            <>
                                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Notification'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

