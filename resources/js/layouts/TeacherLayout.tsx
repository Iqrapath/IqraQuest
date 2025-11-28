import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function TeacherLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<any>().props;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/teacher/dashboard">
                                    <span className="text-xl font-bold text-[#338078]">IqraQuest Teacher</span>
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href="/teacher/dashboard"
                                    className="inline-flex items-center border-b-2 border-[#338078] px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        {/* User Dropdown */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <span className="text-sm text-gray-700">{auth.user.name}</span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="ml-4 text-sm text-gray-700 hover:text-gray-900"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
