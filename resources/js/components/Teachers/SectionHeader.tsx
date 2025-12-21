import React from 'react';

interface SectionHeaderProps {
    title: string;
    actionText?: string;
    onActionClick?: () => void;
    showCount?: boolean;
    count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    actionText,
    onActionClick,
    showCount = false,
    count,
}) => {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
                {title}
                {showCount && count !== undefined && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        ({count})
                    </span>
                )}
            </h2>
            {actionText && (
                <button
                    onClick={onActionClick}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
};
