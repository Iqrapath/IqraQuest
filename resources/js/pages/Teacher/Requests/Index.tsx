import React, { useState, useMemo } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { RequestActionModal } from './Components/RequestActionModal';

interface Request {
    id: number;
    status: string;
    parent_booking_id: number | null;
    student: {
        name: string;
        avatar: string;
        level: string;
    };
    subject: {
        name: string;
    };
    start_time: string;
    end_time: string;
    total_price: number | string;
    currency: string;
    days_requested: string;
    time_range: string;
    is_reschedule?: boolean;
    new_days_requested?: string;
    new_time_range?: string;
    reschedule_reason?: string;
}

interface Props {
    requests: Request[];
    subjects: { id: number; name: string }[];
}

export default function TeacherRequestsIndex({ requests, subjects }: Props) {
    const { auth } = usePage<any>().props;

    // Filter State
    const [subjectFilter, setSubjectFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');
    const [budgetFilter, setBudgetFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');

    // Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: 'accept' | 'decline';
        requestIds: number[];
        isSeries?: boolean;
    }>({
        isOpen: false,
        type: 'accept',
        requestIds: [],
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Grouping Logic
    const groupedRequests = useMemo(() => {
        const groups: { [key: string]: Request[] } = {};

        requests.forEach(request => {
            // Group by parent_booking_id if available, otherwise use a fuzzy key
            // Fuzzy key: teacher_id (implied) + student_name + subject_name + time_range
            const groupKey = request.parent_booking_id
                ? `parent-${request.parent_booking_id}`
                : `${request.student.name}-${request.subject.name}-${request.time_range}`;

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(request);
        });

        // Convert groups back to a flat array of "grouped request objects"
        return Object.values(groups).map(group => {
            // Sort by start_time so the first session is always the "lead"
            const sortedGroup = [...group].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

            return {
                ...sortedGroup[0], // Main data from the first session
                allIds: sortedGroup.map(r => r.id),
                sessionCount: sortedGroup.length,
                isSeries: sortedGroup.length > 1,
                totalPrice: sortedGroup.reduce((sum, r) => sum + Number(r.total_price), 0),
                sessions: sortedGroup.map(r => r.days_requested)
            };
        });
    }, [requests]);

    const filteredRequests = useMemo(() => {
        return groupedRequests.filter(request => {
            if (subjectFilter && request.subject.name !== subjectFilter) return false;

            if (timeFilter === 'morning' && !request.time_range.includes('AM')) return false;
            if (timeFilter === 'evening' && !request.time_range.includes('PM')) return false;

            // Budget filter based on per-session price (original logic)
            const price = Number(request.total_price);
            if (budgetFilter === 'low' && price > 30) return false;
            if (budgetFilter === 'medium' && (price <= 30 || price > 60)) return false;
            if (budgetFilter === 'high' && price <= 60) return false;

            return true;
        });
    }, [groupedRequests, subjectFilter, timeFilter, budgetFilter]);

    const handleAccept = (ids: number[], isSeries: boolean) => {
        setActionModal({ isOpen: true, type: 'accept', requestIds: ids, isSeries });
    };

    const handleDecline = (ids: number[], isSeries: boolean) => {
        setActionModal({ isOpen: true, type: 'decline', requestIds: ids, isSeries });
    };

    const handleConfirmAction = () => {
        if (actionModal.requestIds.length === 0) return;

        setIsProcessing(true);

        // Find the "lead" request to check status
        const leadRequest = requests.find(r => r.id === actionModal.requestIds[0]);
        if (!leadRequest) {
            setIsProcessing(false);
            return;
        }

        // Handle Reschedule Requests (usually single, but routed differently)
        if (leadRequest.status === 'rescheduling') {
            const url = actionModal.type === 'accept'
                ? `/teacher/requests/${leadRequest.id}/reschedule/accept`
                : `/teacher/requests/${leadRequest.id}/reschedule/reject`;

            router.post(url, {}, {
                onFinish: () => {
                    setIsProcessing(false);
                    setActionModal({ ...actionModal, isOpen: false });
                }
            });
            return;
        }

        // Handle Bulk actions for series
        if (actionModal.requestIds.length > 1) {
            const url = actionModal.type === 'accept'
                ? '/teacher/requests/bulk-accept'
                : '/teacher/requests/bulk-reject';

            router.post(url, { booking_ids: actionModal.requestIds }, {
                onFinish: () => {
                    setIsProcessing(false);
                    setActionModal({ ...actionModal, isOpen: false });
                }
            });
            return;
        }

        // Single standard booking accept/reject
        const url = actionModal.type === 'accept'
            ? `/teacher/requests/${leadRequest.id}/accept`
            : `/teacher/requests/${leadRequest.id}/reject`;

        router.post(url, {}, {
            onFinish: () => {
                setIsProcessing(false);
                setActionModal({ ...actionModal, isOpen: false });
            }
        });
    };

    const clearFilters = () => {
        setSubjectFilter('');
        setTimeFilter('all');
        setBudgetFilter('all');
        setLanguageFilter('all');
    };

    return (
        <>
            <Head title="Booking Requests" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#192020] font-primary mb-2">Open Requests</h1>
                    <p className="text-gray-600">
                        New students are waiting to learn from you. Accept requests and start guiding them on their Quranic journey.
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 mb-10 flex flex-wrap items-center gap-4">
                    {/* Subject Filter */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-400 mb-1.5 ml-1">Subject</label>
                        <Combobox
                            options={subjects.map(s => ({ value: s.name, label: s.name }))}
                            value={subjectFilter}
                            onChange={(val) => setSubjectFilter(val)}
                            placeholder="All Subjects"
                            className="w-full border-gray-200 rounded-xl bg-gray-50/50"
                        />
                    </div>

                    {/* Time Filter */}
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs text-gray-400 mb-1.5 ml-1">Time Preference</label>
                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                            <SelectTrigger className="w-full border-gray-200 rounded-xl bg-gray-50/50">
                                <SelectValue placeholder="Any Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Time</SelectItem>
                                <SelectItem value="morning">Morning (AM)</SelectItem>
                                <SelectItem value="evening">Evening (PM)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-end h-full pb-[2px] gap-2">
                        {(subjectFilter || timeFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="text-gray-400 hover:text-gray-600 px-3 py-2.5 text-sm font-medium transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button className="bg-[#358D83] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#2b756d] transition-colors shadow-lg shadow-teal-900/10">
                            Apply
                        </button>
                    </div>
                </div>

                {/* Subheader */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Choose the best matches</h2>
                        <p className="text-gray-500 text-sm mt-1">{filteredRequests.length} Groups</p>
                    </div>
                </div>

                {/* Grid */}
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Icon icon="mdi:calendar-check-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-500">No open requests</h3>
                        <p className="text-gray-400">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
                                {request.isSeries && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-[#358D83] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                            {request.sessionCount} Session Series
                                        </div>
                                    </div>
                                )}

                                {/* Student Header */}
                                <div className="flex gap-3 mb-4">
                                    <Avatar className="w-12 h-12 rounded-full border border-gray-100">
                                        <AvatarImage
                                            src={request.student.avatar ? `/storage/${request.student.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(request.student.name)}&background=random`}
                                        />
                                        <AvatarFallback>{request.student.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-[#192020]">{request.student.name}</h3>
                                        <p className="text-xs text-gray-500">{request.student.level}</p>
                                    </div>
                                </div>

                                {/* Subject Note */}
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-grow">
                                    I need a {request.subject.name} teacher for this {request.isSeries ? 'recurring series' : 'session'}.
                                </p>

                                {/* Details Grid */}
                                <div className="space-y-3 mb-6">
                                    <div className="bg-gray-50/80 rounded-xl p-3 space-y-2">
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                            <span className="text-gray-400">Subject</span>
                                            <span className="font-bold text-[#358D83]">{request.subject.name}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                            <span className="text-gray-400">Time</span>
                                            <span className="font-medium text-gray-800">{request.time_range}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm items-start">
                                            <span className="text-gray-400">{request.isSeries ? 'Dates' : 'Date'}</span>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{request.days_requested}</span>
                                                {request.isSeries && (
                                                    <span className="text-[11px] text-[#358D83] mt-0.5">
                                                        + {request.sessionCount - 1} more sessions
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Price & Actions */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                    <div>
                                        <p className="text-[#358D83] font-bold text-lg leading-none">
                                            {request.currency === 'USD' ? '$' : '₦'}{Math.floor(request.totalPrice)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">
                                            {request.isSeries ? `Total for ${request.sessionCount} sessions` : 'Per Session'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDecline(request.allIds, request.isSeries)}
                                            className="px-4 py-2 rounded-full border border-[#358D83] text-[#358D83] font-bold text-sm hover:bg-teal-50 transition-colors"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleAccept(request.allIds, request.isSeries)}
                                            className="px-6 py-2 rounded-full bg-[#358D83] text-white font-bold text-sm hover:bg-[#2b756d] transition-colors shadow-lg shadow-teal-900/10"
                                        >
                                            Accept {request.isSeries ? 'Series' : ''}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RequestActionModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={handleConfirmAction}
                type={actionModal.type}
                isProcessing={isProcessing}
                isSeries={actionModal.isSeries}
            />
        </>
    );
}

TeacherRequestsIndex.layout = (page: React.ReactNode) => <TeacherLayout children={page} hideRightSidebar={true} />;

