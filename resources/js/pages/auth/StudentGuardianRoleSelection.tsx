import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { cn } from '@/lib/utils';

export default function StudentGuardianRoleSelection() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleSubmit = (role: 'student' | 'guardian') => {
        setIsSubmitting(true);
        setSelectedRole(role);

        router.post('/select-role',
            { role },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <AuthSplitLayout>
            <Head title="Select Your Role" />

            <div className="flex w-full items-center justify-center">
                <div className="flex w-full max-w-[630px] flex-col items-center justify-center gap-[34px] rounded-[34px] border border-[#eff0f6] bg-white p-[98px] shadow-[0px_5px_16px_0px_rgba(8,15,52,0.06)]">
                    {/* Header */}
                    <div className="flex w-full flex-col items-center gap-[8px]">
                        <h1 className="w-full text-center font-['Nunito'] text-[24px] font-bold leading-[35px] text-[#111928]">
                            How do you want to use this platform?
                        </h1>
                        <p className="text-center font-['Nunito'] text-[16px] font-light leading-[30px] text-[#6f6c90]">
                            Kindly select how you like to use Iqrapath for learning
                        </p>
                    </div>

                    {/* Role Options */}
                    <div className="flex w-[321.999px] flex-col gap-[25.591px]">
                        {/* Student Option */}
                        <button
                            type="button"
                            onClick={() => handleRoleSubmit('student')}
                            disabled={isSubmitting}
                            className={cn(
                                "flex w-full items-center gap-[9.597px] rounded-[12.795px] border-[0.8px] border-[#eff0f6] bg-white p-[19.193px] shadow-[0px_1.599px_4.798px_0px_rgba(19,18,66,0.07)] transition-all",
                                "hover:border-[#338078] hover:shadow-[0px_2px_8px_0px_rgba(51,128,120,0.15)]",
                                selectedRole === 'student' && isSubmitting && "opacity-50 cursor-wait",
                                "disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex h-[53.294px] w-[53.294px] shrink-0 items-center justify-center">
                                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="53.294" height="53.294" rx="26.647" fill="#E8F5F4" />
                                    <path d="M26.647 14.648c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" fill="#338078" />
                                    <path d="M26.647 32.648c-6.627 0-12 2.686-12 6v2h24v-2c0-3.314-5.373-6-12-6z" fill="#338078" />
                                </svg>
                            </div>
                            <p className="font-['Outfit'] text-[12px] font-normal leading-[15.994px] text-[#170f49]">
                                I'm a Student
                            </p>
                        </button>

                        {/* Guardian Option */}
                        <button
                            type="button"
                            onClick={() => handleRoleSubmit('guardian')}
                            disabled={isSubmitting}
                            className={cn(
                                "flex w-full items-center gap-[9.597px] rounded-[12.795px] border-[0.8px] border-[#eff0f6] bg-white p-[19.193px] shadow-[0px_1.599px_4.798px_0px_rgba(19,18,66,0.07)] transition-all",
                                "hover:border-[#338078] hover:shadow-[0px_2px_8px_0px_rgba(51,128,120,0.15)]",
                                selectedRole === 'guardian' && isSubmitting && "opacity-50 cursor-wait",
                                "disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex h-[53.294px] w-[53.294px] shrink-0 items-center justify-center">
                                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="53.294" height="53.294" rx="26.647" fill="#FFF4ED" />
                                    <path d="M20 18c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm13.33 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zM20 28c-3.31 0-10 1.66-10 5v3h20v-3c0-3.34-6.69-5-10-5zm13.33 0c-.41 0-.87.04-1.36.09 1.63.94 2.7 2.24 2.7 3.91v3h7v-3c0-3.34-6.69-5-8.34-5z" fill="#E8562E" />
                                </svg>
                            </div>
                            <p className="w-[221px] text-left font-['Outfit'] text-[12px] font-normal leading-[22px] text-[#170f49]">
                                I'm a Guardian (Registering for my child/children)
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </AuthSplitLayout>
    );
}
