import { format, parseISO } from 'date-fns';
import { usePage } from '@inertiajs/react';

/**
 * Custom hook or utility to format dates based on global settings
 */
export const useFormatDate = () => {
    const { props } = usePage<any>();
    const globalDateFormat = props.settings?.localization?.date_format || 'dd/MM/yyyy';

    // Map PHP/Common formats to date-fns formats if needed
    // Common mappings: DD -> dd, YYYY -> yyyy
    const dateFormat = globalDateFormat
        .replace(/DD/g, 'dd')
        .replace(/YYYY/g, 'yyyy');

    const formatDate = (date: string | Date | null | undefined, formatStr?: string) => {
        if (!date) return '';

        try {
            const dateObj = typeof date === 'string' ? parseISO(date) : date;
            return format(dateObj, formatStr || dateFormat);
        } catch (error) {
            console.error('Date formatting error:', error);
            return String(date);
        }
    };

    const formatDateTime = (date: string | Date | null | undefined) => {
        return formatDate(date, `${dateFormat} HH:mm`);
    };

    return { formatDate, formatDateTime, dateFormat };
};

/**
 * Standard utility for non-hook usage (requires passing settings)
 */
export const formatDateWithSettings = (
    date: string | Date | null | undefined,
    settings: { date_format: string },
    formatOverride?: string
) => {
    if (!date) return '';

    const dateFormat = (settings.date_format || 'dd/MM/yyyy')
        .replace(/DD/g, 'dd')
        .replace(/YYYY/g, 'yyyy');

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatOverride || dateFormat);
    } catch (error) {
        return String(date);
    }
};
