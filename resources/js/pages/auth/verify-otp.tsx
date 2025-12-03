import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TextLink from '@/components/text-link';
import { logout } from '@/routes';

interface VerifyOtpProps {
    hasValidOtp: boolean;
    status?: string;
}

export default function VerifyOtp({ hasValidOtp, status }: VerifyOtpProps) {
    const [value, setValue] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { post: resendPost, processing: resending } = useForm();

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

    return (
        <AuthLayout
            title="Verify your email"
            description="We've sent a 6-digit verification code to your email address. Please enter it below to verify your account."
        >
            <Head title="Verify Email - OTP" />

            <div className="space-y-6">
                {/* OTP Input */}
                <div className="flex flex-col items-center gap-4">
                    <InputOTP
                        maxLength={6}
                        value={value}
                        onChange={(value) => setValue(value)}
                        disabled={isSubmitting}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>

                    {isSubmitting && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Spinner />
                            <span>Verifying...</span>
                        </div>
                    )}
                </div>

                {/* Resend Button */}
                <form onSubmit={handleResend} className="text-center">
                    <Button
                        type="submit"
                        variant="secondary"
                        disabled={resending || resendCooldown > 0}
                        className="w-full"
                    >
                        {resending && <Spinner />}
                        {resendCooldown > 0
                            ? `Resend code in ${resendCooldown}s`
                            : 'Resend verification code'}
                    </Button>
                </form>

                {/* Help text */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>Didn't receive the code? Check your spam folder.</p>
                    <p className="mt-1">The code expires in 10 minutes.</p>
                </div>

                {/* Logout link */}
                <TextLink
                    href={logout()}
                    className="mx-auto block text-center text-sm"
                >
                    Log out
                </TextLink>
            </div>
        </AuthLayout>
    );
}
