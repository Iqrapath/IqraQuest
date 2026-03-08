import { cn } from '@/lib/utils';

interface Tab {
    key: string;
    label: string;
    count?: number;
}

interface BookingTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    counts?: Record<string, number>;
    disabled?: boolean;
}

export function BookingTabs({ tabs, activeTab, onTabChange, counts, disabled }: BookingTabsProps) {
    return (
        <div className="bg-white rounded-[20px] shadow-[0px_0px_62px_0px_rgba(51,128,120,0.12)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.375rem,0.75vw,0.5rem)] inline-flex self-start">
            <div className="flex items-center">
                {tabs.map((tab) => {
                    const count = counts ? counts[tab.key] : 0;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => !disabled && onTabChange(tab.key)}
                            disabled={disabled}
                            className={cn(
                                "flex items-center gap-2 px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-[20px] font-['Nunito'] text-[clamp(0.875rem,1.25vw,1rem)] transition-all duration-200 whitespace-nowrap cursor-pointer",
                                activeTab === tab.key
                                    ? 'bg-[#338078] text-white font-semibold'
                                    : 'text-[#6b7280] font-normal hover:text-[#338078]',
                                disabled && 'cursor-not-allowed opacity-70'
                            )}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full font-black min-w-[20px] text-center",
                                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const defaultBookingTabs: Tab[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'in_review', label: 'In Review' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];
