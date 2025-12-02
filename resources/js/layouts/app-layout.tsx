import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import GuardianLayout from '@/layouts/GuardianLayout';
import StudentLayout from '@/layouts/StudentLayout';
import { type SharedData } from '@/types';

interface AppLayoutProps {
    children: ReactNode;
    hideLeftSidebar?: boolean;
    hideRightSidebar?: boolean;
}

export default function AppLayout({ children, hideLeftSidebar, hideRightSidebar }: AppLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role;

    // Render the appropriate layout based on user role
    switch (userRole) {
        case 'admin':
            return (
                <AdminLayout hideLeftSidebar={hideLeftSidebar} hideRightSidebar={hideRightSidebar}>
                    {children}
                </AdminLayout>
            );
        case 'teacher':
            return (
                <TeacherLayout hideLeftSidebar={hideLeftSidebar} hideRightSidebar={hideRightSidebar}>
                    {children}
                </TeacherLayout>
            );
        case 'guardian':
            return (
                <GuardianLayout hideLeftSidebar={hideLeftSidebar} hideRightSidebar={hideRightSidebar}>
                    {children}
                </GuardianLayout>
            );
        case 'student':
            return (
                <StudentLayout hideLeftSidebar={hideLeftSidebar} hideRightSidebar={hideRightSidebar}>
                    {children}
                </StudentLayout>
            );
        default:
            // Fallback for unauthenticated or unknown roles
            return <div className="p-4">{children}</div>;
    }
}
