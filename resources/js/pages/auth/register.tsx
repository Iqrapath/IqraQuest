import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import RegistrationSuccessModal from '@/components/RegistrationSuccessModal';
import { toast } from 'sonner';

interface RegisterProps {
    verificationMethod?: 'link' | 'otp';
}

export default function Register() {
    const { props } = usePage<{ verificationMethod?: 'link' | 'otp' }>();
    const verificationMethod = props.verificationMethod || 'link';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                // Show success modal
                setShowSuccessModal(true);
                // Reset form
                setData({
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    terms: false,
                });
            },
            preserveScroll: true,
        });
    };

    // Auto-redirect for OTP mode
    useEffect(() => {
        if (showSuccessModal && verificationMethod === 'otp') {
            const timer = setTimeout(() => {
                toast.info('Redirecting to OTP verification...');
                router.visit('/email/verify/otp');
            }, 2500); // 2.5 seconds

            return () => clearTimeout(timer);
        }
    }, [showSuccessModal, verificationMethod]);

    return (
        <AuthSplitLayout>
            <Head title="Register" />

            <form onSubmit={submit} className="flex w-full flex-col gap-[48px]">
                {/* Header */}
                <div className="flex w-full flex-col items-start gap-0 leading-[1.5]">
                    <h1 className="w-full font-['Nunito'] text-[26px] font-bold text-[#111928]">
                        👋 Welcome! Start Learning Today
                    </h1>
                    <p className="w-full font-['Nunito'] text-[15.146px] font-light text-gray-500">
                        Create your account to browse teachers, book sessions, and start learning with ease.
                    </p>
                </div>

                {/* Form Fields Container */}
                <div className="flex w-full flex-col gap-[22.719px]">
                    {/* Username Field */}
                    <div className="flex flex-col gap-[7.573px]">
                        <label
                            htmlFor="name"
                            className="font-['Nunito'] text-[15.146px] font-medium leading-[1.5] text-[#111928]"
                        >
                            Username
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={cn(
                                'h-[45.438px] w-full rounded-[7.573px] border border-[#d0d5dd] bg-white px-[15.146px] font-["Manrope"] text-[15.146px] text-[#667185] outline-none transition-colors',
                                'placeholder:text-[#98a2b3]',
                                'focus:border-[#338078] focus:shadow-[0px_0px_0px_3px_rgba(51,128,120,0.1)]',
                                errors.name && 'border-red-500',
                            )}
                            placeholder="Enter your username"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-[7.573px]">
                        <label
                            htmlFor="email"
                            className="font-['Nunito'] text-[15.146px] font-medium leading-[1.5] text-[#111928]"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={cn(
                                'h-[45.438px] w-full rounded-[7.573px] border border-[#d0d5dd] bg-white px-[15.146px] font-["Manrope"] text-[15.146px] text-[#667185] outline-none transition-colors',
                                'placeholder:text-[#98a2b3]',
                                'focus:border-[#338078] focus:shadow-[0px_0px_0px_3px_rgba(51,128,120,0.1)]',
                                errors.email && 'border-red-500',
                            )}
                            placeholder="Enter your email"
                            required
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-[7.573px]">
                        <label
                            htmlFor="password"
                            className="font-['Nunito'] text-[15.146px] font-medium leading-[1.5] text-[#111928]"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={cn(
                                    'h-[45.438px] w-full rounded-[7.573px] border border-[#d0d5dd] bg-white px-[15.146px] pr-[50px] font-["Manrope"] text-[15.146px] text-[#667185] outline-none transition-colors',
                                    'placeholder:text-[#98a2b3]',
                                    'focus:border-[#338078] focus:shadow-[0px_0px_0px_3px_rgba(51,128,120,0.1)]',
                                    errors.password && 'border-red-500',
                                )}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-[15.146px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <Icon
                                    icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                                    className="h-6 w-6"
                                />
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-[7.573px]">
                        <label
                            htmlFor="password_confirmation"
                            className="font-['Nunito'] text-[15.146px] font-medium leading-[1.5] text-[#111928]"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                className={cn(
                                    'h-[45.438px] w-full rounded-[7.573px] border border-[#d0d5dd] bg-white px-[15.146px] pr-[50px] font-["Manrope"] text-[15.146px] text-[#667185] outline-none transition-colors',
                                    'placeholder:text-[#98a2b3]',
                                    'focus:border-[#338078] focus:shadow-[0px_0px_0px_3px_rgba(51,128,120,0.1)]',
                                )}
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-[15.146px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <Icon
                                    icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'}
                                    className="h-6 w-6"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-center gap-[7.573px]">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={data.terms}
                            onChange={(e) => setData('terms', e.target.checked)}
                            className="mt-1 h-[18.933px] w-[18.933px] shrink-0 rounded-[6.626px] border border-[#98a2b3] text-[#338078] focus:ring-2 focus:ring-[#338078]/20"
                            required
                        />
                        <label
                            htmlFor="terms"
                            className="font-['Nunito'] text-[11.36px] font-medium leading-normal text-[#474747]"
                        >
                            By signing up, you agree to IqraQuest{' '}
                            <span className="text-[#e8562e]">Terms & Condition</span>,{' '}
                            <span className="text-[#e8562e]">Privacy</span> and{' '}
                            <span className="text-[#e8562e]">Policy</span>.
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-[45.438px] w-full items-center justify-center rounded-[56.575px] bg-[#338078] px-[22.719px] py-[11.36px] font-['Nunito'] text-[15.146px] font-medium capitalize text-white transition-colors hover:bg-[#2a6b64] disabled:opacity-50"
                    >
                        {processing ? 'Creating Account...' : 'Create an Account'}
                    </button>

                    {/* Divider */}
                    <div className="relative h-[27px] w-full">
                        <div className="absolute left-0 right-0 top-1/2 h-[0.947px] -translate-y-1/2 bg-gray-300" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-[7.573px]">
                            <p className="font-['Inter'] text-[13.253px] font-normal text-[#667185]">
                                Or Sign Up With
                            </p>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex flex-col gap-[15.146px]">
                        <button
                            type="button"
                            className="flex h-[49.225px] w-full items-center justify-center gap-[11.36px] rounded-[53.148px] border border-[#d0d5dd] bg-white px-[15.146px] py-[15.146px] font-['Nunito'] text-[15.146px] font-semibold text-[#344054] transition-colors hover:bg-gray-50 cursor-pointer"
                            onClick={() => window.location.href = '/auth/google/redirect?role=student'}
                        >
                            <Icon icon="flat-color-icons:google" className="h-[18.933px] w-[18.933px]" />
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            className="flex h-[49.225px] w-full items-center justify-center gap-[11.36px] rounded-[53.148px] border border-[#d0d5dd] bg-white px-[15.146px] py-[15.146px] font-['Nunito'] text-[15.146px] font-semibold text-[#344054] transition-colors hover:bg-gray-50 cursor-pointer"
                            onClick={() => window.location.href = '/auth/facebook/redirect?role=student'}
                        >
                            <Icon icon="logos:facebook" className="h-[18.933px] w-[18.933px]" />
                            Continue with Facebook
                        </button>
                    </div>

                    {/* Login and Registration Links */}
                    <div className="space-y-3">
                        {/* Already have account */}
                        <div className="flex items-center justify-center gap-1">
                            <p className="font-['Nunito'] text-[13.253px] font-normal text-gray-500">
                                Already have an account?
                            </p>
                            <Link
                                href="/login"
                                className="rounded-[6.626px] px-[7.573px] py-[3.786px] font-['Inter'] text-[13.253px] font-medium text-[#338078] transition-colors hover:bg-[#338078]/10"
                            >
                                Login
                            </Link>
                        </div>

                        {/* Register as teacher */}
                        <div className="flex items-center justify-center gap-1">
                            <p className="font-['Nunito'] text-[13.253px] font-normal text-gray-500">
                                Want to teach?
                            </p>
                            <Link
                                href="/register/teacher"
                                className="rounded-[6.626px] px-[7.573px] py-[3.786px] font-['Inter'] text-[13.253px] font-medium text-[#338078] transition-colors hover:bg-[#338078]/10"
                            >
                                Register as Teacher
                            </Link>
                        </div>
                    </div>
                </div>
            </form>

            {/* Success Modal */}
            <RegistrationSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                verificationMethod={verificationMethod}
            />
        </AuthSplitLayout>
    );
}
