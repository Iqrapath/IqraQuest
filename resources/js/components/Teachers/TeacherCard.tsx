import React from 'react';
import { Icon } from '@iconify/react';
import { useCurrency, CURRENCY_CONFIG } from '@/contexts/CurrencyContext';

interface TeacherCardProps {
    teacher: {
        id: number;
        user: {
            name: string;
            avatar?: string;
        };
        bio?: string;
        experience_years?: number;
        hourly_rate: number | null;
        subjects: Array<{
            id: number;
            name: string;
            proficiency_level?: string;
        }>;
        average_rating: number;
        total_reviews: number;
    };
    onViewProfile?: (teacherId: number) => void;
    className?: string;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
    teacher,
    onViewProfile,
    className = '',
}) => {
    const { convert } = useCurrency();

    const handleViewProfile = () => {
        if (onViewProfile) {
            onViewProfile(teacher.id);
        }
    };

    // Get avatar with fallback
    const avatarSrc = teacher.user.avatar
        ? `/storage/${teacher.user.avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}&background=338078&color=fff&size=400`;

    // Dynamic Price Calculation
    // Base rate is in NGN (from TeacherSeeder/Backend)
    const baseRateNGN = teacher.hourly_rate || 0;

    // Calculate USD
    const rateUSD = convert(baseRateNGN, 'NGN', 'USD');

    // Formatting helpers
    const formatCurrency = (val: number, currency: 'NGN' | 'USD') => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0,
        }).format(val);
    };

    const filledStars = Math.floor(teacher.average_rating);

    return (
        <div
            className={`group flex flex-col items-center gap-3 rounded-[32px] border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:gap-4 ${className}`}
        >
            {/* Teacher Avatar */}
            <div className="relative h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-[28px] bg-gray-100 sm:h-[100px] sm:w-[100px]">
                <img
                    src={avatarSrc}
                    alt={teacher.user.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Teacher Info */}
            <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:pt-1 sm:text-left">
                {/* Name */}
                <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-tight text-gray-900 sm:text-lg">
                    {teacher.user.name}
                </h3>

                {/* Subject */}
                <div className="mb-1.5 flex items-center justify-center gap-1 text-xs sm:items-baseline sm:justify-start">
                    <span className="flex-shrink-0 text-gray-500">Subject:</span>
                    <span className="min-w-0 font-semibold text-gray-900">
                        {teacher.subjects.slice(0, 2).map(s => s.name).join(', ')}
                    </span>
                </div>

                {/* Location */}
                <div className="mb-1.5 flex items-center justify-center gap-1 sm:justify-start">
                    <Icon icon="mdi:map-marker-outline" className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                    <span className="truncate text-xs text-gray-600">Quwait</span>
                </div>

                {/* Rating */}
                <div className="mb-1.5 flex items-center justify-center gap-1 sm:justify-start">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, index) => (
                            <Icon
                                key={index}
                                icon="mdi:star"
                                className={`h-4 w-4 flex-shrink-0 ${index < filledStars
                                    ? 'text-[#FDB022]'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                        {teacher.average_rating > 0 ? `${teacher.average_rating.toFixed(1)}/5` : '0.0/5'}
                    </span>
                </div>

                {/* Availability */}
                <div className="mb-3 flex items-center justify-center gap-1 text-xs sm:items-baseline sm:justify-start">
                    <span className="flex-shrink-0 text-gray-500">Availability:</span>
                    <span className="truncate font-semibold text-gray-900">Mon-Fri, 5-8 PM</span>
                </div>

                {/* Price & View Profile - Bottom Row - 3 Items */}
                <div className="mt-auto flex w-full min-w-0 flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
                    {/* Price Badge */}
                    <div className="flex flex-shrink-0 flex-col rounded-2xl bg-[#E6F7F5] px-3 py-1.5">
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-[#00A991]">
                                ${formatCurrency(rateUSD, 'USD')}
                            </span>
                            <span className="text-[10px] font-medium text-[#00A991]">
                                / ₦{formatCurrency(baseRateNGN, 'NGN')}
                            </span>
                        </div>
                        <span className="text-[10px] text-[#00A991]">
                            Per session
                        </span>
                    </div>

                    {/* View Profile Text - Opens Modal */}
                    <button
                        onClick={handleViewProfile}
                        className="flex-shrink-0 cursor-pointer whitespace-nowrap text-sm font-semibold text-[#00A991] transition-colors hover:text-[#008c7a]"
                    >
                        View Profile
                    </button>

                    {/* Message Icon Button */}
                    <button
                        onClick={handleViewProfile}
                        className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-[14px] border-b-2 border-[#00A991] text-[#00A991] transition-all hover:bg-[#E6F7F5]"
                    >
                        <Icon icon="fluent:chat-24-regular" className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
