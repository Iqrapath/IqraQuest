import { Head } from '@inertiajs/react';
import GuardianLayout from '@/layouts/GuardianLayout';

export default function Dashboard() {
    return (
        <>
            <Head title="Guardian Dashboard" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold">Guardian Dashboard</h1>
                            <p className="mt-4">Welcome! Monitor your children's progress here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <GuardianLayout children={page} />;
