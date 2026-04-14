import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Users, Eye, RefreshCcw, Trash2, ShieldAlert, Filter, Search
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from '@/components/ui/scroll-area';
import system from '@/routes/admin/system';

interface Activity {
    id: number;
    category: string;
    event_type: string;
    description: string;
    severity: string;
    created_at: string;
    deleted_at: string | null;
    user?: { name: string };
}

interface StaffActivityTabProps {
    activities: {
        data: Activity[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: any;
    categories: string[];
    severities: string[];
    handleFilterChange: (key: string, value: string) => void;
}

const severityColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-900 font-bold animate-pulse',
};

const friendlySeverity: Record<string, string> = {
    info: 'Just Info',
    warning: 'Attention',
    error: 'High Priority',
    critical: 'Emergency',
};

export default function StaffActivityTab({ 
    activities, filters, categories, severities, handleFilterChange 
}: StaffActivityTabProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Context Banner */}
            <div className="bg-[#338078]/5 border border-[#338078]/10 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#338078] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#338078]/20">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#101928] uppercase tracking-widest">Protocol Audit Trail</h3>
                    <p className="text-xs text-[#667085] font-bold leading-relaxed">
                        This is the system's human activity log. It tracks who logged in, who updated settings, and every administrative action taken to ensure accountability.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-[#E4E7EC] shadow-sm overflow-hidden">
                {/* Search and Filters */}
                <div className="p-6 border-b border-[#F0F2F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3] group-focus-within:text-[#338078] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by action or event type..."
                            className="w-full pl-11 pr-4 py-3 bg-[#F9FAFB] border border-[#E4E7EC] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#338078]/20 focus:border-[#338078] transition-all"
                            defaultValue={filters.search}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#667085] uppercase tracking-widest px-2">Layer:</span>
                            <Select value={filters.category || 'null'} onValueChange={(val) => handleFilterChange('category', val)}>
                                <SelectTrigger className="w-[140px] h-10 rounded-xl bg-white border-[#E4E7EC] text-xs font-bold">
                                    <SelectValue placeholder="Any Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Any Category</SelectItem>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#667085] uppercase tracking-widest px-2">Heat:</span>
                            <Select value={filters.severity || 'null'} onValueChange={(val) => handleFilterChange('severity', val)}>
                                <SelectTrigger className="w-[140px] h-10 rounded-xl bg-white border-[#E4E7EC] text-xs font-bold">
                                    <SelectValue placeholder="Any Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Any Priority</SelectItem>
                                    {severities.map(s => <SelectItem key={s} value={s}>{friendlySeverity[s] || s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#E4E7EC] w-fit">
                            <button 
                                onClick={() => handleFilterChange('view', 'active')}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filters.view === 'active' ? 'bg-[#101928] text-white shadow-md' : 'text-[#667085] hover:bg-[#F9FAFB]'}`}
                            >
                                Active List
                            </button>
                            <button 
                                onClick={() => handleFilterChange('view', 'trashed')}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${filters.view === 'trashed' ? 'bg-[#FC2E2E] text-white shadow-md' : 'text-[#667085] hover:bg-[#F9FAFB]'}`}
                            >
                                Trash Bin
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Table */}
                <ScrollArea
                    className="h-[min(68vh,720px)] w-full text-[#101928]"
                    showHorizontalScrollbar
                >
                    <div className="min-w-[900px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-[#F0F2F5]">
                                <th className="px-6 py-4 text-[10px] font-black text-[#667185] uppercase tracking-widest">When</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667185] uppercase tracking-widest">Who</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667185] uppercase tracking-widest">Importance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667185] uppercase tracking-widest">The Activity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667185] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5]">
                            {activities?.data?.map((activity) => (
                                <tr key={activity.id} className="hover:bg-[#F9FAFB]/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black">{new Date(activity.created_at).toLocaleDateString()}</p>
                                        <p className="text-[10px] font-bold text-[#667085]">{new Date(activity.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-[#338078]/10 flex items-center justify-center text-[#338078] font-black text-[10px]">
                                                {activity.user?.name?.[0] || 'A'}
                                            </div>
                                            <span className="text-xs font-black text-[#344054]">
                                                {activity.user?.name || 'Automated'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={`${severityColors[activity.severity] || 'bg-slate-100'} border-none font-black text-[9px] px-2 py-0.5 uppercase tracking-wider rounded-md`}>
                                            {friendlySeverity[activity.severity] || activity.severity}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[400px]">
                                            <p className="text-[10px] font-black text-[#338078] uppercase tracking-widest mb-1">[{activity.category}]</p>
                                            <p className="text-xs font-bold line-clamp-1">{activity.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={system.activities.show.url({ id: activity.id })} className="p-2 hover:bg-[#338078]/10 text-[#338078] rounded-xl">
                                                <Eye size={18} />
                                            </Link>
                                            {filters.view === 'trashed' ? (
                                                <button onClick={() => router.put(system.activities.restore.url({ id: activity.id }))} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl">
                                                    <RefreshCcw size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => router.delete(system.activities.destroy.url({ id: activity.id }))} className="p-2 hover:bg-red-50 text-red-600 rounded-xl">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!activities?.data || activities.data.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-[#667185]">
                                            <ShieldAlert size={48} className="text-[#E4E7EC]" />
                                            <p className="text-sm font-bold">No history available for the current filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </ScrollArea>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="p-6 border-t border-[#F0F2F5] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-bold text-[#667085]">
                            Page <span className="text-[#101928]">{activities.current_page}</span> of {activities.last_page}
                        </p>
                        <div className="flex items-center gap-2">
                            {activities.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`h-9 px-4 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                        link.active ? 'bg-[#101928] text-white shadow-md' : 
                                        !link.url ? 'text-[#D0D5DD] cursor-not-allowed pointer-events-none' : 'bg-white border border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
