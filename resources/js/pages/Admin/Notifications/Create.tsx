import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Props {
    audienceCounts: {
        all: number;
        students: number;
        teachers: number;
        guardians: number;
    };
    duplicateData?: {
        title: string;
        message: string;
        type: 'system' | 'announcement' | 'custom';
        target_audience: 'all' | 'students' | 'teachers' | 'guardians' | 'specific';
        target_user_ids: number[];
        frequency: 'one_time' | 'daily' | 'weekly';
    } | null;
}

interface UserSearchResult {
    id: number;
    name: string;
    email: string;
    role: string;
}

const TEMPLATE_VARIABLES = [
    { key: '[Student_Name]', description: 'Student\'s full name' },
    { key: '[Teacher_Name]', description: 'Teacher\'s full name' },
    { key: '[Guardian_Name]', description: 'Guardian\'s full name' },
    { key: '[Plan_Name]', description: 'Subscription plan name' },
    { key: '[Amount_Paid]', description: 'Payment amount' },
    { key: '[Date]', description: 'Current date' },
    { key: '[Class_Time]', description: 'Scheduled class time' },
    { key: '[Class_Date]', description: 'Scheduled class date' },
];

export default function CreateNotification({ audienceCounts, duplicateData }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showVariables, setShowVariables] = useState(false);
    const [showSchedule, setShowSchedule] = useState(!!duplicateData); // Show schedule options when editing
    const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        title: duplicateData?.title || '',
        message: duplicateData?.message || '',
        type: duplicateData?.type || 'announcement' as 'system' | 'announcement' | 'custom',
        target_audience: duplicateData?.target_audience || 'all' as 'all' | 'students' | 'teachers' | 'guardians' | 'specific',
        target_user_ids: duplicateData?.target_user_ids || [] as number[],
        frequency: duplicateData?.frequency || 'one_time' as 'one_time' | 'daily' | 'weekly',
        scheduled_at: '',
        send_now: !duplicateData, // Don't auto-send when editing/duplicating
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/notifications', {
            preserveScroll: true,
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/admin/notifications/search-users?search=${encodeURIComponent(query)}`);
            const users = await response.json();
            setSearchResults(users);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addUser = (user: UserSearchResult) => {
        if (!data.target_user_ids.includes(user.id)) {
            setData('target_user_ids', [...data.target_user_ids, user.id]);
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeUser = (userId: number) => {
        setData('target_user_ids', data.target_user_ids.filter(id => id !== userId));
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const insertVariable = (variable: string) => {
        setData('message', data.message + variable);
        setShowVariables(false);
    };

    const getAudienceCount = () => {
        if (data.target_audience === 'specific') {
            return data.target_user_ids.length;
        }
        return audienceCounts[data.target_audience] || 0;
    };

    return (
        <>
            <Head title="Create Notification" />

            <div className="max-w-4xl mx-auto">
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
                    <span className="font-['Nunito'] font-semibold text-[20px] text-[#141522]">
                        {duplicateData ? 'Edit & Re-Schedule' : 'Create New'}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Notification Details Card */}
                    <div className="bg-white rounded-[22px] shadow-[0px_0px_11px_0px_rgba(51,128,120,0.05)] p-6">
                        <h2 className="font-['Nunito'] font-semibold text-[18px] text-[#101928] mb-6">
                            Notification Details
                        </h2>

                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block font-['Nunito'] text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter notification title"
                                    className="w-full px-4 py-3 rounded-[12px] border border-gray-200 focus:border-[#338078] focus:ring-1 focus:ring-[#338078] outline-none transition-all text-sm"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-['Nunito'] text-sm font-medium text-gray-700">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowVariables(!showVariables)}
                                            className="text-[12px] text-[#338078] hover:underline flex items-center gap-1"
                                        >
                                            <Icon icon="mdi:code-brackets" className="w-4 h-4" />
                                            Insert Variable
                                        </button>
                                        
                                        {showVariables && (
                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64">
                                                <div className="p-2 border-b border-gray-100">
                                                    <p className="text-xs text-gray-500">Click to insert</p>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    {TEMPLATE_VARIABLES.map((v) => (
                                                        <button
                                                            key={v.key}
                                                            type="button"
                                                            onClick={() => insertVariable(v.key)}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <span className="font-mono text-[12px] text-[#338078]">{v.key}</span>
                                                            <p className="text-[10px] text-gray-400">{v.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Enter notification message"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-[12px] border border-gray-200 focus:border-[#338078] focus:ring-1 focus:ring-[#338078] outline-none transition-all text-sm resize-none"
                                />
                                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block font-['Nunito'] text-sm font-medium text-gray-700 mb-2">
                                    Notification Type
                                </label>
                                <div className="flex gap-3">
                                    {(['system', 'announcement', 'custom'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setData('type', type)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                                                data.type === type
                                                    ? 'bg-[#338078] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience Card */}
                    <div className="bg-white rounded-[22px] shadow-[0px_0px_11px_0px_rgba(51,128,120,0.05)] p-6">
                        <h2 className="font-['Nunito'] font-semibold text-[18px] text-[#101928] mb-6">
                            Target Audience
                        </h2>

                        <div className="space-y-4">
                            {/* Audience Selection */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {(['all', 'students', 'teachers', 'guardians', 'specific'] as const).map((audience) => (
                                    <button
                                        key={audience}
                                        type="button"
                                        onClick={() => setData('target_audience', audience)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 p-4 rounded-[12px] border-2 transition-all",
                                            data.target_audience === audience
                                                ? 'border-[#338078] bg-[#338078]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        <Icon
                                            icon={
                                                audience === 'all' ? 'mdi:account-group' :
                                                audience === 'students' ? 'mdi:school' :
                                                audience === 'teachers' ? 'mdi:human-male-board' :
                                                audience === 'guardians' ? 'mdi:account-child' :
                                                'mdi:account-search'
                                            }
                                            className={cn(
                                                "w-6 h-6",
                                                data.target_audience === audience ? 'text-[#338078]' : 'text-gray-400'
                                            )}
                                        />
                                        <span className={cn(
                                            "text-xs font-medium capitalize",
                                            data.target_audience === audience ? 'text-[#338078]' : 'text-gray-600'
                                        )}>
                                            {audience === 'all' ? 'All Users' : audience}
                                        </span>
                                        {audience !== 'specific' && (
                                            <span className="text-[10px] text-gray-400">
                                                {audienceCounts[audience]} users
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Specific Users Search */}
                            {data.target_audience === 'specific' && (
                                <div className="mt-4 space-y-3">
                                    <div className="relative">
                                        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                searchUsers(e.target.value);
                                            }}
                                            placeholder="Search users by name or email..."
                                            className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-gray-200 focus:border-[#338078] focus:ring-1 focus:ring-[#338078] outline-none transition-all text-sm"
                                        />
                                        {isSearching && (
                                            <Icon icon="mdi:loading" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                                        )}
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="border border-gray-200 rounded-[12px] max-h-48 overflow-y-auto">
                                            {searchResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => addUser(user)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[#338078]/10 flex items-center justify-center">
                                                        <Icon icon="mdi:account" className="w-4 h-4 text-[#338078]" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email} • {user.role}</p>
                                                    </div>
                                                    <Icon icon="mdi:plus" className="w-5 h-5 text-[#338078]" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected Users */}
                                    {selectedUsers.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#338078]/10 rounded-full"
                                                >
                                                    <span className="text-xs font-medium text-[#338078]">{user.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUser(user.id)}
                                                        className="text-[#338078] hover:text-red-500 transition-colors"
                                                    >
                                                        <Icon icon="mdi:close" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Audience Count */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Icon icon="mdi:account-multiple" className="w-4 h-4" />
                                <span>This notification will be sent to <strong className="text-[#338078]">{getAudienceCount()}</strong> users</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="bg-white rounded-[22px] shadow-[0px_0px_11px_0px_rgba(51,128,120,0.05)] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-['Nunito'] font-semibold text-[18px] text-[#101928]">
                                Delivery Options
                            </h2>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showSchedule}
                                    onChange={(e) => {
                                        setShowSchedule(e.target.checked);
                                        if (!e.target.checked) {
                                            setData('send_now', true);
                                            setData('scheduled_at', '');
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#338078] focus:ring-[#338078]"
                                />
                                <span className="text-sm text-gray-600">Schedule for later</span>
                            </label>
                        </div>

                        {showSchedule ? (
                            <div className="space-y-4">
                                {/* Schedule Date/Time */}
                                <div>
                                    <label className="block font-['Nunito'] text-sm font-medium text-gray-700 mb-2">
                                        Schedule Date & Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) => {
                                            setData('scheduled_at', e.target.value);
                                            setData('send_now', false);
                                        }}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-[12px] border focus:ring-1 outline-none transition-all text-sm",
                                            errors.scheduled_at 
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                                                : "border-gray-200 focus:border-[#338078] focus:ring-[#338078]"
                                        )}
                                    />
                                    {errors.scheduled_at && (
                                        <p className="mt-1 text-xs text-red-500">{errors.scheduled_at}</p>
                                    )}
                                </div>

                                {/* Frequency */}
                                <div>
                                    <label className="block font-['Nunito'] text-sm font-medium text-gray-700 mb-2">
                                        Frequency
                                    </label>
                                    <div className="flex gap-3">
                                        {(['one_time', 'daily', 'weekly'] as const).map((freq) => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => setData('frequency', freq)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                                                    data.frequency === freq
                                                        ? 'bg-[#338078] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                )}
                                            >
                                                {freq.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-[#338078]/5 rounded-[12px]">
                                <Icon icon="mdi:send" className="w-5 h-5 text-[#338078]" />
                                <span className="text-sm text-gray-700">
                                    This notification will be sent immediately after submission
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/admin/notifications"
                            className="px-6 py-3 rounded-[12px] border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !data.title || !data.message || (showSchedule && !data.scheduled_at)}
                            className={cn(
                                "px-6 py-3 rounded-[12px] bg-[#338078] text-white font-medium transition-all",
                                "hover:bg-[#2a6b64] disabled:opacity-50 disabled:cursor-not-allowed",
                                "flex items-center gap-2"
                            )}
                        >
                            {processing ? (
                                <>
                                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                                    {showSchedule ? 'Scheduling...' : 'Sending...'}
                                </>
                            ) : (
                                <>
                                    <Icon icon={showSchedule ? 'mdi:calendar-clock' : 'mdi:send'} className="w-5 h-5" />
                                    {showSchedule ? 'Schedule Notification' : 'Send Now'}
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Validation hint */}
                    {showSchedule && !data.scheduled_at && (
                        <p className="text-right text-xs text-amber-600 mt-2">
                            Please select a date and time to schedule the notification
                        </p>
                    )}
                </form>
            </div>
        </>
    );
}

CreateNotification.layout = (page: React.ReactNode) => <AdminLayout children={page} />;
