import React from 'react';
import { 
    Repeat, Layers, Calendar, Clock, ArrowRight, ShieldCheck, Play
} from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';

interface AutomatedRoutineTabProps {
    scheduledTasks?: any[];
}

export default function AutomatedRoutineTab({ scheduledTasks }: AutomatedRoutineTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Context Banner */}
            <div className="bg-[#101928] border border-white/10 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-4 text-white">
                <div className="w-12 h-12 rounded-2xl bg-[#338078] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#338078]/20">
                    <Repeat size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Automated Routine Engine</h3>
                    <p className="text-xs text-white/60 font-medium leading-relaxed">
                        The heartbeat of the system. These background protocols execute automatically to maintain database integrity, security reporting, and financial synchronization.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-[#E4E7EC] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#F0F2F5] flex items-center justify-between">
                    <h2 className="text-sm font-black text-[#101928] uppercase tracking-[0.1em] flex items-center gap-2">
                        <Layers size={18} className="text-[#338078]" /> Registered Sequences
                    </h2>
                    <div className="flex items-center gap-2">
                         <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                         <span className="text-[10px] font-black text-[#667085] uppercase tracking-widest">Scheduler Active</span>
                    </div>
                </div>

                <ScrollArea
                    className="h-[min(52vh,620px)] w-full"
                    showHorizontalScrollbar
                >
                    <div className="min-w-[800px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-[#F0F2F5]">
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em]">Sequence / Protocol</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em]">Frequency</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em]">Next Execution</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#667085] uppercase tracking-[0.2em] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F2F5]">
                            {scheduledTasks?.map((task, i) => (
                                <tr key={i} className="hover:bg-[#F9FAFB]/50 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#F2F4F7] flex items-center justify-center text-[#101928] group-hover:bg-[#338078]/10 group-hover:text-[#338078] transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[#101928] uppercase tracking-wide">
                                                    {task.command?.replace('php artisan ', '') || 'System Callback'}
                                                </p>
                                                <p className="text-[10px] font-bold text-[#667085]">
                                                    {task.description || 'Internal maintenance protocol'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-black text-[#344054] font-mono">{task.expression}</p>
                                            <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider">Cron Signature</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#338078] bg-[#338078]/5 w-fit px-3 py-1.5 rounded-lg border border-[#338078]/10">
                                            <Clock size={12} />
                                            <span className="uppercase tracking-widest">{task.next_due_date_human || 'Pending...'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-[10px] font-black text-[#101928] uppercase tracking-[0.1em] opacity-40">Ready</span>
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-[#338078] group-hover:bg-[#338078]/10 transition-all cursor-not-allowed">
                                                <Play size={14} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {(!scheduledTasks || scheduledTasks.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                <Calendar size={28} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#101928] uppercase tracking-widest">No routines detected</p>
                                                <p className="text-xs text-[#667085] font-bold">Automatic background tasks will appear here once registered.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </ScrollArea>

                <div className="p-6 bg-[#F9FAFB] border-t border-[#F0F2F5]">
                    <p className="text-[10px] text-[#667085] font-black uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight size={12} /> Total Operating Sequences: {scheduledTasks?.length || 0}
                    </p>
                </div>
            </div>
        </div>
    );
}

