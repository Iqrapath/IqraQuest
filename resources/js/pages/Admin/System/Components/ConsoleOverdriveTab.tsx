import React from 'react';
import { 
    Terminal, Zap, RefreshCcw, Users, Info, Globe, Server, Cpu
} from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsoleOverdriveTabProps {
    systemInfo: {
        php: string;
        laravel: string;
        os: string;
        environment: string;
    };
    terminalLogs: {msg: string, type: 'in' | 'out' | 'err'}[];
    terminalInput: string;
    setTerminalInput: (val: string) => void;
    isExecuting: boolean;
    terminalRef: React.RefObject<HTMLDivElement | null>;
    executeCommand: (e?: React.FormEvent, presetCommand?: string) => void;
}

export default function ConsoleOverdriveTab({
    systemInfo, terminalLogs, terminalInput, setTerminalInput, isExecuting, terminalRef, executeCommand
}: ConsoleOverdriveTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Context Banner */}
            <div className="bg-[#101928]/5 border border-[#101928]/10 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#101928] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#101928]/20">
                    <Terminal size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#101928] uppercase tracking-widest">Direct Console Overdrive</h3>
                    <p className="text-xs text-[#667085] font-bold leading-relaxed">
                        For advanced administrators only. Execute direct system commands or use the Quick-Action Protocols below for safe maintenance.
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={(e) => executeCommand(e, 'health')} className="bg-white p-6 rounded-[24px] border border-[#E4E7EC] hover:border-[#338078] hover:shadow-lg transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <Zap size={20} />
                    </div>
                    <h4 className="text-[11px] font-black text-[#101928] uppercase tracking-widest mb-1">Pulse Audit</h4>
                    <p className="text-[10px] text-[#667085] font-bold">Check overall system health</p>
                </button>
                <button onClick={(e) => executeCommand(e, 'cleanup')} className="bg-white p-6 rounded-[24px] border border-[#E4E7EC] hover:border-[#338078] hover:shadow-lg transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                        <RefreshCcw size={20} />
                    </div>
                    <h4 className="text-[11px] font-black text-[#101928] uppercase tracking-widest mb-1">Flush Buffer</h4>
                    <p className="text-[10px] text-[#667085] font-bold">Clear temporary system junk</p>
                </button>
                <button onClick={(e) => executeCommand(e, 'whoami')} className="bg-white p-6 rounded-[24px] border border-[#E4E7EC] hover:border-[#338078] hover:shadow-lg transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <Users size={20} />
                    </div>
                    <h4 className="text-[11px] font-black text-[#101928] uppercase tracking-widest mb-1">Identity Check</h4>
                    <p className="text-[10px] text-[#667085] font-bold">Show current session rank</p>
                </button>
                <button onClick={(e) => executeCommand(e, 'help')} className="bg-white p-6 rounded-[24px] border border-[#E4E7EC] hover:border-[#338078] hover:shadow-lg transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                        <Info size={20} />
                    </div>
                    <h4 className="text-[11px] font-black text-[#101928] uppercase tracking-widest mb-1">Protocol help</h4>
                    <p className="text-[10px] text-[#667085] font-bold">List available instructions</p>
                </button>
            </div>

            <div className="bg-[#101928] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden group">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <span className="ml-3 text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Terminal size={16} /> Advanced Command Console
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[10px] font-black text-white/50 uppercase tracking-widest bg-black/40 px-5 py-2.5 rounded-full border border-white/5">
                        <span className="flex items-center gap-1.5 text-[#27C93F]">
                            <Globe size={12} /> {systemInfo.environment}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Server size={12} /> {systemInfo.os}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Cpu size={12} /> PHP {systemInfo.php}
                        </span>
                    </div>
                </div>
                
                <ScrollArea
                    ref={terminalRef}
                    className="h-[min(500px,55vh)] font-mono text-[13px] leading-relaxed selection:bg-[#338078] selection:text-white"
                >
                    <div className="space-y-2 p-8">
                        {terminalLogs.map((log, i) => (
                            <div key={i} className={`whitespace-pre-wrap ${
                                log.type === 'in' ? 'text-amber-400 font-bold' : 
                                log.type === 'err' ? 'text-red-400 font-bold' : 'text-[#27C93F]'
                            }`}>
                                {log.msg}
                            </div>
                        ))}
                        {isExecuting && (
                            <div className="text-[#27C93F] animate-pulse">Processing instruction...</div>
                        )}
                    </div>
                </ScrollArea>
                
                <form onSubmit={executeCommand} className="p-6 bg-black/40 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-amber-400 font-mono text-lg font-black shrink-0 relative top-0.5">$</span>
                        <input 
                            type="text" 
                            value={terminalInput}
                            onChange={e => setTerminalInput(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-base placeholder:text-white/10"
                            placeholder="Type command here (Try 'help' for guidance)..."
                            disabled={isExecuting}
                            autoFocus
                        />
                        {isExecuting && <RefreshCcw className="animate-spin text-white/20" size={20} />}
                    </div>
                </form>
            </div>
        </div>
    );
}
