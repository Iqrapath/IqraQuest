import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { logout } from '@/routes';

interface VerifyOtpProps {
    hasValidOtp: boolean;
    status?: string;
    email: string;
}

export default function VerifyOtp({ hasValidOtp, status, email }: VerifyOtpProps) {
    const [value, setValue] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const { post: resendPost, processing: resending } = useForm();
    const { data: emailData, setData: setEmailData, post: updateEmailPost, processing: updatingEmail, errors: emailErrors } = useForm({
        email: email,
    });

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (value.length === 6 && !isSubmitting) {
            handleSubmit();
        }
    }, [value]);

    const handleSubmit = () => {
        setIsSubmitting(true);

        router.post('/email/verify/otp', {
            otp_code: value,
        }, {
            onSuccess: () => {
                toast.success('Email verified successfully!');
                setIsSubmitting(false);
            },
            onError: (errors: any) => {
                if (errors.otp_code) {
                    toast.error(errors.otp_code as string);
                }
                setValue(''); // Clear the input on error
                setIsSubmitting(false);
            },
        });
    };

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();

        resendPost('/email/verify/otp/resend', {
            onSuccess: () => {
                toast.success('A new verification code has been sent to your email');
                setResendCooldown(60); // 60 second cooldown
                setValue(''); // Clear the current input
            },
            onError: () => {
                toast.error('Failed to resend code. Please try again.');
            },
        });
    };

    // Show status message if verification OTP was sent
    useEffect(() => {
        if (status === 'verification-otp-sent') {
            toast.success('A new verification code has been sent to your email');
            setResendCooldown(60);
        }
    }, [status]);

    const handleUpdateEmail = (e: React.FormEvent) => {
        e.preventDefault();
        updateEmailPost('/email/verify/otp/update-email', {
            onSuccess: () => {
                setIsEditingEmail(false);
                toast.success('Email updated successfully!');
            },
        });
    };

    return (
        <AuthLayout
            title="Verify Your Account"
            description="We've sent a 6-digit verification code to your email. Please check your inbox (and spam folder) to proceed."
        >
            <Head title="Verify Email - OTP" />

            <div className="flex flex-col gap-[clamp(1.5rem,5vw,2.5rem)] mt-4">
                {/* Security Icon & Header Details */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 bg-[#338078]/10 rounded-full flex items-center justify-center mb-2">
                        <Icon icon="solar:shield-keyhole-bold-duotone" className="w-9 h-9 text-[#338078]" />
                    </div>
                    <h2 className="font-['Nunito'] font-bold text-[clamp(1.5rem,3vw,1.875rem)] text-[#1a1d56]">
                        Enter Verification Code
                    </h2>
                    <p className="font-['Inter'] text-[#64748b] text-[15px] leading-relaxed max-w-[320px]">
                        The code was sent to <span className="font-bold text-[#1a1d56]">{email}</span> and expires in 10 minutes.
                    </p>

                    <button
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                        className="text-[#338078] text-xs font-semibold uppercase tracking-wider hover:text-[#2a6b64] transition-colors cursor-pointer hover:underline"
                    >
                        {isEditingEmail ? 'Close Editor' : 'Edit Email Address'}
                    </button>

                    {isEditingEmail && (
                        <form onSubmit={handleUpdateEmail} className="w-full max-w-[300px] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={emailData.email}
                                    onChange={e => setEmailData('email', e.target.value)}
                                    className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-all ${emailErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/10'}`}
                                    placeholder="Enter correct email"
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={updatingEmail}
                                    className="h-auto py-2 bg-[#338078] text-white hover:bg-[#2a6b64]"
                                >
                                    {updatingEmail ? <Spinner className="w-4 h-4" /> : 'Update'}
                                </Button>
                            </div>
                            {emailErrors.email && (
                                <p className="text-[11px] text-red-500 font-medium pl-1">{emailErrors.email}</p>
                            )}
                        </form>
                    )}
                </div>

                {/* OTP Input Section */}
                <div className="flex flex-col items-center gap-6">
                    <InputOTP
                        maxLength={6}
                        value={value}
                        onChange={(v) => setValue(v)}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        <InputOTPGroup className="gap-2 md:gap-3">
                            {[...Array(6)].map((_, i) => (
                                <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className="w-12 h-14 md:w-14 md:h-16 text-[24px] font-bold font-['Nunito'] border-2 rounded-xl transition-all duration-200 focus:ring-0 data-[state=selected]:border-[#338078] data-[state=selected]:bg-[#338078]/5 data-[state=selected]:scale-105 text-[#1a1d56]"
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>

                    {isSubmitting && (
                        <div className="flex items-center gap-3 py-2 px-4 bg-gray-50 rounded-full border border-gray-100 animate-pulse">
                            <Spinner className="text-[#338078] w-4 h-4" />
                            <span className="text-[14px] font-medium text-[#475569]">Verifying your security code...</span>
                        </div>
                    )}
                </div>

                {/* Actions Section */}
                <div className="flex flex-col gap-4">
                    <form onSubmit={handleResend} className="w-full">
                        <Button
                            type="submit"
                            disabled={resending || resendCooldown > 0}
                            className={`w-full py-7 rounded-[18px] font-['Nunito'] font-bold text-[16px] transition-all shadow-lg ${resendCooldown > 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-[#338078] text-white hover:bg-[#2a6b64] hover:shadow-[#338078]/20'
                                }`}
                        >
                            {resending ? (
                                <div className="flex items-center gap-2">
                                    <Spinner className="w-4 h-4" />
                                    <span>Sending Code...</span>
                                </div>
                            ) : resendCooldown > 0 ? (
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:clock-circle-bold" className="w-5 h-5" />
                                    <span>Resend code in {resendCooldown}s</span>
                                </div>
                            ) : (
                                'Resend Verification Code'
                            )}
                        </Button>
                    </form>

                    <div className="flex items-center justify-between px-2 text-[14px]">
                        <button
                            onClick={() => router.get(logout())}
                            className="text-[#64748b] hover:text-[#1a1d56] font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:underline"
                        >
                            <Icon icon="solar:logout-2-linear" className="w-4 h-4" />
                            Log out
                        </button>

                        <p className="text-[#94a3b8] italic">
                            Didn't get it? Check spam.
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
