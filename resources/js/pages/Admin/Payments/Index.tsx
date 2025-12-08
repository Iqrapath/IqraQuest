import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import TeacherPayoutsTab from './Components/TeacherPayoutsTab';
import StudentPaymentsTab from './Components/StudentPaymentsTab';
import PaymentSettingsTab from './Components/PaymentSettingsTab';
import Dashboard from '../Dashboard';

interface Props {
    activeTab: string;
    payouts?: any;
    stats?: any;
    filters?: any;
    paymentSettings?: any;
}

export default function PaymentIndex({ activeTab, payouts, stats, filters, paymentSettings }: Props) {
    const tabs = [
        { id: 'teacher-payouts', label: 'Teacher Payouts' },
        { id: 'student-payments', label: 'Student Payments' },
        { id: 'transaction-logs', label: 'Transaction Logs' },
        { id: 'payment-settings', label: 'Payment Settings' },
    ];

    return (
        <>
            <Head title="Payment and Wallet System" />

            <div className="">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8 text-gray-500 font-medium">
                    <Link href="/admin/dashboard" className="hover:text-gray-700">Dashboard</Link>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="text-[#192020] font-bold">Payment and wallet System</span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl w-fit mb-8 shadow-sm">
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            href={`/admin/payments?tab=${tab.id}`}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-[#338078] text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'teacher-payouts' && (
                        <TeacherPayoutsTab payouts={payouts} filters={filters} />
                    )}

                    {activeTab === 'student-payments' && (
                        <StudentPaymentsTab />
                    )}

                    {activeTab === 'transaction-logs' && (
                        <div className="bg-white rounded-[20px] p-12 text-center text-gray-500">
                            Transaction Logs Module (Coming Soon)
                        </div>
                    )}

                    {activeTab === 'payment-settings' && (
                        <PaymentSettingsTab settings={paymentSettings} />
                    )}
                </div>
            </div>
        </>
    );
}
PaymentIndex.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
