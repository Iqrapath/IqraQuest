import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';

interface Teacher {
    status: string;
    rejection_reason?: string;
    rejected_at?: string;
}

interface Props {
    teacher?: Teacher; // Made optional to avoid strict type errors if not passed
    status?: string;
    isPending: boolean;
    isRejected: boolean;
    rejectionReason?: string;
    rejectedAt?: string;
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

export default function WaitingArea({ isPending, isRejected, rejectionReason }: Props) {
    return (
        <TeacherLayout>
            <Head title={isPending ? "Application Under Review" : "Application Status"} />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Nunito']">
                {/* Main Card - Exact styling from Figma */}
                <div className="bg-white box-border flex flex-col gap-[24px] items-center p-[48px] rounded-[32px] shadow-[0px_4px_25px_0px_rgba(51,128,120,0.05)]">

                    {/* Illustration */}
                    <IllustrationGroup className="h-[143.415px] relative shrink-0 w-[157.359px]" />

                    {/* Content Container */}
                    <div className="flex flex-col gap-[24px] items-center relative shrink-0 w-full">

                        {/* Heading */}
                        <p className="font-semibold leading-[1.5] relative shrink-0 text-[#111928] text-[32px] text-center w-[479px]">
                            {isPending ? 'Thank you for completing registration!' : 'Application Update'}
                        </p>

                        {isPending ? (
                            <>
                                {/* Subtitle */}
                                <p className="font-medium leading-[1.5] relative shrink-0 text-[15.146px] text-center text-gray-500 w-[505px]">
                                    We've received your application and are currently reviewing it.
                                </p>

                                {/* Main Message - Teal Text */}
                                <div className="font-bold leading-[1.5] relative shrink-0 text-[#338078] text-[15.146px] text-center w-[505px]">
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
                                    <p className="relative shrink-0 text-gray-500 w-[505px] font-medium">
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

                                <p className="font-medium text-[15.146px] leading-[1.5] text-gray-500 text-center w-[505px]">
                                    Please contact our support team if you have any questions or would like to reapply.
                                </p>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
