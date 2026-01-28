import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function parseDBDate(dateStr: string): Date {
    // Ensure the date string is treated as UTC by appending 'Z' if not present
    // and replacing space with T if necessary.
    // Standard Laravel DB timestamp format is 'YYYY-MM-DD HH:MM:SS'
    let isoStr = dateStr.replace(' ', 'T');
    if (!isoStr.endsWith('Z') && !isoStr.includes('+')) {
        isoStr += 'Z';
    }
    return new Date(isoStr);
}
