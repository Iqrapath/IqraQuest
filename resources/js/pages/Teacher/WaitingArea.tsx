import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import ContactSupportModal from './components/ContactSupportModal';
import TimeAgo from 'react-timeago';
import { useEcho } from '@laravel/echo-react';

interface Message {
    id: number;
    content: string;
    is_mine: boolean;
    created_at_human: string;
    created_at?: string; // Added for TimeAgo
    sender: {
        name: string;
        avatar: string;
    };
}

interface Conversation {
    id: number;
    messages: Message[];
    other_user: {
        name: string;
        avatar: string;
    };
}

interface Teacher {
    status: string;
    rejection_reason?: string;
    rejected_at?: string;
}

interface Props {
    auth: { user: { id: number } };
    teacher?: Teacher;
    status?: string;
    isPending: boolean;
    isRejected: boolean;
    rejectionReason?: string;
    rejectedAt?: string;
    conversation?: Conversation | null;
}

// Group component for the illustration - Exact from Figma
function IllustrationGroup({ className }: { className?: string }) {
    return (
        <div className={className}>
            {/* Background decorative squares - Exact positioning and colors */}
            <div className="absolute bg-[#a2fff6] bottom-[64.06%] left-[8.93%] opacity-50 right-[58.32%] rounded-[10px] top-0" />
            <div className="absolute bg-[#a2fff6] bottom-[56.61%] left-[81.34%] opacity-50 right-0 rounded-[10px] top-[22.92%]" />
            <div className="absolute bg-[#ebfffd] bottom-[25.81%] left-0 opacity-50 right-[79.96%] rounded-[8px] top-[52.21%]" />
            <div className="absolute bg-[#ebfffd] bottom-0 left-[72.63%] opacity-50 right-[4.12%] rounded-[8px] top-[74.48%]" />

            {/* Central checkmark illustration - Exact positioning */}
            <div className="absolute inset-[12.81%_8.82%_3.51%_14.92%]">
                <svg className="block max-w-none w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="50" fill="#338078" />
                    <path d="M45 60L55 70L75 50" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}

export default function WaitingArea({ isPending, isRejected, rejectionReason, conversation }: Props) {
    const { auth, flash } = usePage<any>().props;
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);

    // Sync messages if conversation prop changes
    useEffect(() => {
        if (conversation?.messages) {
            setMessages(conversation.messages);
        }
    }, [conversation]);

    // Listen for new messages
    // We listen on the user's private channel to catch messages even without refresh
    useEcho(
        `user.${auth.user.id}`,
        '.new.message',
        (event: any) => {
            // Check if this message belongs to our support conversation
            // In WaitingArea we implicitly only care about the single Admin conversation
            if (conversation && event.conversation_id === conversation.id) {
                const newMessage: Message = {
                    id: event.id,
                    content: event.content,
                    is_mine: false,
                    created_at_human: 'Just now',
                    created_at: new Date().toISOString(),
                    sender: {
                        name: event.sender_name,
                        avatar: event.sender_avatar,
                    }
                };

                setMessages(prev => [newMessage, ...prev]);

                // Play simplified notification sound
                const audio = new Audio('/sounds/message.mp3');
                audio.play().catch(() => { });
            }
        },
        [conversation, auth.user.id]
    );

    // Show toast for flash messages (e.g., when redirected from dashboard)
    useEffect(() => {
        if (flash?.info) {
            toast.info(flash.info, { icon: '⏳' });
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    return (
        <TeacherLayout hideLeftSidebar={true} hideRightSidebar={true}>
            <Head title={isPending ? "Application Under Review" : "Application Status"} />

            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-['Nunito'] pb-20">
                <div className="w-full max-w-[600px] flex flex-col gap-6">

                    {/* Main Status Card */}
                    <div className="bg-white box-border flex flex-col gap-[24px] items-center p-[48px] rounded-[32px] shadow-[0px_4px_25px_0px_rgba(51,128,120,0.05)] w-full">

                        {/* Illustration */}
                        <IllustrationGroup className="h-[143.415px] relative shrink-0 w-[157.359px]" />

                        {/* Content Container */}
                        <div className="flex flex-col gap-[24px] items-center relative shrink-0 w-full">

                            {/* Heading */}
                            <p className="font-semibold leading-[1.5] relative shrink-0 text-[#111928] text-[32px] text-center max-w-[479px]">
                                {isPending ? 'Thank you for completing registration!' : 'Application Update'}
                            </p>

                            {isPending ? (
                                <>
                                    {/* Subtitle */}
                                    <p className="font-medium leading-[1.5] relative shrink-0 text-[15.146px] text-center text-gray-500 max-w-[505px]">
                                        We've received your application and are currently reviewing it.
                                    </p>

                                    {/* Main Message - Teal Text */}
                                    <div className="font-bold leading-[1.5] relative shrink-0 text-[#338078] text-[15.146px] text-center max-w-[505px]">
                                        <p>
                                            To ensure the quality and authenticity of our teachers, we require a quick live video call before you can proceed to your dashboard.
                                        </p>
                                        <p className="mt-[1.5em]">
                                            You will receive an email with the invitation live video call within 5 business days. Stay tuned
                                        </p>
                                    </div>

                                    {/* Important Notes */}
                                    <div className="flex flex-col gap-0 items-center relative shrink-0 text-[15.146px] text-center leading-[1.5]">
                                        <p className="relative shrink-0 text-[#ff3b30] text-nowrap whitespace-pre font-semibold">
                                            Important Notes
                                        </p>
                                        <p className="relative shrink-0 text-gray-500 max-w-[505px] font-medium">
                                            ⚠️ Make sure to have a stable internet connection.
                                            <br />
                                            {` ⚠️ Use a quiet and well-lit environment.`}
                                            <br />
                                            {` ⚠️ Keep your ID and teaching qualifications ready.`}
                                        </p>
                                    </div>
                                </>
                            ) : isRejected ? (
                                <>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="font-medium text-[15.146px] text-red-600">
                                            Application Not Approved
                                        </span>
                                    </div>

                                    {rejectionReason && (
                                        <div className="bg-gray-50 rounded-lg p-4 w-full max-w-[505px]">
                                            <p className="font-semibold text-sm text-gray-700 mb-2">Reason:</p>
                                            <p className="text-sm text-gray-600">{rejectionReason}</p>
                                        </div>
                                    )}

                                    <p className="font-medium text-[15.146px] leading-[1.5] text-gray-500 text-center max-w-[505px]">
                                        Please contact our support team if you have any questions or would like to reapply.
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Messages Section */}
                    {conversation && (
                        <div className="bg-white rounded-[32px] p-8 shadow-[0px_4px_25px_0px_rgba(51,128,120,0.05)] w-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#338078]/10 flex items-center justify-center shrink-0">
                                    <Icon icon="solar:chat-line-bold" className="w-5 h-5 text-[#338078]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Messages from Support</h3>
                                    <p className="text-sm text-gray-500">History of your verification messages</p>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-400 py-8 text-sm">No messages yet.</p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col gap-1 ${msg.is_mine ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`
                                                max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                                                ${msg.is_mine
                                                    ? 'bg-[#338078] text-white rounded-tr-sm'
                                                    : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                                                }
                                            `}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <span className="textxs text-gray-400 px-2 flex items-center gap-1">
                                                <TimeAgo
                                                    date={msg.created_at || new Date()}
                                                    minPeriod={60}
                                                    formatter={(value: number, unit: string, suffix: string) => {
                                                        if (unit === 'second') return 'just now';
                                                        return `${value} ${unit}${value !== 1 ? 's' : ''} ${suffix}`;
                                                    }}
                                                />
                                                <span>- {msg.is_mine ? 'You' : msg.sender.name}</span>
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Support Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsSupportModalOpen(true)}
                            className="rounded-full px-8 py-6 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#338078] shadow-sm bg-white"
                        >
                            <Icon icon="solar:headphones-round-sound-bold" className="w-5 h-5 mr-3" />
                            <span className="font-bold text-base">Contact Support</span>
                        </Button>
                    </div>

                </div>
            </div>

            <ContactSupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
            />
        </TeacherLayout>
    );
}
