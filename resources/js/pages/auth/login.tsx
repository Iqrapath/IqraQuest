import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    login_warning?: string;
    login_error?: string;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    login_warning,
    login_error,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    // Show toast notifications for login warnings/errors
    useEffect(() => {
        if (login_warning) {
            toast.warning(login_warning);
        }
        if (login_error) {
            toast.error(login_error);
        }
    }, [login_warning, login_error]);

    return (
        <AuthLayout
            title="Login your Account"
            description="Welcome back! Enter your credentials to access your account."
        >
            <Head title="Login" />

            {/* Title and Description */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Login your Account
                </h1>
                <p className="text-sm text-gray-600">
                    Welcome back! Enter your credentials to access your account.
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6 mt-8"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email Address */}
                            <div className="grid gap-2.5">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="zakiisoft@gmail.com"
                                    className="h-12 px-4 rounded-lg border-gray-300"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2.5">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-12 px-4 pr-12 rounded-lg border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="rounded"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal text-gray-600 cursor-pointer"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                                        tabIndex={5}
                                    >
                                        Forgot Password
                                    </TextLink>
                                )}
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium mt-2"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Login your Account
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or Login With</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="grid gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 w-full h-12 px-4 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                                onClick={() => window.location.href = '/auth/google/redirect'}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 w-full h-12 px-4 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                                onClick={() => window.location.href = '/auth/facebook/redirect'}
                            >
                                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Continue with Facebook</span>
                            </button>
                        </div>

                        {/* Sign Up Links */}
                        {canRegister && (
                            <div className="text-center text-sm text-gray-600 mt-2">
                                <div>Don't have an account?</div>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <TextLink
                                        href="/register/teacher"
                                        tabIndex={6}
                                        className="text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Sign up as Teacher
                                    </TextLink>
                                    <span className="text-gray-400">|</span>
                                    <TextLink
                                        href={register()}
                                        tabIndex={7}
                                        className="text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Sign up as Student/Guardian
                                    </TextLink>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
