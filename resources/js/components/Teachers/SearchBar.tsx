import React from 'react';
import { Icon } from '@iconify/react';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search for competent teacher or subject',
    value,
    onChange,
    onSearch,
    className = '',
}) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[14.57px]">
                <Icon icon="iconamoon:search-thin" className="h-[15px] w-[15px] text-gray-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="block h-[42px] w-full rounded-full border border-gray-300 py-3 pl-[35px] pr-15 text-[15px] leading-[18px] text-gray-900 placeholder-gray-500 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                >
                    <Icon icon="mdi:close" className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
