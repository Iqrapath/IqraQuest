import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface UrgentItem {
    label: string;
    count: number;
    action: string;
    route: string;
}

interface BroadcastHistory {
    id: number;
    title: string;
    message: string;
    type: string;
    target_audience: string;
    total_recipients: number;
    delivered_count: number;
    read_count: number;
    sent_at: string;
    sent_at_human: string;
    created_by: string;
}

interface ScheduledBroadcast {
    id: number;
    title: string;
    message: string;
    type: string;
    target_audience: string;
    frequency: string;
    scheduled_at: string;
    status: string;
    created_by: string;
}

interface PaginatedHistory {
    data: BroadcastHistory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface CompletedClass {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
    teacher: {
        id: number;
        name: string;
        avatar: string | null;
    };
    subject: {
        id: number;
        name: string;
    };
    start_time: string;
    end_time: string;
    duration_minutes: number;
    total_price: number;
    currency: string;
    payment_status: string;
    completed_at: string;
    completed_at_human: string;
}

interface PaginatedCompletedClasses {
    data: CompletedClass[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    urgentItems: UrgentItem[];
    history: PaginatedHistory;
    scheduled: ScheduledBroadcast[];
    completedClasses: PaginatedCompletedClasses;
    tab: string;
    filters: {
        search?: string;
        type?: string;
        audience?: string;
    };
}

type TabType = 'history' | 'scheduled' | 'completed';

export default function NotificationsIndex({ urgentItems, history, scheduled, completedClasses, tab, filters }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>((tab as TabType) || 'history');
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [audienceFilter, setAudienceFilter] = useState(filters.audience || '');

    const handleTabChange = (newTab: TabType) => {
        setActiveTab(newTab);
        router.get('/admin/notifications', { tab: newTab }, { preserveState: true });
    };

    const handleSearch = () => {
        router.get('/admin/notifications', {
            tab: activeTab,
            search,
            type: typeFilter,
            audience: audienceFilter,
        }, { preserveState: true });
    };

    const getDeliveryStatusBadge = (broadcast: BroadcastHistory) => {
        const deliveryRate = broadcast.total_recipients > 0 
            ? (broadcast.delivered_count / broadcast.total_recipients) * 100 
            : 0;
        const readRate = broadcast.delivered_count > 0 
            ? (broadcast.read_count / broadcast.delivered_count) * 100 
            : 0;

        if (readRate > 50) {
            return { label: '✅ Read', color: 'text-green-600' };
        } else if (deliveryRate === 100) {
            return { label: '✅ Delivered', color: 'text-green-600' };
        } else if (deliveryRate > 0) {
            return { label: '📬 Sent', color: 'text-blue-600' };
        }
        return { label: '⏳ Pending', color: 'text-amber-600' };
    };

    const formatAudience = (audience: string, total: number) => {
        const labels: Record<string, string> = {
            all: 'All Users',
            students: 'Students',
            teachers: 'Teachers',
            guardians: 'Guardians',
            specific: 'Specific Users',
        };
        return `${total} ${labels[audience] || audience}`;
    };

    const formatType = (type: string) => {
        const labels: Record<string, string> = {
            system: 'System',
            announcement: 'Announcement',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    return (
        <>
            <Head title="Notifications System" />

            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="font-['Nunito'] font-light text-[20px] text-gray-500">Dashboard</span>
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="font-['Nunito'] font-semibold text-[20px] text-[#141522]">Notifications System</span>
                </div>

                {/* Urgent / Action Required */}
                <div className="mb-8">
                    <h2 className="font-['Nunito'] font-semibold text-[24px] text-[#101928] mb-4">
                        Urgent / Action Required
                    </h2>
                    <div className="space-y-0">
                        {urgentItems.filter(item => item.count > 0).map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                                <span className="font-['Nunito'] font-normal text-[16px] text-[#111928]">
                                    {item.count} {item.label}
                                </span>
                                <Link
                                    href={item.route}
                                    className="font-['Nunito'] font-normal text-[12px] text-[#338078] tracking-wider hover:underline"
                                >
                                    {item.action}
                                </Link>
                            </div>
                        ))}
                        {urgentItems.filter(item => item.count > 0).length === 0 && (
                            <p className="text-gray-500 text-sm py-4">No urgent items at this time.</p>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[14px] shadow-[0px_0px_62px_0px_rgba(51,128,120,0.12)] p-3 mb-6 inline-flex">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleTabChange('history')}
                            className={cn(
                                "px-4 py-2 rounded-[12px] font-['Nunito'] text-[19px] transition-all",
                                activeTab === 'history'
                                    ? 'bg-[#338078] text-white font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 font-light'
                            )}
                        >
                            Notification History
                        </button>
                        <button
                            onClick={() => handleTabChange('scheduled')}
                            className={cn(
                                "px-4 py-2 rounded-[12px] font-['Nunito'] text-[19px] transition-all",
                                activeTab === 'scheduled'
                                    ? 'bg-[#338078] text-white font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 font-light'
                            )}
                        >
                            Scheduled Notifications
                        </button>
                        <button
                            onClick={() => handleTabChange('completed')}
                            className={cn(
                                "px-4 py-2 rounded-[12px] font-['Nunito'] text-[19px] transition-all",
                                activeTab === 'completed'
                                    ? 'bg-[#338078] text-white font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 font-light'
                            )}
                        >
                            Completed Classes
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                    {/* Header with Create Button */}
                    <div className="flex items-center justify-between">
                        <h2 className="font-['Nunito'] font-semibold text-[24px] text-[#101928]">
                            {activeTab === 'history' ? 'Notification History' : 
                             activeTab === 'scheduled' ? 'Scheduled Notifications' : 'Completed Classes'}
                        </h2>
                        <Link
                            href="/admin/notifications/create"
                            className="bg-[#338078] text-white px-6 py-3 rounded-[5px] font-['Outfit'] font-normal text-[14px] hover:bg-[#2a6b64] transition-colors"
                        >
                            Create New Notification
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 py-4">
                        <div className="flex-1 max-w-sm">
                            <div className="bg-white border border-black/30 rounded-full px-6 py-3 flex items-center gap-2">
                                <Icon icon="basil:search-solid" className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Name / Email"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-600 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {activeTab === 'history' && (
                            <>
                                <select
                                    value={audienceFilter}
                                    onChange={(e) => setAudienceFilter(e.target.value)}
                                    className="bg-white border border-[#304c57]/20 rounded-[10px] px-3 py-1 text-sm text-[#304c57]/60 outline-none"
                                >
                                    <option value="">Select Role</option>
                                    <option value="students">Student</option>
                                    <option value="teachers">Teacher</option>
                                    <option value="guardians">Guardian</option>
                                </select>

                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="bg-white border border-[#304c57]/20 rounded-[10px] px-3 py-1 text-sm text-[#304c57]/60 outline-none"
                                >
                                    <option value="">Select Status</option>
                                    <option value="system">System</option>
                                    <option value="announcement">Announcement</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </>
                        )}

                        <button
                            onClick={handleSearch}
                            className="border border-[#338078] text-[#338078] px-3 py-1 rounded-[10px] text-sm hover:bg-[#338078]/5 transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* History Tab Content */}
                    {activeTab === 'history' && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-[#f0f2f5] px-4 py-3 grid grid-cols-6 gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span className="font-['Outfit'] text-[11px] text-[#101928]">Date & Time</span>
                                </div>
                                <span className="font-['Outfit'] text-[11px] text-[#101928]">Message</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928] text-center">Sent To</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928]">Type</span>
                                <span className="font-['Outfit'] text-[9px] text-[#344054] font-medium">Delivery Status</span>
                                <span className="font-['Outfit'] text-[9px] text-[#344054] font-medium text-right">Actions</span>
                            </div>

                            {/* Table Body */}
                            {history.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Icon icon="mdi:bell-off-outline" className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-sm">No notifications sent yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {history.data.map((broadcast) => {
                                        const status = getDeliveryStatusBadge(broadcast);
                                        return (
                                            <div key={broadcast.id} className="px-4 py-3 grid grid-cols-6 gap-4 items-center hover:bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" className="rounded border-gray-300" />
                                                    <span className="font-['Outfit'] text-[11px] text-[#101928]">
                                                        {broadcast.sent_at}
                                                    </span>
                                                </div>
                                                <span className="font-['Outfit'] text-[11px] text-[#101928] truncate">
                                                    {broadcast.title}
                                                </span>
                                                <span className="font-['Outfit'] text-[11px] text-gray-500 text-center">
                                                    {formatAudience(broadcast.target_audience, broadcast.total_recipients)}
                                                </span>
                                                <span className="font-['Outfit'] text-[11px] text-[#101928]">
                                                    {formatType(broadcast.type)}
                                                </span>
                                                <span className={cn("font-['Outfit'] text-[9px] font-medium", status.color)}>
                                                    {status.label}
                                                </span>
                                                <div className="flex justify-end">
                                                    <Link
                                                        href={`/admin/notifications/${broadcast.id}`}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <Icon icon="weui:eyes-on-outlined" className="w-5 h-5 text-gray-600" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {history.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                                    <button
                                        onClick={() => router.get('/admin/notifications', { 
                                            tab: activeTab, 
                                            page: history.current_page - 1,
                                            ...filters 
                                        })}
                                        disabled={history.current_page === 1}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        Page {history.current_page} of {history.last_page}
                                    </span>
                                    <button
                                        onClick={() => router.get('/admin/notifications', { 
                                            tab: activeTab, 
                                            page: history.current_page + 1,
                                            ...filters 
                                        })}
                                        disabled={history.current_page === history.last_page}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scheduled Tab Content */}
                    {activeTab === 'scheduled' && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-[#f0f2f5] px-4 py-3 grid grid-cols-5 gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span className="font-['Outfit'] text-[11px] text-[#101928]">Scheduled Date</span>
                                </div>
                                <span className="font-['Outfit'] text-[11px] text-[#101928]">Message</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928] text-center">Target Audience</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928] text-center">Frequency</span>
                                <span className="font-['Outfit'] text-[9px] text-[#344054] font-medium text-right">Actions</span>
                            </div>

                            {/* Table Body */}
                            {scheduled.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Icon icon="mdi:calendar-clock" className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-sm">No scheduled notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {scheduled.map((broadcast) => (
                                        <div key={broadcast.id} className="px-4 py-3 grid grid-cols-5 gap-4 items-center hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                                <span className="font-['Outfit'] text-[11px] text-[#101928]">
                                                    {broadcast.scheduled_at || 'Not scheduled'}
                                                </span>
                                            </div>
                                            <span className="font-['Outfit'] text-[11px] text-[#101928] truncate">
                                                {broadcast.title}
                                            </span>
                                            <span className="font-['Outfit'] text-[11px] text-gray-500 text-center capitalize">
                                                {broadcast.target_audience === 'all' ? 'All Users' : broadcast.target_audience}
                                            </span>
                                            <span className="font-['Outfit'] text-[11px] text-[#101928] text-center capitalize">
                                                {broadcast.frequency.replace('_', '-')}
                                            </span>
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => router.post(`/admin/notifications/${broadcast.id}/send`)}
                                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Send Now"
                                                >
                                                    <Icon icon="mdi:send" className="w-4 h-4 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => router.post(`/admin/notifications/${broadcast.id}/cancel`)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancel"
                                                >
                                                    <Icon icon="mdi:close" className="w-4 h-4 text-red-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Icon icon="mdi:dots-vertical" className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completed Classes Tab */}
                    {activeTab === 'completed' && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-[#f0f2f5] px-4 py-3 grid grid-cols-7 gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span className="font-['Outfit'] text-[11px] text-[#101928]">Completed Date</span>
                                </div>
                                <span className="font-['Outfit'] text-[11px] text-[#101928]">Student</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928]">Teacher</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928]">Subject</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928] text-center">Duration</span>
                                <span className="font-['Outfit'] text-[11px] text-[#101928] text-center">Payment</span>
                                <span className="font-['Outfit'] text-[9px] text-[#344054] font-medium text-right">Actions</span>
                            </div>

                            {/* Table Body */}
                            {completedClasses.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Icon icon="mdi:school-outline" className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-sm">No completed classes found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {completedClasses.data.map((classItem) => (
                                        <div key={classItem.id} className="px-4 py-3 grid grid-cols-7 gap-4 items-center hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded border-gray-300" />
                                                <span className="font-['Outfit'] text-[11px] text-[#101928]">
                                                    {classItem.completed_at}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {classItem.student.avatar ? (
                                                        <img src={classItem.student.avatar} alt={classItem.student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                            {classItem.student.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-['Outfit'] text-[11px] text-[#101928] truncate">
                                                    {classItem.student.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {classItem.teacher.avatar ? (
                                                        <img src={classItem.teacher.avatar} alt={classItem.teacher.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                            {classItem.teacher.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-['Outfit'] text-[11px] text-[#101928] truncate">
                                                    {classItem.teacher.name}
                                                </span>
                                            </div>
                                            <span className="font-['Outfit'] text-[11px] text-[#101928]">
                                                {classItem.subject.name}
                                            </span>
                                            <span className="font-['Outfit'] text-[11px] text-gray-500 text-center">
                                                {classItem.duration_minutes} min
                                            </span>
                                            <div className="text-center">
                                                <span className={cn(
                                                    "font-['Outfit'] text-[10px] px-2 py-1 rounded-full",
                                                    classItem.payment_status === 'released' && 'bg-green-100 text-green-700',
                                                    classItem.payment_status === 'held' && 'bg-amber-100 text-amber-700',
                                                    classItem.payment_status === 'refunded' && 'bg-red-100 text-red-700',
                                                    classItem.payment_status === 'disputed' && 'bg-orange-100 text-orange-700',
                                                    !['released', 'held', 'refunded', 'disputed'].includes(classItem.payment_status) && 'bg-gray-100 text-gray-700'
                                                )}>
                                                    {classItem.payment_status.charAt(0).toUpperCase() + classItem.payment_status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        // TODO: Open send notification modal for this student
                                                    }}
                                                    className="p-2 hover:bg-[#338078]/10 rounded-lg transition-colors"
                                                    title="Send Notification"
                                                >
                                                    <Icon icon="mdi:bell-outline" className="w-4 h-4 text-[#338078]" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Icon icon="mdi:dots-vertical" className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {completedClasses.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                                    <button
                                        onClick={() => router.get('/admin/notifications', { 
                                            tab: activeTab, 
                                            page: completedClasses.current_page - 1,
                                            ...filters 
                                        })}
                                        disabled={completedClasses.current_page === 1}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        Page {completedClasses.current_page} of {completedClasses.last_page}
                                    </span>
                                    <button
                                        onClick={() => router.get('/admin/notifications', { 
                                            tab: activeTab, 
                                            page: completedClasses.current_page + 1,
                                            ...filters 
                                        })}
                                        disabled={completedClasses.current_page === completedClasses.last_page}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

NotificationsIndex.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

