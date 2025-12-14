import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdvancedFilterProps {
    subjects: Array<{
        id: number;
        name: string;
    }>;
    selectedSubject?: number | null;
    onFilterChange: (filters: FilterValues) => void;
    className?: string;
}

export interface FilterValues {
    subject: number | null;
    timePreference: string | null;
    budgetMin: number;
    budgetMax: number;
    currency: 'USD' | 'NGN';
    language: string | null;
}

const timePreferences = [
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 10PM)' },
    { value: 'flexible', label: 'Flexible' },
];

const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'french', label: 'French' },
    { value: 'urdu', label: 'Urdu' },
];

interface FilterOptions {
    time_preferences: Array<{ value: string; label: string; teacher_count?: number }>;
    budget: { min: number; max: number; currency: string };
    languages: Array<{ value: string; label: string }>;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
    subjects,
    selectedSubject,
    onFilterChange,
    className = '',
}) => {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        time_preferences: timePreferences,
        budget: { min: 100, max: 20000, currency: 'USD' },
        languages: languages,
    });

    const [filters, setFilters] = useState<FilterValues>({
        subject: selectedSubject || null,
        timePreference: null,
        budgetMin: 100,
        budgetMax: 10000,
        currency: 'USD',
        language: null,
    });

    // Fetch dynamic filter options on mount
    React.useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await fetch('/api/filter-options');
                const data: FilterOptions = await response.json();
                setFilterOptions(data);

                // Update budget min/max based on API response
                setFilters(prev => ({
                    ...prev,
                    budgetMin: data.budget.min,
                    budgetMax: data.budget.max,
                }));
            } catch (error) {
                console.error('Failed to fetch filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

    const handleApply = () => {
        onFilterChange(filters);
    };

    const handleBudgetChange = (value: number, type: 'min' | 'max') => {
        setFilters(prev => ({
            ...prev,
            [type === 'min' ? 'budgetMin' : 'budgetMax']: value,
        }));
    };

    return (
        <div className={`rounded-3xl border border-gray-200 bg-white shadow-sm ${className}`}>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-3 lg:p-4 xl:grid-cols-5 xl:gap-4 xl:p-5">
                {/* Subject Dropdown */}
                <div className="flex w-full items-center gap-2 sm:w-auto lg:col-span-1">
                    <Icon icon="ph:book" className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500">Subject</label>
                        <Combobox
                            options={[
                                { value: '', label: 'All Subjects' },
                                ...subjects.map(s => ({ value: s.id.toString(), label: s.name }))
                            ]}
                            value={filters.subject?.toString() || ''}
                            onChange={(val) => setFilters(prev => ({ ...prev, subject: val ? Number(val) : null }))}
                            placeholder="All Subjects"
                            searchPlaceholder="Search subjects..."
                            emptyText="No subject found"
                            className="mt-0.5 h-auto w-full border-none bg-transparent p-0 text-sm font-medium shadow-none hover:bg-transparent"
                        />
                    </div>
                </div>

                {/* Time Preference */}
                <div className="flex w-full items-center gap-2 sm:w-auto lg:col-span-1">
                    <Icon icon="mdi:clock-outline" className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500">Time Preference</label>
                        <Select
                            value={filters.timePreference || undefined}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, timePreference: val || null }))}
                        >
                            <SelectTrigger className="mt-0.5 h-auto w-full border-none bg-transparent p-0 text-sm font-medium shadow-none">
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.time_preferences.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                        {time.label}
                                        {time.teacher_count && ` (${time.teacher_count})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Budget Slider */}
                <div className="flex w-full items-center gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-1">
                    <Icon icon="mdi:cash" className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-500">Budget:</label>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, currency: prev.currency === 'USD' ? 'NGN' : 'USD' }))}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                {filters.currency}
                            </button>
                        </div>
                        <div className="space-y-1">
                            <input
                                type="range"
                                min={filterOptions.budget.min}
                                max={filterOptions.budget.max}
                                step="100"
                                value={filters.budgetMax}
                                onChange={(e) => handleBudgetChange(Number(e.target.value), 'max')}
                                className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                                style={{
                                    background: `linear-gradient(to right, #338078 0%, #338078 ${((filters.budgetMax - filterOptions.budget.min) / (filterOptions.budget.max - filterOptions.budget.min)) * 100}%, #e5e7eb ${((filters.budgetMax - filterOptions.budget.min) / (filterOptions.budget.max - filterOptions.budget.min)) * 100}%, #e5e7eb 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs font-medium text-gray-900">
                                <span>{filters.currency === 'NGN' ? '₦' : '$'}{filters.budgetMin.toLocaleString()}</span>
                                <span>{filters.currency === 'NGN' ? '₦' : '$'}{filters.budgetMax.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider - Hidden on mobile - REMOVED */}

                {/* Language with Select */}
                <div className="flex min-w-[160px] flex-1 items-center gap-2">
                    <Icon icon="mdi:translate" className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500">Language</label>
                        <Select
                            value={filters.language || undefined}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, language: val || null }))}
                        >
                            <SelectTrigger className="mt-0.5 h-auto w-full border-none bg-transparent p-0 text-sm font-medium shadow-none">
                                <SelectValue placeholder="Choose Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.languages.map((lang) => (
                                    <SelectItem key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </SelectItem>
                                ))}&rbrace;
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Apply Button */}
                <button
                    onClick={handleApply}
                    className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:col-span-2 lg:col-span-3 xl:col-span-1 xl:w-auto xl:px-8"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};
