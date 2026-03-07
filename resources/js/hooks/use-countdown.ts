import { useState, useEffect, useCallback } from 'react';
import { differenceInSeconds, parseISO, isWithinInterval, addMinutes } from 'date-fns';

interface CountdownResult {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isSoon: boolean; // within 24 hours
    isVerySoon: boolean; // within 1 hour
    isLive: boolean; // currently ongoing
    isExpired: boolean; // passed end time
    formatted: string;
}

/**
 * Hook to calculate and update a real-time countdown to a target date.
 * 
 * @param targetDate ISO date string
 * @param durationMinutes Optional duration of the event
 */
export function useCountdown(targetDate: string | null | undefined, durationMinutes: number = 60): CountdownResult {
    const calculateTimeLeft = useCallback((): CountdownResult => {
        const now = new Date();

        if (!targetDate) {
            return {
                days: 0, hours: 0, minutes: 0, seconds: 0,
                isSoon: false, isVerySoon: false, isLive: false, isExpired: false,
                formatted: ''
            };
        }

        const start = parseISO(targetDate);
        const end = addMinutes(start, durationMinutes);

        // Check if currently live
        const isLive = isWithinInterval(now, { start, end });
        const isExpired = now > end;

        const diff = differenceInSeconds(start, now);

        if (diff <= 0) {
            return {
                days: 0, hours: 0, minutes: 0, seconds: 0,
                isSoon: false, isVerySoon: false, isLive, isExpired,
                formatted: isLive ? 'Live Now' : (isExpired ? 'Ended' : 'Starting...')
            };
        }

        const days = Math.floor(diff / (24 * 3600));
        const hours = Math.floor((diff % (24 * 3600)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        const isSoon = diff < 24 * 3600;
        const isVerySoon = diff < 3600;

        let formatted = '';
        if (days > 0) formatted += `${days}d `;
        if (hours > 0 || days > 0) formatted += `${hours}h `;
        formatted += `${minutes}m ${seconds}s`;

        return {
            days, hours, minutes, seconds,
            isSoon, isVerySoon, isLive, isExpired,
            formatted
        };
    }, [targetDate, durationMinutes]);

    const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft());

    useEffect(() => {
        if (!targetDate) return;

        const timer = setInterval(() => {
            const result = calculateTimeLeft();
            setTimeLeft(result);

            // If it's expired and we just found out, clear the interval
            if (result.isExpired) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft, targetDate]);

    return timeLeft;
}
