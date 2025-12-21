import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    child: any;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditScheduleModal({ open, onOpenChange, child }: Props) {
    const { data, setData, patch, processing } = useForm({
        preferred_days: [] as string[],
    });

    useEffect(() => {
        if (open) {
            setData({
                preferred_days: child.preferred_days || [],
            });
        }
    }, [open, child]);

    const toggleDay = (day: string) => {
        const current = [...data.preferred_days];
        if (current.includes(day)) {
            setData('preferred_days', current.filter(d => d !== day));
        } else {
            setData('preferred_days', [...current, day]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/guardian/children/${child.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-[20px]">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6 text-left">
                        <DialogTitle className="font-['Nunito'] font-bold text-[24px] text-[#1a1d56]">
                            Preferred Schedule
                        </DialogTitle>
                        <DialogDescription className="font-['Nunito'] text-[16px] text-[#818181] mt-1">
                            Select the days your child is available for lessons
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <label className="font-['Nunito'] font-semibold text-[16px] text-[#1a1d56]">
                                Available Days
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {DAYS.map(day => {
                                    const isSelected = data.preferred_days.includes(day);
                                    return (
                                        <div
                                            key={day}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                                                isSelected ? "bg-[#EDF7F6] border-[#338078]" : "bg-[#f4f4f6]/50 border-transparent hover:border-gray-200"
                                            )}
                                            onClick={() => toggleDay(day)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`day-${day}`}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleDay(day)}
                                                    className="w-5 h-5 rounded-[4px] border-[#818181] aria-checked:bg-[#338078] aria-checked:border-[#338078]"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <label
                                                    htmlFor={`day-${day}`}
                                                    className="font-['Nunito'] text-[16px] text-[#333] cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {day}
                                                </label>
                                            </div>
                                            {isSelected && <Icon icon="mdi:check" className="text-[#338078] w-5 h-5" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white font-['Nunito'] font-medium text-[16px] py-3 px-8 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
