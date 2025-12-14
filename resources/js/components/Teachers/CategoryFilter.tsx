import React, { useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface CategoryFilterProps {
    categories: Array<{
        id: number;
        name: string;
        icon?: string;
    }>;
    selected?: number | null;
    onSelect: (categoryId: number | null) => void;
    className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    selected,
    onSelect,
    className = '',
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 1
            );
        }
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            return () => container.removeEventListener('scroll', checkScroll);
        }
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Scroll Left Button */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:shadow-lg"
                    aria-label="Scroll left"
                >
                    <Icon icon="mdi:chevron-left" className="h-5 w-5 text-gray-700" />
                </button>
            )}

            {/* Categories Container */}
            <div
                ref={scrollContainerRef}
                className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth py-2"
            >
                {/* All Categories Button */}
                <button
                    onClick={() => onSelect(null)}
                    className={`flex-shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all ${selected === null
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                >
                    All Subjects
                </button>

                {/* Category Buttons */}
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onSelect(category.id)}
                        className={`flex flex-shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${selected === category.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        {category.icon && <span className="text-base">{category.icon}</span>}
                        <span>{category.name}</span>
                    </button>
                ))}
            </div>

            {/* Scroll Right Button */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:shadow-lg"
                    aria-label="Scroll right"
                >
                    <Icon icon="mdi:chevron-right" className="h-5 w-5 text-gray-700" />
                </button>
            )}
        </div>
    );
};
