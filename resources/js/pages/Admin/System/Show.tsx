import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import system from '@/routes/admin/system';
import { 
    Shield, ArrowLeft, Send, CheckCircle2, 
    Clock, User, Info, AlertTriangle, Database, 
    ChevronDown, ChevronUp, History, Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Activity {
    id: number;
    category: string;
    event_type: string;
    description: string;
    severity: string;
    metadata: any;
    user?: { name: string; email: string };
    created_at: string;
}

interface ShowProps {
    activity: Activity;
}

export default function Show({ activity }: ShowProps) {
    const { data, setData, put, processing } = useForm({
        correction: '',
    });
    const [showTechnical, setShowTechnical] = useState(false);

    const severityConfig: Record<string, { color: string, bg: string, label: string }> = {
        info: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Ordinary Info' },
        warning: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Needs Attention' },
        error: { color: 'text-red-600', bg: 'bg-red-50', label: 'High Priority' },
        critical: { color: 'text-red-700', bg: 'bg-red-100', label: 'Emergency' },
    };

    const config = severityConfig[activity.severity] || severityConfig.info;

    const submitCorrection = (e: React.FormEvent) => {
        e.preventDefault();
        put(system.activities.update.url({ id: activity.id }));
    };

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title="Activity Report" />

            <div className="p-4 lg:p-10 font-['Nunito'] max-w-4xl">
                {/* Navigation */}
                <Link 
                    href={system.hub.url()}
                    className="flex items-center gap-2 text-[#667085] hover:text-[#338078] transition-all mb-8 w-fit group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-xs uppercase tracking-wider">Back to History</span>
                </Link>

                {/* Main Report Card */}
                <div className="bg-white rounded-[32px] border border-[#E4E7EC] shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-0 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge className={`${config.bg} ${config.color} border-none font-black text-[10px] px-3 py-1 uppercase tracking-wider rounded-full`}>
                                    {config.label}
                                </Badge>
                                <span className="text-xs font-bold text-[#667085] flex items-center gap-1.5">
                                    <Clock size={14} /> {new Date(activity.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-[#101928] leading-[1.1] mb-2">{activity.description}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#667085]">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9FAFB] rounded-lg">
                                        <Database size={14} className="text-[#338078]" /> {activity.category}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9FAFB] rounded-lg">
                                        <Info size={14} className="text-[#338078]" /> {activity.event_type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Person Row for small screens, col for large */}
                        <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-2xl md:min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#338078]/20 flex items-center justify-center text-[#338078] font-black italic">
                                {activity.user?.name?.[0] || <Shield size={18} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#667085] uppercase tracking-wider">Logged By</p>
                                <p className="text-sm font-black text-[#101928]">{activity.user?.name || 'System Auto'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-10">
                        {/* Corrections Timeline */}
                        {(activity.metadata?.corrections || []).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-[#101928] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={16} className="text-[#338078]" /> Admin Follow-up Notes
                                </h3>
                                <div className="space-y-3">
                                    {activity.metadata.corrections.map((c: any, i: number) => (
                                        <div key={i} className="p-5 bg-white border-l-4 border-[#338078] rounded-r-2xl border-t border-b border-r border-[#E4E7EC] shadow-sm">
                                            <p className="text-sm text-[#344054] leading-relaxed italic mb-3">"{c.note}"</p>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-[#667085]">
                                                <span className="flex items-center gap-1"><User size={12} /> {c.admin}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {c.at}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Correction Form */}
                        <div className="bg-[#F9FAFB] rounded-3xl p-6 border border-[#E4E7EC]">
                            <h3 className="text-xs font-black text-[#101928] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-center">
                                Add a Note to this Record
                            </h3>
                            <form onSubmit={submitCorrection} className="flex flex-col md:flex-row gap-3">
                                <input 
                                    type="text"
                                    value={data.correction}
                                    onChange={e => setData('correction', e.target.value)}
                                    placeholder="Add any extra info or comments here..."
                                    className="flex-1 h-12 px-5 bg-white border border-[#E4E7EC] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#338078] transition-all"
                                    required
                                />
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-[#101928] hover:bg-black text-white h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shrink-0"
                                >
                                    <Send size={14} /> Add Note
                                </Button>
                            </form>
                        </div>

                        {/* Technical Details Toggle */}
                        <div className="border border-[#E4E7EC] rounded-2xl overflow-hidden">
                            <button 
                                onClick={() => setShowTechnical(!showTechnical)}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F9FAFB] transition-colors"
                            >
                                <span className="text-[10px] font-black text-[#101928] uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={14} className="text-[#667085]" /> View Technical Backstory
                                </span>
                                {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            
                            {showTechnical && (
                                <div className="p-6 bg-[#F9FAFB] border-t border-[#E4E7EC] space-y-6 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-[#667085] uppercase tracking-widest underline decoration-[#338078]/30 underline-offset-4">Event Source</h4>
                                            <div className="space-y-2">
                                                <p className="text-xs text-[#101928] flex items-center justify-between">
                                                    <span className="font-bold text-[#667085]">Network IP:</span>
                                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E4E7EC]">{activity.metadata?.ip || 'Internal'}</span>
                                                </p>
                                                <p className="text-xs text-[#101928] flex items-center justify-between">
                                                    <span className="font-bold text-[#667085]">User Agent:</span>
                                                    <span className="max-w-[200px] truncate text-right">{activity.metadata?.user_agent || 'Unknown'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-[#667085] uppercase tracking-widest underline decoration-[#338078]/30 underline-offset-4">Data Context</h4>
                                            <div className="space-y-2">
                                                <p className="text-xs text-[#101928] flex items-center justify-between">
                                                    <span className="font-bold text-[#667085]">Type Code:</span>
                                                    <span>{activity.event_type}</span>
                                                </p>
                                                <p className="text-xs text-[#101928] flex items-center justify-between">
                                                    <span className="font-bold text-[#667085]">Record ID:</span>
                                                    <span>#{activity.id}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Raw Data if exists */}
                                    {(activity.metadata?.raw_data) && (
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black text-[#667085] uppercase tracking-widest flex items-center gap-2">
                                                <Database size={12} /> Raw Data Capture
                                            </h4>
                                            <div className="p-4 bg-white border border-[#E4E7EC] rounded-xl overflow-x-auto">
                                                <pre className="text-[10px] font-mono text-[#475467]">
                                                    {JSON.stringify(activity.metadata.raw_data, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="p-6 bg-amber-50/50 border-t border-amber-100 flex items-center gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] text-amber-800 font-medium">
                            This is an immutable record. For security reasons, original log data cannot be modified. Only correction notes can be appended by authorized personnel.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
