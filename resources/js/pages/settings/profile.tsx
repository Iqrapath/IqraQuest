import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { update } from '@/routes/profile';
import { send } from '@/routes/verification';
import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        _method: 'PATCH',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name, email, and profile picture"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Avatar Upload Section */}
                        <div className="grid gap-4">
                            <Label>Profile Picture</Label>

                            <div className="flex items-center gap-6">
                                {/* Avatar Preview */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                        {(data.avatar || auth.user.avatar) ? (
                                            <img
                                                src={
                                                    data.avatar instanceof File
                                                        ? URL.createObjectURL(data.avatar)
                                                        : `/storage/${auth.user.avatar}`
                                                }
                                                alt={auth.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Button */}
                                <div className="flex flex-col gap-2">
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setData('avatar', file);
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor="avatar"
                                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                    >
                                        Choose Image
                                    </Label>
                                    {data.avatar && (
                                        <button
                                            type="button"
                                            onClick={() => setData('avatar', null)}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG or GIF (max. 2MB)
                                    </p>
                                </div>
                            </div>

                            <InputError
                                className="mt-2"
                                message={errors.avatar}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        {mustVerifyEmail &&
                            auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is
                                        unverified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the
                                            verification email.
                                        </Link>
                                    </p>

                                    {status ===
                                        'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has
                                                been sent to your email
                                                address.
                                            </div>
                                        )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">
                                    Saved
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
