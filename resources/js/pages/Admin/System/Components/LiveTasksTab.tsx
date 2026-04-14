import React from 'react';
import { 
    Cpu, Database, Activity, ShieldAlert, AlertCircle, RefreshCcw, Eye, Trash2, Clock
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LiveTasksTabProps {
    failedJobs?: {
        data: any[];
        links: any[];
    };
    queueStats?: {
        pending: number;
        failed: number;
    };
    selectedJob: any;
    setSelectedJob: (job: any) => void;
    handleRetryJob: (id: number) => void;
    handleDeleteFailedJob: (id: number) => void;
    handleRetryAllJobs: () => void;
}

export default function LiveTasksTab({
    failedJobs, queueStats, selectedJob, setSelectedJob,
    handleRetryJob, handleDeleteFailedJob, handleRetryAllJobs
}: LiveTasksTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Context Banner */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                    <Cpu size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#101928] uppercase tracking-widest">Background Task Pulse</h3>
                    <p className="text-xs text-[#667085] font-bold leading-relaxed">
                        Laravel Queues: These are "invisible" tasks like sending emails that run in the background. If a task fails (Red Alert), you can manually retry it here.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[32px] border border-[#E4E7EC] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all -rotate-12">
                        <Activity size={120} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#338078]/10 flex items-center justify-center border border-[#338078]/20">
                            <Database size={24} className="text-[#338078]" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-[#667085] uppercase tracking-widest">Active Pipeline</h3>
                            <p className="text-2xl font-black text-[#101928]">{queueStats?.pending || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-[#667085]">Current instructions waiting for background processing</p>
                </div>

                <div className="bg-white rounded-[32px] border border-[#E4E7EC] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all -rotate-12 text-[#D92D20]">
                        <ShieldAlert size={120} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D92D20]/10 flex items-center justify-center border border-[#D92D20]/20">
                            <AlertCircle size={24} className="text-[#D92D20]" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-[#667085] uppercase tracking-widest">Failed Protocols</h3>
                            <p className="text-2xl font-black text-[#D92D20]">{queueStats?.failed || 0}</p>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-[#667085]">Critical interruptions that require administrative retry</p>
                </div>
            </div>

            {/* Failed Jobs Table */}
            <div className="bg-white rounded-[32px] border border-[#E4E7EC] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#F0F2F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-sm font-black text-[#101928] uppercase tracking-[0.1em] flex items-center gap-2">
                        <ShieldAlert size={18} className="text-[#D92D20]" /> Failed Job History
                    </h2>
                    <button 
                        onClick={handleRetryAllJobs}
                        className="px-6 py-2 bg-[#101928] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
                    >
                        Initiate Mass Recovery
                    </button>
                </div>

                <ScrollArea
                    className="h-[min(52vh,600px)] w-full"
                    showHorizontalScrollbar
                >
                    <div className="min-w-[720px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-[#F0F2F5]">
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em]">Failed At</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em]">Queue / Connection</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em]">Payload Snippet</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5]">
                            {failedJobs?.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center text-[#027A48]">
                                                <RefreshCcw size={24} />
                                            </div>
                                            <p className="text-sm font-black text-[#101928] uppercase tracking-wider">No failed jobs detected</p>
                                            <p className="text-xs font-medium text-[#667085]">System pipeline is operating at peak efficiency.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : failedJobs?.data.map((job) => (
                                <tr key={job.id} className="hover:bg-[#F9FAFB] transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-[#344054]">{new Date(job.failed_at).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#101928] uppercase">
                                            <Badge variant="outline" className="rounded-lg bg-white">{job.queue}</Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <p className="text-[10px] font-bold text-[#D92D20] uppercase bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                                            <ShieldAlert size={12} /> Protocol Halted: Action Required
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => setSelectedJob(job)}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#F2F4F7] text-[#344054] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#338078] hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye size={14} /> Diagnose
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteFailedJob(job.id)}
                                                className="p-2 text-[#667085] hover:text-[#D92D20] hover:bg-[#D92D20]/10 rounded-xl transition-all"
                                                title="Purge Record"
                                            > <Trash2 size={18} /> </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </ScrollArea>
            </div>

            {/* Failed Job Modal */}
            <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
                <DialogContent className="max-w-6xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-[#101928] text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                <ShieldAlert size={28} className="text-[#FC2E2E]" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest">Protocol Diagnostic Hub</DialogTitle>
                                <DialogDescription className="text-white/40 font-bold">
                                    Inspecting technical failure for request ID: <span className="text-white">#{selectedJob?.uuid || 'N/A'}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8 bg-[#F9FAFB]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-[#667085] uppercase tracking-widest">Connection Pipeline</label>
                                <p className="text-sm font-bold text-[#101928]">{selectedJob?.connection}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-[#667085] uppercase tracking-widest">Target Queue</label>
                                <p className="text-sm font-bold text-[#101928]">{selectedJob?.queue}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-[#667085] uppercase tracking-widest">Timestamp of Failure</label>
                                <p className="text-sm font-bold text-[#101928] flex items-center gap-2">
                                    <Clock size={14} /> {selectedJob?.failed_at}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#667085] uppercase tracking-widest flex items-center gap-2">
                                <RefreshCcw size={14} /> Runtime Stack Trace (Diagnostic Data)
                            </label>
                            <ScrollArea className="h-[400px] w-full rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-inner font-mono text-[11px] leading-relaxed text-[#D92D20]">
                                <pre className="whitespace-pre-wrap">{selectedJob?.exception}</pre>
                            </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-white border-t border-[#F0F2F5] sm:justify-between items-center gap-4">
                        <div className="text-xs font-bold text-[#667085]">
                            Manual intervention required to resume sequence.
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setSelectedJob(null)}
                                className="px-6 py-3 border border-[#E4E7EC] text-[#344054] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={() => selectedJob && handleRetryJob(selectedJob.id)}
                                className="px-8 py-3 bg-[#338078] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#338078]/20 hover:bg-[#2a6861] transition-all"
                            >
                                Initiate Retry Protocol
                            </button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
