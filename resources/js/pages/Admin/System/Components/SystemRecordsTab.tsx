import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    FileText,
    Download,
    Search,
    FolderOpen,
    Copy,
    Check,
    RefreshCw,
    HardDrive,
    ScrollText,
    AlertCircle,
    Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import system from '@/routes/admin/system';

interface SystemRecordsTabProps {
    logFiles?: {
        name: string;
        size: string;
        modified: string;
    }[];
    logContent?: string;
    currentLogFile?: string;
}

function logLineClass(line: string): string {
    if (/\.(EMERGENCY|ALERT|CRITICAL|ERROR):/i.test(line) || /\bERROR\b/.test(line)) {
        return 'text-red-300';
    }
    if (/\.WARNING:/i.test(line) || /\bWARN(ING)?\b/i.test(line)) {
        return 'text-amber-200';
    }
    if (/\.NOTICE:/i.test(line) || /\.INFO:/i.test(line)) {
        return 'text-sky-200/85';
    }
    if (/\.DEBUG:/i.test(line)) {
        return 'text-slate-400';
    }
    return 'text-emerald-100/75';
}

export default function SystemRecordsTab({ logFiles, logContent, currentLogFile }: SystemRecordsTabProps) {
    const [query, setQuery] = useState('');
    const [copied, setCopied] = useState(false);

    const filteredFiles = useMemo(() => {
        const list = logFiles ?? [];
        const q = query.trim().toLowerCase();
        if (!q) return list;
        return list.filter((f) => f.name.toLowerCase().includes(q));
    }, [logFiles, query]);

    const fileCount = logFiles?.length ?? 0;
    const newestLabel = logFiles?.[0]?.modified ?? '—';

    const handleCopy = async () => {
        if (!logContent) return;
        try {
            await navigator.clipboard.writeText(logContent);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    };

    const refreshHref = currentLogFile
        ? system.hub.url({ query: { tab: 'logs', log_file: currentLogFile } })
        : system.hub.url({ query: { tab: 'logs' } });

    const lines = useMemo(() => (logContent ? logContent.split('\n') : []), [logContent]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Banner */}
            <div className="rounded-[32px] border border-[#338078]/15 bg-gradient-to-br from-[#338078]/[0.07] via-white to-slate-50/80 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#338078] text-white shadow-lg shadow-[#338078]/25">
                        <ScrollText className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#101928]">
                            System records
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-[#667085]">
                            Browse <code className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-[#338078]">storage/logs</code> without SSH. View the last 200 lines in the browser or download full files for deeper analysis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-[#E4E7EC] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#338078]/10 text-[#338078]">
                            <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">Log files</p>
                            <p className="text-xl font-black text-[#101928]">{fileCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-[24px] border border-[#E4E7EC] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">Newest activity</p>
                            <p className="truncate text-sm font-bold text-[#344054]" title={newestLabel}>
                                {newestLabel}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-[24px] border border-[#E4E7EC] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/5 text-[#101928]">
                            <HardDrive className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">Viewer</p>
                            <p className="text-sm font-bold text-[#344054]">Tail · 200 lines</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main workspace — bounded height so ScrollAreas get a real viewport on desktop */}
            <div className="grid min-h-[520px] grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:h-[min(72vh,820px)] lg:min-h-[560px]">
                {/* File list */}
                <div className="flex min-h-0 flex-col lg:col-span-4 lg:h-full">
                    <div className="flex max-h-[52vh] min-h-[300px] flex-1 flex-col overflow-hidden rounded-[28px] border border-[#E4E7EC] bg-white shadow-sm lg:max-h-none lg:h-full lg:min-h-0">
                        <div className="border-b border-[#F0F2F5] p-5">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#667085]">
                                    Files
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-xl border-[#E4E7EC] text-[10px] font-black uppercase tracking-wider"
                                    onClick={() => window.open(system.logs.export.url())}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Laravel.log
                                </Button>
                            </div>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Filter by filename…"
                                    className="h-10 rounded-xl border-[#E4E7EC] bg-[#F9FAFB] pl-9 text-sm font-medium placeholder:text-[#98A2B3]"
                                />
                            </div>
                        </div>

                        <ScrollArea className="h-0 min-h-0 flex-1 px-3 pb-3 pt-1">
                            <div className="space-y-1.5 pr-1">
                                {filteredFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E4E7EC] bg-[#F9FAFB] px-4 py-10 text-center">
                                        <AlertCircle className="h-8 w-8 text-[#98A2B3]" />
                                        <p className="text-xs font-bold text-[#667085]">
                                            {fileCount === 0 ? 'No log files in storage/logs yet.' : 'No files match your filter.'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredFiles.map((file) => {
                                        const active = currentLogFile === file.name;
                                        return (
                                            <Link
                                                key={file.name}
                                                href={system.hub.url({ query: { tab: 'logs', log_file: file.name } })}
                                                preserveScroll
                                                className={cn(
                                                    'group flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all',
                                                    active
                                                        ? 'border-[#338078] bg-[#338078] text-white shadow-md shadow-[#338078]/20'
                                                        : 'border-transparent bg-[#F9FAFB]/80 hover:border-[#E4E7EC] hover:bg-white',
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <FileText
                                                            className={cn(
                                                                'h-4 w-4 shrink-0',
                                                                active ? 'text-white/90' : 'text-[#338078]',
                                                            )}
                                                        />
                                                        <span
                                                            className={cn(
                                                                'truncate text-xs font-black tracking-wide',
                                                                active ? 'text-white' : 'text-[#101928]',
                                                            )}
                                                            title={file.name}
                                                        >
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            'shrink-0 text-[10px] font-black',
                                                            active ? 'text-white/60' : 'text-[#98A2B3]',
                                                        )}
                                                    >
                                                        {file.size}
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'pl-6 text-[10px] font-bold',
                                                        active ? 'text-white/55' : 'text-[#98A2B3]',
                                                    )}
                                                >
                                                    Modified {file.modified}
                                                </span>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Viewer */}
                <div className="flex min-h-0 flex-col lg:col-span-8 lg:h-full">
                    <div className="flex max-h-[56vh] min-h-[400px] flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f1a] shadow-2xl ring-1 ring-black/20 lg:max-h-none lg:h-full lg:min-h-0">
                        <div className="flex flex-col gap-4 border-b border-white/10 bg-[#121826] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                    <FileText className="h-5 w-5 text-[#338078]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                        Active file
                                    </p>
                                    <p className="truncate font-mono text-sm font-bold text-white" title={currentLogFile ?? ''}>
                                        {currentLogFile ?? 'Select a log file'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="border-0 bg-white/10 font-black text-[10px] uppercase tracking-wider text-white/70">
                                    Last 200 lines
                                </Badge>
                                {logContent && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 gap-1.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                                            onClick={handleCopy}
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                            {copied ? 'Copied' : 'Copy'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 gap-1.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                                            onClick={() =>
                                                window.open(system.logs.export.url({ query: { log_file: currentLogFile! } }))
                                            }
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
                                    </>
                                )}
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 gap-1.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                                >
                                    <Link href={refreshHref} preserveScroll>
                                        <RefreshCw className="h-4 w-4" />
                                        Refresh
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="h-0 min-h-0 flex-1 bg-[#0b0f1a]">
                            <div className="p-5 sm:p-6">
                                {logContent ? (
                                    <pre className="m-0 font-mono text-[11px] leading-[1.65]">
                                        {lines.map((line, i) => (
                                            <div key={i} className="flex gap-3 border-b border-white/[0.04] py-0.5 hover:bg-white/[0.02]">
                                                <span className="w-8 shrink-0 select-none text-right text-[10px] font-medium text-white/25">
                                                    {i + 1}
                                                </span>
                                                <span className={cn('min-w-0 flex-1 whitespace-pre-wrap break-all', logLineClass(line))}>
                                                    {line || ' '}
                                                </span>
                                            </div>
                                        ))}
                                    </pre>
                                ) : (
                                    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
                                            <Search className="h-9 w-9 text-white/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-black uppercase tracking-wider text-white/80">
                                                No log selected
                                            </p>
                                            <p className="mx-auto max-w-sm text-xs font-medium leading-relaxed text-white/45">
                                                Choose a file from the list to load the latest tail. Download the full file if you need complete history or to share with support.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
