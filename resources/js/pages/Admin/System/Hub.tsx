import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import system from '@/routes/admin/system';

// Icons
import { 
    Users, Cpu, Repeat, FileCode, Terminal, PlusCircle
} from "lucide-react";

// Modular Components
import StaffActivityTab from './Components/StaffActivityTab';
import LiveTasksTab from './Components/LiveTasksTab';
import AutomatedRoutineTab from './Components/AutomatedRoutineTab';
import SystemRecordsTab from './Components/SystemRecordsTab';
import ConsoleOverdriveTab from './Components/ConsoleOverdriveTab';

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

interface HubProps {
    activities: {
        data: Activity[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: any;
    categories: string[];
    severities: string[];
    systemInfo: {
        php: string;
        laravel: string;
        os: string;
        environment: string;
        database: string;
    };
    activeTab: string;
    // Queues
    failedJobs?: {
        data: any[];
        links: any[];
    };
    queueStats?: {
        pending: number;
        failed: number;
    };
    // Schedules
    scheduledTasks?: any[];
    // Logs
    logFiles?: {
        name: string;
        size: string;
        modified: string;
    }[];
    logContent?: string;
    currentLogFile?: string;
}

export default function Hub({ 
    activities, filters, categories, severities, systemInfo, activeTab,
    failedJobs, queueStats, scheduledTasks, logFiles, logContent, currentLogFile 
}: HubProps) {
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalLogs, setTerminalLogs] = useState<{msg: string, type: 'in' | 'out' | 'err'}[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    const { data: filterData, setData: setFilterData } = useForm({
        category: filters.category || '',
        severity: filters.severity || '',
        search: filters.search || '',
        view: filters.view || 'active'
    });

    // Initial Welcome Banner
    useEffect(() => {
        const welcomeBanner = `
WELCOME TO IQRAQUEST SYSTEM CONSOLE
--------------------------------------------------
Environment: ${systemInfo.environment.toUpperCase()}
Server OS:   ${systemInfo.os}
PHP Version: ${systemInfo.php}
--------------------------------------------------

NEED HELP? (Sample commands):
- 'health'  : Check if the website is running well.
- 'cleanup' : Run optimize:clear (caches / compiled views).
- 'whoami'  : Check who you are logged in as.
- 'help'    : See allowlisted php artisan commands and other safe tools.
- 'clear'   : Empty this screen.

Ready for instructions below.
`;
        setTerminalLogs([{ msg: welcomeBanner, type: 'out' }]);
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    const executeCommand = async (e?: React.FormEvent, presetCommand?: string) => {
        if (e) e.preventDefault();
        
        const cmd = presetCommand || terminalInput.trim();
        if (!cmd || isExecuting) return;

        if (cmd.toLowerCase() === 'clear') {
            setTerminalLogs([]);
            setTerminalInput('');
            return;
        }

        setTerminalLogs(prev => [...prev, { msg: `> ${cmd}`, type: 'in' }]);
        if (!presetCommand) setTerminalInput('');
        setIsExecuting(true);

        try {
            const url = system.terminal.execute.url();
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content 
                },
                body: JSON.stringify({ command: cmd })
            });
            const result = await response.json();
            setTerminalLogs(prev => [...prev, { msg: result.output, type: result.status === 'error' ? 'err' : 'out' }]);
        } catch (err) {
            setTerminalLogs(prev => [...prev, { 
                msg: "PROTOCOL INTERRUPTED: Connection to server lost or operation timed out. Check system logs for details.", 
                type: 'err' 
            }]);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newData = { ...filterData, [key]: value };
        setFilterData(key as any, value);
        router.get(system.hub.url(), newData, { preserveState: true });
    };

    const handleRetryJob = (id: number) => {
        router.post(system.queues.retry.url({ id }), {}, {
            onSuccess: () => setSelectedJob(null),
        });
    };

    const handleDeleteFailedJob = (id: number) => {
        if (confirm(`PURGE PROTOCOL: Permanently delete failed job record #${id}?`)) {
            router.delete(system.queues.deleteFailed.url({ id }), {
                onSuccess: () => setSelectedJob(null),
            });
        }
    };

    const handleRetryAllJobs = () => {
        if (confirm("MASS RETRY PROTOCOL: Attempt to re-queue ALL failed jobs?")) {
            router.post(system.queues.retryAll.url());
        }
    };

    return (
        <>
            <Head title="Security & Hardware Center" />

            <div className="p-4 lg:p-8 font-['Nunito'] max-w-[1400px] mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex items-center gap-2 mb-4 text-gray-500 font-medium text-sm">
                    <Link href="/admin/dashboard" className="hover:text-[#338078] transition-colors">Dashboard</Link>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[#101928] font-black uppercase tracking-widest text-[10px]">System Hub</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-[#101928] tracking-tight">Security & Hardware</h1>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">System Pulse: Stable</span>
                            </div>
                        </div>
                        <p className="text-sm text-[#667085] font-bold">Comprehensive command hub for background routines and diagnostic monitoring.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href={system.activities.create.url()}
                            className="bg-[#338078] hover:bg-[#2a6861] text-white px-5 h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#338078]/20"
                        >
                            <PlusCircle size={18} /> Record Manual Audit
                        </Link>
                    </div>
                </div>

                {/* Tabs Dashboard Style */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl w-fit mb-8 shadow-sm overflow-x-auto max-w-full">
                    {[
                        { id: 'history', label: 'Staff Activity', icon: Users },
                        { id: 'queues', label: 'Live Tasks', icon: Cpu },
                        { id: 'schedules', label: 'Automated Routine', icon: Repeat },
                        { id: 'logs', label: 'System Records', icon: FileCode },
                        { id: 'terminal', label: 'Direct Command', icon: Terminal },
                    ].map((tab) => (
                        <Link
                            key={tab.id}
                            href={system.hub.url({ query: { tab: tab.id } })}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-[#338078] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Tab Content Display */}
                <div className="w-full">
                    {activeTab === 'history' && (
                        <StaffActivityTab 
                            activities={activities || { data: [], links: [], meta: {} }}
                            filters={filters}
                            categories={categories}
                            severities={severities}
                            handleFilterChange={handleFilterChange}
                        />
                    )}

                    {activeTab === 'queues' && (
                        <LiveTasksTab 
                            failedJobs={failedJobs || { data: [], links: [] }}
                            queueStats={queueStats || { pending: 0, failed: 0 }}
                            selectedJob={selectedJob}
                            setSelectedJob={setSelectedJob}
                            handleRetryJob={handleRetryJob}
                            handleDeleteFailedJob={handleDeleteFailedJob}
                            handleRetryAllJobs={handleRetryAllJobs}
                        />
                    )}

                    {activeTab === 'schedules' && (
                        <AutomatedRoutineTab scheduledTasks={scheduledTasks || []} />
                    )}

                    {activeTab === 'logs' && (
                        <SystemRecordsTab 
                            logFiles={logFiles || []}
                            logContent={logContent || ''}
                            currentLogFile={currentLogFile}
                        />
                    )}

                    {activeTab === 'terminal' && (
                        <ConsoleOverdriveTab 
                            systemInfo={systemInfo}
                            terminalLogs={terminalLogs}
                            terminalInput={terminalInput}
                            setTerminalInput={setTerminalInput}
                            isExecuting={isExecuting}
                            terminalRef={terminalRef}
                            executeCommand={executeCommand}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

Hub.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;
