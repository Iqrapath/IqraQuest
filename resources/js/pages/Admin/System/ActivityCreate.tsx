import React from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import system from '@/routes/admin/system';
import { 
    Shield, ArrowLeft, Save, AlertCircle, 
    FileText, Tag, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ActivityCreateProps {
    severities: string[];
}

export default function ActivityCreate({ severities }: ActivityCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        event_type: 'MANUAL_NOTE',
        description: '',
        severity: 'info',
    });

    const priorityMap: Record<string, string> = {
        'info': 'Just Info (Low)',
        'warning': 'Attention Needed (Medium)',
        'error': 'Important (High)',
        'critical': 'Emergency (Highest)',
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(system.activities.store.url());
    };

    return (
        <AdminLayout hideRightSidebar={true}>
            <Head title="Add System Note" />

            <div className="p-4 lg:p-10 font-['Nunito'] max-w-2xl mx-auto">
                {/* Back Link */}
                <Link 
                    href={system.hub.url()}
                    className="flex items-center gap-2 text-[#667085] hover:text-[#338078] transition-all mb-6 w-fit group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-xs uppercase tracking-wider">Back to Dashboard</span>
                </Link>

                <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#F0F2F5] bg-[#F9FAFB]/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#338078]/10 flex items-center justify-center text-[#338078]">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#101928]">Add Manual Note</h1>
                                <p className="text-xs text-[#667085]">Add a human-readable note to the record list.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-6">
                        {/* Note Label */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#667185] uppercase tracking-[0.1em] flex items-center gap-2">
                                <Tag size={12} /> Label / Category
                            </label>
                            <input 
                                type="text"
                                value={data.event_type}
                                onChange={e => setData('event_type', e.target.value)}
                                className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#338078] outline-none transition-all"
                                placeholder="E.g. MANUAL_FIX, SERVER_RESTORE"
                            />
                            {errors.event_type && <p className="text-red-500 text-[10px] font-bold">{errors.event_type}</p>}
                        </div>

                        {/* What Happened */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#667185] uppercase tracking-[0.1em] flex items-center gap-2">
                                <Info size={12} /> The Note (What happened?)
                            </label>
                            <textarea 
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full min-h-[140px] p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-[#338078] outline-none transition-all resize-none"
                                placeholder="Explain clearly what was done or what happened..."
                                required
                            />
                            {errors.description && <p className="text-red-500 text-[10px] font-bold">{errors.description}</p>}
                        </div>

                        {/* Priority Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#667185] uppercase tracking-[0.1em] flex items-center gap-2">
                                <AlertCircle size={12} /> How important is this?
                            </label>
                            <Select 
                                value={data.severity} 
                                onValueChange={(v) => setData('severity', v)}
                            >
                                <SelectTrigger className="w-full h-11 bg-[#F9FAFB] border-[#E4E7EC] rounded-xl font-bold text-[#344054]">
                                    <SelectValue placeholder="Select Importance" />
                                </SelectTrigger>
                                <SelectContent>
                                    {severities.map(s => (
                                        <SelectItem key={s} value={s} className="font-bold">
                                            {priorityMap[s] || s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.severity && <p className="text-red-500 text-[10px] font-bold">{errors.severity}</p>}
                        </div>

                        {/* Note Warning */}
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                            <Shield className="text-amber-500 shrink-0" size={18} />
                            <p className="text-[10px] text-amber-800 leading-normal font-medium">
                                <strong>Safety Notice:</strong> Once saved, these notes are permanent markers for security history. Ensure your explanation is clear and accurate.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#F0F2F5]">
                            <button 
                                type="button" 
                                onClick={() => router.get(system.hub.url())}
                                className="text-xs font-black text-[#667185] uppercase tracking-widest hover:text-[#101928]"
                            >
                                Cancel
                            </button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-[#338078] hover:bg-[#2a6861] text-white px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#338078]/10"
                            >
                                <Save size={16} /> Save Record
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
