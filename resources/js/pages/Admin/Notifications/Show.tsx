import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Recipient {
    id: number;
    name: string;
    email: string;
    role: string;
    read_at: string | null;
    delivered_at: string;
}

interface PaginatedRecipients {
    data: Recipient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Broadcast {
    id: number;
    title: string;
    message: string;
    type: string;
    target_audience: string;
    total_recipients: number;
    delivered_count: number;
    read_count: number;
    sent_at: string;
    created_by: string;
    status: string;
}

interface Props {
    broadcast: Broadcast;
    recipients: PaginatedRecipients;
}

export default function ShowNotification({ broadcast, recipients }: Props) {
    const openRate = broadcast.delivered_count > 0 
        ? Math.round((broadcast.read_count / broadcast.delivered_count) * 100) 
        : 0;
    
    const deliveryRate = broadcast.total_recipients > 0 
        ? Math.round((broadcast.delivered_count / broadcast.total_recipients) * 100) 
        : 0;

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; color: string; bg: string }> = {
            sent: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50' },
            scheduled: { label: 'Scheduled', color: 'text-amber-600', bg: 'bg-amber-50' },
            draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-50' },
            cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
        };
        return badges[status] || badges.draft;
    };

    const getDeliveryStatus = (recipient: Recipient) => {
        if (recipient.read_at) {
            return { label: '✅ Read', color: 'text-green-600' };
        }
        return { label: '✅ Delivered', color: 'text-green-600' };
    };

    const formatAudience = (audience: string) => {
        const labels: Record<string, string> = {
            all: 'All Users',
            students: 'Students',
            teachers: 'Teachers',
            guardians: 'Guardians',
            specific: 'Specific Users',
        };
        return labels[audience] || audience;
    };

    const formatType = (type: string) => {
        const labels: Record<string, string> = {
            system: 'System',
            announcement: 'Announcement',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    const statusBadge = getStatusBadge(broadcast.status);

    return (
        <>
            <Head title="Notification Details" />

            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/dashboard" className="font-['Nunito'] font-light text-[20px] text-gray-500 hover:text-gray-700">
                        Dashboard
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <Link href="/admin/notifications" className="font-['Nunito'] font-light text-[20px] text-gray-500 hover:text-gray-700">
                        Notifications System
                    </Link>
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="font-['Nunito'] font-semibold text-[20px] text-[#141522]">Notification details</span>
                </div>

                {/* System Notification Card */}
                <div className="mb-8">
                    <h2 className="font-['Nunito'] font-semibold text-[20px] text-[#101928] mb-4">
                        System Notification
                    </h2>
                    
                    <div className="bg-white rounded-[16px] border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="font-['Nunito'] font-semibold text-[18px] text-[#101928]">
                                {broadcast.title}
                            </h3>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[12px] font-medium",
                                statusBadge.bg, statusBadge.color
                            )}>
                                {statusBadge.label}
                            </span>
                        </div>
                        
                        <p className="font-['Nunito'] text-[14px] text-gray-600 mb-6 whitespace-pre-wrap">
                            {broadcast.message}
                        </p>

                        <div className="space-y-2 text-[14px]">
                            <div className="flex items-center gap-2">
                                <span className="font-['Nunito'] font-medium text-gray-700">Sent To:</span>
                                <span className="font-['Nunito'] text-gray-600">
                                    {broadcast.total_recipients} {formatAudience(broadcast.target_audience)}
                                </span>
                                <button className="text-[#338078] text-[12px] hover:underline">(view list)</button>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                                <span className="font-['Nunito'] font-medium text-gray-700">Delivery Date:</span>
                                <span className="font-['Nunito'] text-gray-600">{broadcast.sent_at}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="font-['Nunito'] font-medium text-[16px] text-gray-700 mb-3">Quick Action</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.post(`/admin/notifications/${broadcast.id}/resend`)}
                            className="px-5 py-2 rounded-full bg-[#338078] text-white font-['Nunito'] text-[14px] font-medium hover:bg-[#2a6b64] transition-colors"
                        >
                            Resend Message
                        </button>
                        <Link
                            href={`/admin/notifications/create?duplicate=${broadcast.id}`}
                            className="px-5 py-2 rounded-full border border-[#338078] text-[#338078] font-['Nunito'] text-[14px] font-medium hover:bg-[#338078]/5 transition-colors"
                        >
                            Edit & Re-Schedule
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this notification record?')) {
                                    router.delete(`/admin/notifications/${broadcast.id}`);
                                }
                            }}
                            className="flex items-center gap-1 text-red-500 font-['Nunito'] text-[14px] hover:text-red-600"
                        >
                            <Icon icon="mdi:close" className="w-4 h-4" />
                            Delete Notification Record
                        </button>
                    </div>
                </div>

                {/* Delivery Analytics */}
                <div className="mb-8">
                    <h2 className="font-['Nunito'] font-semibold text-[20px] text-[#101928] mb-4">
                        Delivery Analytics:
                    </h2>

                    {/* Recipients Table */}
                    <div className="bg-white rounded-lg overflow-hidden mb-6">
                        {/* Table Header */}
                        <div className="bg-[#f0f2f5] px-4 py-3 grid grid-cols-4 gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300" />
                                <span className="font-['Outfit'] text-[12px] text-[#101928]">Name</span>
                            </div>
                            <span className="font-['Outfit'] text-[12px] text-[#101928]">Email</span>
                            <span className="font-['Outfit'] text-[12px] text-[#101928] text-center">Delivery Status</span>
                            <span className="font-['Outfit'] text-[12px] text-[#101928] text-right">Role</span>
                        </div>

                        {/* Table Body */}
                        {recipients.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Icon icon="mdi:account-off-outline" className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-sm">No recipients found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recipients.data.map((recipient) => {
                                    const status = getDeliveryStatus(recipient);
                                    return (
                                        <div key={recipient.id} className="px-4 py-3 grid grid-cols-4 gap-4 items-center hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                                <span className="font-['Outfit'] text-[13px] text-[#101928]">
                                                    {recipient.name}
                                                </span>
                                            </div>
                                            <span className="font-['Outfit'] text-[13px] text-gray-500">
                                                {recipient.email}
                                            </span>
                                            <span className={cn("font-['Outfit'] text-[12px] font-medium text-center", status.color)}>
                                                {status.label}
                                            </span>
                                            <span className="font-['Outfit'] text-[13px] text-gray-500 text-right capitalize">
                                                {recipient.role}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {recipients.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                                <button
                                    onClick={() => router.get(`/admin/notifications/${broadcast.id}`, { 
                                        page: recipients.current_page - 1 
                                    })}
                                    disabled={recipients.current_page === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {recipients.current_page} of {recipients.last_page}
                                </span>
                                <button
                                    onClick={() => router.get(`/admin/notifications/${broadcast.id}`, { 
                                        page: recipients.current_page + 1 
                                    })}
                                    disabled={recipients.current_page === recipients.last_page}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#e8f5f3] rounded-[12px] p-4">
                            <p className="font-['Nunito'] text-[12px] text-[#338078] mb-1">Open Rate</p>
                            <p className="font-['Nunito'] font-bold text-[32px] text-[#101928]">{openRate}%</p>
                        </div>
                        <div className="bg-purple-50 rounded-[12px] p-4">
                            <p className="font-['Nunito'] text-[12px] text-purple-600 mb-1">Delivery Rate</p>
                            <p className="font-['Nunito'] font-bold text-[32px] text-[#101928]">{deliveryRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="pt-4">
                    <Link
                        href="/admin/notifications"
                        className="inline-flex items-center gap-2 font-['Nunito'] text-[14px] text-gray-500 hover:text-gray-700"
                    >
                        <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                        Back to Notifications
                    </Link>
                </div>
            </div>
        </>
    );
}

ShowNotification.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

