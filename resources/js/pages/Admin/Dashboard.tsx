import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

export default function Dashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="mt-4">Welcome to the admin dashboard!</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout children={page} />;
