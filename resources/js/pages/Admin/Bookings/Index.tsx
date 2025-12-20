import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import CancelBookingModal from './Components/CancelBookingModal';
import RescheduleBookingModal from './Components/RescheduleBookingModal';
import ReassignTeacherModal from './Components/ReassignTeacherModal';
import ApproveBookingModal from './Components/ApproveBookingModal';
import BookingDetailsModal from './Components/BookingDetailsModal';

interface Booking {
    id: number;
    student: { id: number; name: string; email: string; avatar: string | null };
    teacher: { id: number; name: string; avatar: string | null };
    subject: { id: number; name: string };
    formatted_date: string;
    formatted_time: string;
    start_time: string;
    end_time: string;
    status: string;
    display_status: string;
    payment_status: string;
    total_price: number;
    currency: string;
}

interface Props {
    bookings: {
        data: Booking[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    teachers: { id: number; name: string }[];
    subjects: { id: number; name: string }[];
    counts: { all: number; upcoming: number; completed: number; missed: number; cancelled: number; pending: number; awaiting_approval: number };
    filters: { search: string; status: string; teacher_id: string; subject_id: string; date_from: string; date_to: string };
}

export default function BookingsIndex({ bookings, teachers, subjects, counts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [teacherId, setTeacherId] = useState(filters.teacher_id || 'all');
    const [subjectId, setSubjectId] = useState(filters.subject_id || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const handleSearch = () => {
        setIsLoading(true);
        router.get('/admin/bookings', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            teacher_id: teacherId !== 'all' ? teacherId : undefined,
            subject_id: subjectId !== 'all' ? subjectId : undefined,
        }, { preserveState: true, onFinish: () => setIsLoading(false) });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        setIsLoading(true);
        router.get('/admin/bookings', {
            search: search || undefined,
            status: newStatus !== 'all' ? newStatus : undefined,
            teacher_id: teacherId !== 'all' ? teacherId : undefined,
            subject_id: subjectId !== 'all' ? subjectId : undefined,
        }, { preserveState: true, onFinish: () => setIsLoading(false) });
    };

    const handleApprove = (booking: Booking) => { setSelectedBooking(booking); setShowApproveModal(true); };
    const handleCancel = (booking: Booking) => { setSelectedBooking(booking); setShowCancelModal(true); };
    const handleReschedule = (booking: Booking) => { setSelectedBooking(booking); setShowRescheduleModal(true); };
    const handleReassign = (booking: Booking) => { setSelectedBooking(booking); setShowReassignModal(true); };
    const handleViewDetails = (booking: Booking) => { setSelectedBooking(booking); setShowDetailsModal(true); };
    const toggleSelectAll = () => setSelectedIds(selectedIds.length === bookings.data.length ? [] : bookings.data.map(b => b.id));
    const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const getStatusBadge = (displayStatus: string) => {
        const config: Record<string, { color: string; bgColor: string; icon?: string; dot?: boolean; label?: string }> = {
            upcoming: { color: 'text-blue-600', bgColor: 'bg-blue-600', dot: true },
            completed: { color: 'text-green-600', bgColor: 'bg-green-600', icon: 'mdi:check-circle' },
            missed: { color: 'text-orange-500', bgColor: 'bg-orange-500', dot: true },
            cancelled: { color: 'text-red-500', bgColor: 'bg-red-500', icon: 'mdi:close-circle' },
            pending: { color: 'text-yellow-600', bgColor: 'bg-yellow-500', dot: true },
            awaiting_approval: { color: 'text-amber-600', bgColor: 'bg-amber-500', icon: 'mdi:clock-outline', label: 'Awaiting Approval' },
            rescheduling: { color: 'text-purple-600', bgColor: 'bg-purple-600', icon: 'mdi:calendar-clock' },
        };
        const c = config[displayStatus] || { color: 'text-gray-500', bgColor: 'bg-gray-500' };
        const label = c.label || displayStatus.replace('_', ' ');
        return (
            <span className={`inline-flex items-center gap-1.5 font-medium capitalize ${c.color}`}>
                {c.dot && <span className={`w-2 h-2 rounded-full ${c.bgColor}`} />}
                {c.icon && <Icon icon={c.icon} className="w-4 h-4" />}
                {label}
            </span>
        );
    };

    const statusTabs = [
        { key: 'all', label: 'All', count: counts.all },
        { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
        { key: 'awaiting_approval', label: 'Awaiting Approval', count: counts.awaiting_approval },
        { key: 'completed', label: 'Completed', count: counts.completed },
        { key: 'missed', label: 'Missed', count: counts.missed },
        { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
        { key: 'pending', label: 'Pending', count: counts.pending },
    ];

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title="Manage Bookings" />
            <div className="flex flex-col gap-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <Link href="/admin/dashboard" className="hover:text-gray-700">Dashboard</Link>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#338078]" />
                    <span className="text-[#192020] font-bold">Manage Bookings</span>
                </div>
                <h1 className="font-['Poppins'] font-medium text-[clamp(1.25rem,2.5vw,1.5rem)] text-[#192020]">Booking Overview</h1>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[250px] max-w-md">
                        <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by Name / Email" className="w-full h-11 pl-11 pr-4 rounded-full border border-gray-200 focus:border-[#338078] focus:ring-1 focus:ring-[#338078] font-['Nunito'] text-sm" />
                    </div>
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="h-11 w-[160px] rounded-full border-gray-200 font-['Nunito']">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusTabs.map(tab => (
                                <SelectItem key={tab.key} value={tab.key}>
                                    {tab.label} ({tab.count})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Combobox
                        options={[{ value: 'all', label: 'All Subjects' }, ...subjects.map(s => ({ value: String(s.id), label: s.name }))]}
                        value={subjectId}
                        onChange={(v) => setSubjectId(v || 'all')}
                        placeholder="Select Subject"
                        searchPlaceholder="Search subjects..."
                        emptyText="No subject found."
                        className="h-11 w-[180px] rounded-full border-gray-200 font-['Nunito']"
                    />
                    <Combobox
                        options={[{ value: 'all', label: 'All Teachers' }, ...teachers.map(t => ({ value: String(t.id), label: t.name }))]}
                        value={teacherId}
                        onChange={(v) => setTeacherId(v || 'all')}
                        placeholder="Select Teacher"
                        searchPlaceholder="Search teachers..."
                        emptyText="No teacher found."
                        className="h-11 w-[180px] rounded-full border-[#338078] text-[#338078] font-['Nunito']"
                    />
                    <button onClick={handleSearch} disabled={isLoading}
                        className="h-11 px-6 rounded-full border border-[#338078] text-[#338078] font-['Nunito'] font-medium hover:bg-[#338078] hover:text-white transition-colors disabled:opacity-50">
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[20px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 w-12 text-left">
                                        <Checkbox checked={bookings.data.length > 0 && selectedIds.length === bookings.data.length} onCheckedChange={toggleSelectAll} />
                                    </th>
                                    <th className="px-6 py-4 text-left font-['Nunito'] font-semibold text-gray-600 text-sm">Student</th>
                                    <th className="px-6 py-4 text-left font-['Nunito'] font-semibold text-gray-600 text-sm">Teacher</th>
                                    <th className="px-6 py-4 text-left font-['Nunito'] font-semibold text-gray-600 text-sm">Subject</th>
                                    <th className="px-6 py-4 text-left font-['Nunito'] font-semibold text-gray-600 text-sm">Date & Time</th>
                                    <th className="px-6 py-4 text-left font-['Nunito'] font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="px-6 py-4 text-left font-['Nunito'] font-semibold text-gray-600 text-sm">Price</th>
                                    <th className="px-6 py-4 text-right font-['Nunito'] font-semibold text-gray-600 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.data.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No bookings found</td></tr>
                                ) : (
                                    bookings.data.map((booking) => (
                                        <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="px-6 py-4"><Checkbox checked={selectedIds.includes(booking.id)} onCheckedChange={() => toggleSelect(booking.id)} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {booking.student.avatar ? <img src={booking.student.avatar} alt="" className="w-full h-full object-cover" /> : <Icon icon="mdi:account" className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-['Nunito'] font-semibold text-gray-900">{booking.student.name}</p>
                                                        <p className="font-['Nunito'] text-sm text-gray-500">{booking.student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {booking.teacher.avatar ? <img src={booking.teacher.avatar} alt="" className="w-full h-full object-cover" /> : <Icon icon="mdi:account" className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <p className="font-['Nunito'] font-medium text-gray-900">{booking.teacher.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="font-['Nunito'] text-gray-700">{booking.subject.name}</span></td>
                                            <td className="px-6 py-4">
                                                <p className="font-['Nunito'] font-medium text-gray-900">{booking.formatted_date}</p>
                                                <p className="font-['Nunito'] text-sm text-gray-500">{booking.formatted_time}</p>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(booking.display_status)}</td>
                                            <td className="px-6 py-4"><span className="font-['Nunito'] font-semibold text-gray-900">{booking.currency} {booking.total_price.toFixed(2)}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Icon icon="mdi:dots-vertical" className="w-5 h-5 text-gray-500" /></button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[220px] p-2 rounded-2xl shadow-lg">
                                                        {['pending', 'awaiting_approval'].includes(booking.status) && (
                                                            <DropdownMenuItem onClick={() => handleApprove(booking)} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                                                                <span className="font-['Nunito'] text-base">Approve Sessions</span>
                                                                <Icon icon="mdi:check-decagram" className="w-6 h-6 text-green-500" />
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleViewDetails(booking)} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                                                            <span className="font-['Nunito'] text-base">View Details</span>
                                                            <Icon icon="carbon:order-details" className="w-6 h-6 text-base" />
                                                        </DropdownMenuItem>
                                                        {!['cancelled', 'completed'].includes(booking.status) && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleReschedule(booking)} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                                                                    <span className="font-['Nunito'] text-base">Reschedule</span>
                                                                    <Icon icon="basil:edit-outline" className="w-6 h-6 text-base" />
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleReassign(booking)} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                                                                    <span className="font-['Nunito'] text-base">Reassign Teacher</span>
                                                                    <Icon icon="mdi:account-switch-outline" className="w-6 h-6 text-base" />
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                                                                    <span className="font-['Nunito'] text-base">Message</span>
                                                                    <Icon icon="tabler:message" className="w-6 h-6 text-base" />
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleCancel(booking)} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                                                                    <span className="font-['Nunito'] text-base text-red-500">Cancel Sessions</span>
                                                                    <Icon icon="mdi:close-circle-outline" className="w-6 h-6 text-red-500" />
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {bookings.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="font-['Nunito'] text-sm text-gray-500">Showing page {bookings.current_page} of {bookings.last_page} ({bookings.total} total)</p>
                            <div className="flex items-center gap-1">
                                {/* Previous Button */}
                                <Link
                                    href={bookings.links[0]?.url || '#'}
                                    className={`flex items-center justify-center w-9 h-9 rounded-lg border font-['Nunito'] text-sm transition-colors ${
                                        bookings.links[0]?.url
                                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                            : 'border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                                </Link>
                                {/* Page Numbers */}
                                {bookings.links.slice(1, -1).map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg border font-['Nunito'] text-sm transition-colors ${
                                            link.active
                                                ? 'bg-[#338078] text-white border-[#338078]'
                                                : link.url
                                                    ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    : 'border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                                {/* Next Button */}
                                <Link
                                    href={bookings.links[bookings.links.length - 1]?.url || '#'}
                                    className={`flex items-center justify-center w-9 h-9 rounded-lg border font-['Nunito'] text-sm transition-colors ${
                                        bookings.links[bookings.links.length - 1]?.url
                                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                            : 'border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CancelBookingModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} booking={selectedBooking} />
            <RescheduleBookingModal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} booking={selectedBooking} />
            <ReassignTeacherModal isOpen={showReassignModal} onClose={() => setShowReassignModal(false)} booking={selectedBooking} teachers={teachers} />
            <ApproveBookingModal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} booking={selectedBooking} />
            <BookingDetailsModal 
                isOpen={showDetailsModal} 
                onClose={() => setShowDetailsModal(false)} 
                booking={selectedBooking}
                onReschedule={handleReschedule}
                onReassign={handleReassign}
                onCancel={handleCancel}
            />
        </AdminLayout>
    );
}
