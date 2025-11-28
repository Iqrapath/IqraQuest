import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';

export default function Dashboard() {
    return (
        <>
            <Head title="Student Dashboard" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold">Student Dashboard</h1>
                            <p className="mt-4">Welcome! Start your learning journey here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <StudentLayout children={page} />;
