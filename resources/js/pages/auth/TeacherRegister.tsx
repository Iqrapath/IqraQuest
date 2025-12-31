import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import RegistrationSuccessModal from '@/components/RegistrationSuccessModal';
import { toast } from 'sonner';

export default function TeacherRegister() {
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
        post('/register/teacher', {
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
            <Head title="Teacher Registration" />

            <form onSubmit={submit} className="flex w-full flex-col gap-[50px]">
                {/* Header */}
                <div className="flex w-full flex-col items-start gap-0 leading-[1.5]">
                    <h1 className="w-full font-['Nunito'] text-[38px] font-bold text-[#111928]">
                        Create an Account
                    </h1>
                    <p className="w-full text-center font-['Nunito'] text-[15px] font-medium text-gray-500">
                        Join as a Quran Teacher and connect with students worldwide.
                    </p>
                </div>

                {/* Form Fields Container */}
                <div className="flex w-full flex-col gap-[22px]">
                    {/* Username Field */}
                    <div className="flex flex-col gap-[8px]">
                        <label
                            htmlFor="name"
                            className="font-['Nunito'] text-[15px] font-medium text-[#111928]"
                        >
                            Username
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={cn(
                                'h-[45px] w-full rounded-[5px] border border-[#338078] bg-white px-[17px] font-["Manrope"] text-[15px] text-[#080808] outline-none transition-colors',
                                'focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/20',
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
                    <div className="flex flex-col gap-[8px]">
                        <label
                            htmlFor="email"
                            className="font-['Nunito'] text-[15px] font-medium text-[#111928]"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={cn(
                                'h-[45px] w-full rounded-[5px] border border-[#338078] bg-white px-[17px] font-["Manrope"] text-[15px] text-[#080808] outline-none transition-colors',
                                'focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/20',
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
                    <div className="flex flex-col gap-[8px]">
                        <label
                            htmlFor="password"
                            className="font-['Nunito'] text-[15px] font-medium text-[#111928]"
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
                                    'h-[45px] w-full rounded-[5px] border border-[#338078] bg-white px-[17px] pr-[50px] font-["Manrope"] text-[15px] text-[#080808] outline-none transition-colors',
                                    'focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/20',
                                    errors.password && 'border-red-500',
                                )}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-[17px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                    <div className="flex flex-col gap-[8px]">
                        <label
                            htmlFor="password_confirmation"
                            className="font-['Nunito'] text-[15px] font-medium text-[#111928]"
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
                                    'h-[45px] w-full rounded-[5px] border border-[#338078] bg-white px-[17px] pr-[50px] font-["Manrope"] text-[15px] text-[#080808] outline-none transition-colors',
                                    'focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/20',
                                )}
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-[17px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <Icon
                                    icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'}
                                    className="h-6 w-6"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-center gap-[8px]">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={data.terms}
                            onChange={(e) => setData('terms', e.target.checked)}
                            className="mt-1 h-[19px] w-[19px] shrink-0 rounded-[6px] border border-[#98a2b3] text-[#338078] focus:ring-2 focus:ring-[#338078]/20"
                            required
                        />
                        <label
                            htmlFor="terms"
                            className="font-['Nunito'] text-[11px] font-medium leading-normal text-[#474747]"
                        >
                            By signing up, you agree to IqraPath{' '}
                            <span className="text-[#e8562e]">Terms & Condition</span>,{' '}
                            <span className="text-[#e8562e]">Privacy</span> and{' '}
                            <span className="text-[#e8562e]">Policy</span>.
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-[45px] w-full items-center justify-center rounded-[56px] bg-[#338078] px-[23px] py-[11px] font-['Nunito'] text-[15px] font-medium capitalize text-white transition-colors hover:bg-[#2a6b64] disabled:opacity-50"
                    >
                        {processing ? 'Creating Account...' : 'Create an Account'}
                    </button>

                    {/* Divider */}
                    <div className="relative h-[27px] w-full">
                        <div className="absolute left-0 right-0 top-1/2 h-[1px] -translate-y-1/2 bg-gray-300" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-[8px]">
                            <p className="font-['Inter'] text-[13px] font-normal text-[#667185]">
                                Or Sign Up With
                            </p>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex flex-col gap-[15px]">
                        <button
                            type="button"
                            className="flex h-[50px] w-full items-center justify-center gap-[11px] rounded-[53px] border border-[#d0d5dd] bg-white px-[15px] py-[15px] font-['Nunito'] text-[15px] font-semibold text-[#344054] transition-colors hover:bg-gray-50 cursor-pointer"
                            onClick={() => window.location.href = '/auth/google/redirect?role=teacher'}
                        >
                            <Icon icon="flat-color-icons:google" className="h-[19px] w-[19px]" />
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            className="flex h-[50px] w-full items-center justify-center gap-[11px] rounded-[53px] border border-[#d0d5dd] bg-white px-[15px] py-[15px] font-['Nunito'] text-[15px] font-semibold text-[#344054] transition-colors hover:bg-gray-50 cursor-pointer"
                            onClick={() => window.location.href = '/auth/facebook/redirect?role=teacher'}
                        >
                            <Icon icon="logos:facebook" className="h-[19px] w-[19px]" />
                            Continue with Facebook
                        </button>
                    </div>

                    {/* Login and Registration Links */}
                    <div className="space-y-3">
                        {/* Already have account */}
                        <div className="flex items-center justify-center gap-1">
                            <p className="font-['Nunito'] text-[13px] font-normal text-gray-500">
                                Already have an account?
                            </p>
                            <Link
                                href="/login"
                                className="rounded-[7px] px-[8px] py-[4px] font-['Inter'] text-[13px] font-medium text-[#338078] transition-colors hover:bg-[#338078]/10"
                            >
                                Login
                            </Link>
                        </div>

                        {/* Register as student/guardian */}
                        <div className="flex items-center justify-center gap-1">
                            <p className="font-['Nunito'] text-[13px] font-normal text-gray-500">
                                Want to learn?
                            </p>
                            <Link
                                href="/register"
                                className="rounded-[7px] px-[8px] py-[4px] font-['Inter'] text-[13px] font-medium text-[#338078] transition-colors hover:bg-[#338078]/10"
                            >
                                Register as Student/Guardian
                            </Link>
                        </div>
                    </div>
                </div>
            </form>

            <RegistrationSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                verificationMethod={verificationMethod}
            />
        </AuthSplitLayout>
    );
}
