import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SocialRoleSelectionProps {
    name: string;
    email: string;
    avatar?: string;
}

export default function SocialRoleSelection({ name, email, avatar }: SocialRoleSelectionProps) {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const handleRoleSubmit = (role: 'student' | 'guardian' | 'teacher') => {
        setIsSubmitting(true);
        setSelectedRole(role);

        router.post('/social/select-role',
            { role },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const showAvatar = avatar && avatar.startsWith('http') && !avatarError;

    return (
        <AuthSplitLayout>
            <Head title="Complete Your Registration" />

            <div className="flex w-full items-center justify-center">
                <div className="flex w-full max-w-[630px] flex-col items-center justify-center gap-[34px] rounded-[34px] border border-[#eff0f6] bg-white p-[60px] shadow-[0px_5px_16px_0px_rgba(8,15,52,0.06)]">
                    {/* User Info */}
                    <div className="flex flex-col items-center gap-4">
                        {showAvatar ? (
                            <img 
                                src={avatar} 
                                alt={name} 
                                className="h-20 w-20 rounded-full border-4 border-[#338078]/20 object-cover"
                                referrerPolicy="no-referrer"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#338078]/10">
                                <Icon icon="mdi:account" className="h-10 w-10 text-[#338078]" />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="font-['Nunito'] text-[18px] font-bold text-[#111928]">
                                Welcome, {name}!
                            </p>
                            <p className="font-['Nunito'] text-[14px] text-[#6f6c90]">
                                {email}
                            </p>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex w-full flex-col items-center gap-[8px]">
                        <h1 className="w-full text-center font-['Nunito'] text-[24px] font-bold leading-[35px] text-[#111928]">
                            How would you like to use IqraQuest?
                        </h1>
                        <p className="text-center font-['Nunito'] text-[15px] font-light leading-[26px] text-[#6f6c90]">
                            Select your role to complete registration
                        </p>
                    </div>

                    {/* Role Options */}
                    <div className="flex w-full max-w-[380px] flex-col gap-[20px]">
                        {/* Student Option */}
                        <button
                            type="button"
                            onClick={() => handleRoleSubmit('student')}
                            disabled={isSubmitting}
                            className={cn(
                                "flex w-full items-center gap-[14px] rounded-[16px] border-[1.5px] border-[#eff0f6] bg-white p-[20px] shadow-[0px_2px_6px_0px_rgba(19,18,66,0.07)] transition-all",
                                "hover:border-[#338078] hover:shadow-[0px_4px_12px_0px_rgba(51,128,120,0.15)]",
                                selectedRole === 'student' && isSubmitting && "opacity-50 cursor-wait",
                                "disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#E8F5F4]">
                                <Icon icon="ph:student-fill" className="h-7 w-7 text-[#338078]" />
                            </div>
                            <div className="flex flex-col items-start gap-1">
                                <p className="font-['Nunito'] text-[16px] font-bold text-[#170f49]">
                                    I'm a Student
                                </p>
                                <p className="font-['Nunito'] text-[13px] font-normal text-[#6f6c90]">
                                    Learn Quran with qualified teachers
                                </p>
                            </div>
                        </button>

                        {/* Guardian Option */}
                        <button
                            type="button"
                            onClick={() => handleRoleSubmit('guardian')}
                            disabled={isSubmitting}
                            className={cn(
                                "flex w-full items-center gap-[14px] rounded-[16px] border-[1.5px] border-[#eff0f6] bg-white p-[20px] shadow-[0px_2px_6px_0px_rgba(19,18,66,0.07)] transition-all",
                                "hover:border-[#338078] hover:shadow-[0px_4px_12px_0px_rgba(51,128,120,0.15)]",
                                selectedRole === 'guardian' && isSubmitting && "opacity-50 cursor-wait",
                                "disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#FFF4ED]">
                                <Icon icon="mdi:account-child" className="h-7 w-7 text-[#E8562E]" />
                            </div>
                            <div className="flex flex-col items-start gap-1">
                                <p className="font-['Nunito'] text-[16px] font-bold text-[#170f49]">
                                    I'm a Guardian
                                </p>
                                <p className="font-['Nunito'] text-[13px] font-normal text-[#6f6c90]">
                                    Register and manage my children's learning
                                </p>
                            </div>
                        </button>

                        {/* Teacher Option */}
                        <button
                            type="button"
                            onClick={() => handleRoleSubmit('teacher')}
                            disabled={isSubmitting}
                            className={cn(
                                "flex w-full items-center gap-[14px] rounded-[16px] border-[1.5px] border-[#eff0f6] bg-white p-[20px] shadow-[0px_2px_6px_0px_rgba(19,18,66,0.07)] transition-all",
                                "hover:border-[#338078] hover:shadow-[0px_4px_12px_0px_rgba(51,128,120,0.15)]",
                                selectedRole === 'teacher' && isSubmitting && "opacity-50 cursor-wait",
                                "disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#F0F5FF]">
                                <Icon icon="mdi:teach" className="h-7 w-7 text-[#3B82F6]" />
                            </div>
                            <div className="flex flex-col items-start gap-1">
                                <p className="font-['Nunito'] text-[16px] font-bold text-[#170f49]">
                                    I'm a Teacher
                                </p>
                                <p className="font-['Nunito'] text-[13px] font-normal text-[#6f6c90]">
                                    Share knowledge and teach Quran online
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center font-['Nunito'] text-[12px] text-[#9ca3af]">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </AuthSplitLayout>
    );
}

