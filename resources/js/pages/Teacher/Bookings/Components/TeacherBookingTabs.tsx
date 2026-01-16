import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    key: string;
    label: string;
}

interface TeacherBookingTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    counts?: Record<string, number>;
    disabled?: boolean;
}

export const TeacherBookingTabs: React.FC<TeacherBookingTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    counts,
    disabled
}) => {
    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-2 inline-flex flex-wrap gap-2">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const count = counts ? counts[tab.key] : 0;

                return (
                    <button
                        key={tab.key}
                        onClick={() => !disabled && onTabChange(tab.key)}
                        disabled={disabled}
                        className={cn(
                            "px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2",
                            isActive
                                ? 'bg-[#358D83] text-white shadow-lg shadow-teal-900/10'
                                : 'text-gray-500 hover:text-[#358D83] hover:bg-teal-50/50',
                            disabled && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        {tab.label}
                        {count > 0 && (
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-black min-w-[20px] text-center",
                                isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                            )}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export const defaultTeacherBookingTabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];
