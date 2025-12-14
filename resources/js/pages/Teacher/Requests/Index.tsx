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
    total_price: number;
    currency: string;
    days_requested: string;
    time_range: string;
}

interface Props {
    requests: Request[];
    subjects: { id: number; name: string }[];
}

export default function TeacherRequestsIndex({ requests, subjects }: Props) {
    const { auth } = usePage<any>().props;

    // Filter State
    const [subjectFilter, setSubjectFilter] = useState(''); // Empty string for 'all' in Combobox logic if needed
    const [timeFilter, setTimeFilter] = useState('all');
    const [budgetFilter, setBudgetFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');

    // Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: 'accept' | 'decline';
        requestId: number | null;
    }>({
        isOpen: false,
        type: 'accept',
        requestId: null,
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Derived Filters
    const uniqueSubjects = useMemo(() => {
        const subjects = requests.map(r => r.subject.name);
        return Array.from(new Set(subjects));
    }, [requests]);

    const filteredRequests = useMemo(() => {
        return requests.filter(request => {
            // Subject Filter
            // Subject Filter
            if (subjectFilter && request.subject.name !== subjectFilter) return false;

            // Time Filter (Simple logic: checks if time_range includes "AM" or "PM" based on filter)
            // Ideally backend provides standardized time blocks, but string matching works for MVP
            if (timeFilter === 'morning' && !request.time_range.includes('AM')) return false;
            if (timeFilter === 'evening' && !request.time_range.includes('PM')) return false;

            // Budget Filter
            if (budgetFilter === 'low' && request.total_price > 30) return false;
            if (budgetFilter === 'medium' && (request.total_price <= 30 || request.total_price > 60)) return false;
            if (budgetFilter === 'high' && request.total_price <= 60) return false;

            // Language Filter (Placeholder logic since Language isn't in Request Type yet)
            // if (languageFilter !== 'all' && request.language !== languageFilter) return false;

            return true;
        });
    }, [requests, subjectFilter, timeFilter, budgetFilter, languageFilter]);

    const handleAccept = (firstName: string, id: number) => {
        setActionModal({ isOpen: true, type: 'accept', requestId: id });
    };

    const handleDecline = (firstName: string, id: number) => {
        setActionModal({ isOpen: true, type: 'decline', requestId: id });
    };

    const handleConfirmAction = () => {
        if (!actionModal.requestId) return;

        setIsProcessing(true);
        const url = actionModal.type === 'accept'
            ? `/teacher/requests/${actionModal.requestId}/accept`
            : `/teacher/requests/${actionModal.requestId}/reject`;

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

            <div className="max-w-7xl mx-auto py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#192020] font-primary mb-2">Open Requests</h1>
                    <p className="text-gray-600">
                        New students are waiting to learn from you. Accept requests and start guiding them on their Quranic journey.
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 mb-10 flex flex-wrap items-center gap-4">

                    {/* Subject Filter - Combobox */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-400 mb-1.5 ml-1">Subject</label>
                        <Combobox
                            options={subjects.map(s => ({ value: s.name, label: s.name }))}
                            value={subjectFilter}
                            onChange={(val) => setSubjectFilter(val)}
                            placeholder="All Subjects"
                            searchPlaceholder="Search subject..."
                            className="w-full border-gray-200 rounded-xl bg-gray-50/50 justify-between"
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

                    {/* Budget Filter */}
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs text-gray-400 mb-1.5 ml-1">Budget</label>
                        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                            <SelectTrigger className="w-full border-gray-200 rounded-xl bg-gray-50/50">
                                <SelectValue placeholder="Any Budget" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Budget</SelectItem>
                                <SelectItem value="low">Low ($0 - $30)</SelectItem>
                                <SelectItem value="medium">Medium ($30 - $60)</SelectItem>
                                <SelectItem value="high">High ($60+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Language Filter */}
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs text-gray-400 mb-1.5 ml-1">Language</label>
                        <Select value={languageFilter} onValueChange={setLanguageFilter}>
                            <SelectTrigger className="w-full border-gray-200 rounded-xl bg-gray-50/50">
                                <SelectValue placeholder="All Languages" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Languages</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Arabic">Arabic</SelectItem>
                                <SelectItem value="Urdu">Urdu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-end h-full pb-[2px] gap-2">
                        {(subjectFilter || timeFilter !== 'all' || budgetFilter !== 'all' || languageFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="text-gray-400 hover:text-gray-600 px-3 py-2.5 text-sm font-medium transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        {/* Apply button is redundant with live filtering, but kept for Figma fidelity if needed, or repurposed as a 'Refresh' */}
                        <button className="bg-[#358D83] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#2b756d] transition-colors shadow-lg shadow-teal-900/10">
                            Apply
                        </button>
                    </div>
                </div>

                {/* Subheader */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Choose the best matches</h2>
                        <p className="text-gray-500 text-sm mt-1">{filteredRequests.length} Results</p>
                    </div>
                    <button className="text-[#358D83] font-bold text-sm hover:underline">See all</button>
                </div>

                {/* Grid */}
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Icon icon="mdi:calendar-check-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-500">No open requests</h3>
                        <p className="text-gray-400">
                            {requests.length > 0 ? "Try adjusting your filters." : "Requests sent by students will appear here."}
                        </p>
                        {requests.length > 0 && (
                            <button onClick={clearFilters} className="mt-4 text-[#358D83] font-bold hover:underline">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                                {/* Header: Avatar & Heart */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <Avatar className="w-12 h-12 rounded-full border border-gray-100">
                                                <AvatarImage
                                                    src={request.student.avatar ? `/storage/${request.student.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(request.student.name)}&background=random`}
                                                />
                                                <AvatarFallback>{request.student.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            {/* Online Indicator (Optional) */}
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#192020]">{request.student.name}</h3>
                                            <p className="text-xs text-gray-500">{request.student.level}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Icon icon="mdi:heart-outline" className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Subject Note */}
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-grow">
                                    I need a {request.subject.name} teacher to help with fluency and pronunciation.
                                </p>

                                {/* Details Grid */}
                                <div className="space-y-3 mb-6">
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-400">Requested Days</span>
                                        <span className="font-medium text-gray-800">{request.days_requested}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-400">Time</span>
                                        <span className="font-medium text-gray-800">{request.time_range}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-400">Subject</span>
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold inline-block w-fit">
                                            {request.subject.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer: Price & Actions */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                    <div>
                                        <p className="text-[#358D83] font-bold text-lg">
                                            {request.currency === 'USD' ? '$' : '₦'}{Math.floor(request.total_price)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Per Session</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDecline(request.student.name, request.id)}
                                            className="px-4 py-2 rounded-full border border-[#358D83] text-[#358D83] font-bold text-sm hover:bg-teal-50 transition-colors"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleAccept(request.student.name, request.id)}
                                            className="px-6 py-2 rounded-full bg-[#358D83] text-white font-bold text-sm hover:bg-[#2b756d] transition-colors shadow-lg shadow-teal-900/10"
                                        >
                                            Accept
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
            />
        </>
    );
}

TeacherRequestsIndex.layout = (page: React.ReactNode) => <TeacherLayout children={page} hideRightSidebar={true} />;

