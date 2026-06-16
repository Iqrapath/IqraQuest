import { Head, usePage, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { parseDBDate } from '@/lib/utils';
import ContactSupportModal from './components/ContactSupportModal';
import { useEcho } from '@laravel/echo-react';

interface Message {
    id: number;
    content: string;
    is_mine: boolean;
    created_at_human: string;
    created_at?: string;
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
    id: number;
    status: string;
    rejection_reason?: string;
    rejected_at?: string;
    video_verification_status?: string;
    video_verification_scheduled_at?: string;
}

interface Props {
    auth: { user: { id: number } };
    teacher?: Teacher;
    status?: string;
    isPending: boolean;
    isRejected: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
    rejectionReason?: string;
    rejectedAt?: string;
    conversation?: Conversation | null;
    verificationStatus?: string;
    verificationScheduledAt?: string;
}

function IllustrationGroup({ className }: { className?: string }) {
    return (
        <div className={className}>
            <div className="absolute bg-[#a2fff6] bottom-[64.06%] left-[8.93%] opacity-50 right-[58.32%] rounded-[10px] top-0" />
            <div className="absolute bg-[#a2fff6] bottom-[56.61%] left-[81.34%] opacity-50 right-0 rounded-[10px] top-[22.92%]" />
            <div className="absolute bg-[#ebfffd] bottom-[25.81%] left-0 opacity-50 right-[79.96%] rounded-[8px] top-[52.21%]" />
            <div className="absolute bg-[#ebfffd] bottom-0 left-[72.63%] opacity-50 right-[4.12%] rounded-[8px] top-[74.48%]" />
            <div className="absolute inset-[12.81%_8.82%_3.51%_14.92%]">
                <svg className="block max-w-none w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="50" fill="#338078" />
                    <path d="M45 60L55 70L75 50" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}

export default function WaitingArea({
    isPending,
    isRejected,
    isSuspended,
    suspensionReason,
    rejectionReason,
    conversation,
    status,
    teacher,
    verificationStatus,
    verificationScheduledAt
}: Props) {
    const { auth, flash } = usePage<any>().props;
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);

    const vStatus = verificationStatus || teacher?.video_verification_status;
    const vDate = verificationScheduledAt || teacher?.video_verification_scheduled_at;

    console.log('--- WAITING AREA RENDER ---');
    console.log('Props:', { isPending, status, verificationStatus, verificationScheduledAt });
    console.log('Teacher:', teacher);
    console.log('Resolved Status:', vStatus);
    console.log('Resolved Date:', vDate);

    useEffect(() => {
        if (conversation?.messages) setMessages(conversation.messages);
    }, [conversation]);

    useEffect(() => {
        if (flash?.info) toast.info(flash.info);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    // Listen for status/verification updates
    useEcho(
        `user.${auth.user.id}`,
        'teacher.updated',
        (event: any) => {
            console.log('--- REAL-TIME UPDATE RECEIVED ---', event);
            if (event.message) {
                toast.success(event.message, { icon: '🔔' });
            }
            // Force Inertia to reload the data from the server
            import('@inertiajs/react').then(({ router }) => {
                router.reload();
            });
        },
        [auth.user.id]
    );

    useEcho(
        `user.${auth.user.id}`,
        '.new.message',

        (event: any) => {
            if (conversation && event.conversation_id === conversation.id) {
                const newMessage: Message = {
                    id: event.id,
                    content: event.content,
                    is_mine: false,
                    created_at_human: 'Just now',
                    created_at: new Date().toISOString(),
                    sender: { name: event.sender_name, avatar: event.sender_avatar }
                };
                setMessages(prev => [newMessage, ...prev]);
            }
        },
        [conversation, auth.user.id]
    );

    return (
        <TeacherLayout hideLeftSidebar={true} hideRightSidebar={true}>
            <Head title={isPending ? "Application Under Review" : "Application Status"} />

            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-['Nunito'] pb-20">
                <div className="w-full max-w-[600px] flex flex-col gap-6">
                    <div className="bg-white box-border flex flex-col gap-[24px] items-center p-[48px] rounded-[32px] shadow-[0px_4px_25px_0px_rgba(51,128,120,0.05)] w-full">
                        <IllustrationGroup className="h-[143.415px] relative shrink-0 w-[157.359px]" />

                        <div className="flex flex-col gap-[24px] items-center relative shrink-0 w-full text-center">
                            <p className="font-semibold leading-[1.5] text-[#111928] text-[32px] max-w-[479px]">
                                {isPending ? 'Thank you for completing registration!' : 'Application Update'}
                            </p>

                            {isPending ? (
                                <div className="space-y-4">
                                    <p className="font-medium text-gray-500">Reviewing your application.</p>
                                    <p className="font-bold text-[#338078]">Verification call required.</p>
                                </div>
                            ) : status === 'approved' ? (
                                <div>
                                    <p className="text-green-600 font-bold mb-4 text-xl">Approved!</p>
                                    <Link href="/teacher/dashboard">
                                        <Button className="bg-[#338078]">Go to Dashboard</Button>
                                    </Link>
                                </div>
                            ) : isSuspended ? (
                                <p className="text-orange-600 font-bold text-xl uppercase tracking-widest">Account Suspended</p>
                            ) : isRejected ? (
                                <p className="text-red-600 font-bold text-xl uppercase tracking-widest">Application Rejected</p>
                            ) : (
                                <p className="text-gray-500 font-medium">Your application is being processed.</p>
                            )}

                            {/* Verification Call Section */}
                            {vStatus === 'scheduled' && vDate && (
                                <div className="mt-8 pt-8 border-t border-gray-100 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <div className="bg-[#338078]/5 rounded-2xl p-6 border border-[#338078]/10 flex flex-col items-center gap-4">
                                        <Icon icon="solar:videocamera-record-bold" className="text-[#338078] w-10 h-10" />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">Scheduled Call</h3>
                                            <p className="text-[#338078] font-bold text-lg mt-1">
                                                {new Intl.DateTimeFormat('en-US', {
                                                    weekday: 'short', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                    timeZoneName: 'short'
                                                }).format(parseDBDate(vDate))}
                                            </p>
                                        </div>


                                        {(() => {
                                            const scheduled = parseDBDate(vDate).getTime();
                                            const isActive = new Date().getTime() >= (scheduled - 15 * 60 * 1000);
                                            return (
                                                <div className="w-full">
                                                    <Link href={`/teacher/verification/room/${teacher?.id || auth.user.id}`}>
                                                        <Button disabled={!isActive} className={`w-full h-12 rounded-xl font-bold shadow-md transition-all ${isActive ? 'bg-[#338078] hover:scale-[1.02] active:scale-95' : 'bg-gray-300'}`}>
                                                            {isActive ? 'Join Room Now' : 'Join Link Opens 15m Early'}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )
                                        })()}


                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {conversation && (
                        <div className="bg-white rounded-[32px] p-8 shadow-[0px_4px_25px_0px_rgba(51,128,120,0.05)] w-full">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="solar:chat-round-line-bold" className="text-[#338078]" />
                                Support Chat
                            </h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${msg.is_mine ? 'bg-[#338078] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setIsSupportModalOpen(true)} className="rounded-full px-8 h-12 border-gray-200 text-gray-600 hover:text-[#338078] bg-white">
                            <Icon icon="solar:headphones-round-sound-bold" className="mr-2 w-5 h-5" />
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>

            <ContactSupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
        </TeacherLayout>
    );
}
