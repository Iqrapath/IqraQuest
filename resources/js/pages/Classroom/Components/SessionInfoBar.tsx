import { useState, useEffect, useMemo } from 'react';
import { useConnectionState, useParticipants, useLocalParticipant } from '@livekit/components-react';
import { ConnectionQuality } from 'livekit-client';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SessionInfoBarProps {
    booking: any;
    isTeacher: boolean;
}

export default function SessionInfoBar({ booking, isTeacher }: SessionInfoBarProps) {
    const connectionState = useConnectionState();
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();
    
    const [elapsed, setElapsed] = useState(0);
    const [now, setNow] = useState(new Date());
    const [showCopied, setShowCopied] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(ConnectionQuality.Unknown);
    
    // Track connection quality
    useEffect(() => {
        const updateQuality = () => {
            setConnectionQuality(localParticipant.connectionQuality);
        };
        updateQuality();
        localParticipant.on('connectionQualityChanged', updateQuality);
        return () => {
            localParticipant.off('connectionQualityChanged', updateQuality);
        };
    }, [localParticipant]);

    // Calculate session times
    const sessionTimes = useMemo(() => {
        if (!booking.date || !booking.start_time) return null;
        const [year, month, day] = booking.date.split('-').map(Number);
        const [hours, minutes] = booking.start_time.split(':').map(Number);
        const startTime = new Date(year, month - 1, day, hours, minutes);
        const duration = booking.duration || 60;
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        return { startTime, endTime, duration };
    }, [booking.date, booking.start_time, booking.duration]);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(e => e + 1);
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    // Calculate remaining time
    const timeStatus = useMemo(() => {
        if (!sessionTimes) return { remaining: null, isOvertime: false, percentComplete: 0 };
        const { endTime, duration } = sessionTimes;
        const remainingMs = endTime.getTime() - now.getTime();
        const remainingSeconds = Math.floor(remainingMs / 1000);
        const elapsedMinutes = Math.floor(elapsed / 60);
        const percentComplete = Math.min(100, (elapsedMinutes / duration) * 100);
        return { remaining: remainingSeconds, isOvertime: remainingSeconds < 0, percentComplete };
    }, [sessionTimes, now, elapsed]);

    const formatTime = (seconds: number) => {
        const absSeconds = Math.abs(seconds);
        const h = Math.floor(absSeconds / 3600);
        const m = Math.floor((absSeconds % 3600) / 60);
        const s = absSeconds % 60;
        const prefix = seconds < 0 ? '+' : '';
        return h > 0 
            ? `${prefix}${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${prefix}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Copy invite link
    const copyInviteLink = async () => {
        const link = `${window.location.origin}/classroom/${booking.id}/join`;
        try {
            await navigator.clipboard.writeText(link);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Get network quality info
    const getNetworkQuality = () => {
        switch (connectionQuality) {
            case ConnectionQuality.Excellent:
                return { label: 'Excellent', color: 'text-primary', bg: 'bg-pale-green', bars: 4 };
            case ConnectionQuality.Good:
                return { label: 'Good', color: 'text-primary', bg: 'bg-pale-green', bars: 3 };
            case ConnectionQuality.Poor:
                return { label: 'Poor', color: 'text-orange', bg: 'bg-orange/10', bars: 2 };
            case ConnectionQuality.Lost:
                return { label: 'Lost', color: 'text-destructive', bg: 'bg-light-pink', bars: 0 };
            default:
                return { label: 'Checking', color: 'text-gray-400', bg: 'bg-gray-100', bars: 1 };
        }
    };

    const networkQuality = getNetworkQuality();

    const getTimerStyle = () => {
        if (!timeStatus.remaining) return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-foreground' };
        if (timeStatus.isOvertime) return { bg: 'bg-light-pink', border: 'border-pink', text: 'text-destructive' };
        if (timeStatus.remaining < 300) return { bg: 'bg-orange/10', border: 'border-orange/30', text: 'text-orange' };
        if (timeStatus.remaining < 600) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' };
        return { bg: 'bg-pale-green', border: 'border-light-teal', text: 'text-primary' };
    };

    const timerStyle = getTimerStyle();

    return (
        <div className="flex items-center justify-between px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.375rem,1vw,0.5rem)] bg-white border-b border-gray-100">
            {/* Left - Session Info */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pale-green flex items-center justify-center">
                    <Icon icon="mdi:book-education" className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-body-s-semibold text-foreground line-clamp-1">
                        {booking.subject?.name || 'Live Session'}
                    </h2>
                    <p className="text-body-xs-regular text-muted-foreground">
                        with {isTeacher ? booking.student?.name : booking.teacher?.user?.name || 'Participant'}
                    </p>
                </div>
            </div>

            {/* Center - Status Badges */}
            <div className="flex items-center gap-[clamp(0.375rem,1vw,0.5rem)]">
                {/* Live Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-light-pink border border-pink rounded-full">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-body-xs-semibold text-destructive">LIVE</span>
                </div>


                {/* Network Quality Indicator */}
                <div className={cn(
                    "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                    networkQuality.bg, "border-gray-200"
                )}>
                    <div className="flex items-end gap-0.5 h-4">
                        {[1, 2, 3, 4].map(bar => (
                            <div
                                key={bar}
                                className={cn(
                                    "w-1 rounded-sm transition-all",
                                    bar <= networkQuality.bars ? networkQuality.color.replace('text-', 'bg-') : 'bg-gray-200'
                                )}
                                style={{ height: `${bar * 25}%` }}
                            />
                        ))}
                    </div>
                    <span className={cn("text-body-xs-medium", networkQuality.color)}>
                        {networkQuality.label}
                    </span>
                </div>

                {/* Timer */}
                <div className={cn(
                    "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors",
                    timerStyle.bg, timerStyle.border
                )}>
                    <Icon 
                        icon={timeStatus.isOvertime ? "mdi:clock-alert" : "mdi:clock-outline"} 
                        className={cn("w-4 h-4", timeStatus.remaining ? timerStyle.text : "text-gray-400")} 
                    />
                    <div className="flex flex-col items-end">
                        {timeStatus.remaining !== null ? (
                            <>
                                <span className={cn("text-body-xs-semibold font-mono", timerStyle.text)}>
                                    {timeStatus.isOvertime ? 'Overtime' : 'Remaining'}: {formatTime(timeStatus.remaining)}
                                </span>
                                <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            timeStatus.isOvertime ? "bg-destructive" :
                                            timeStatus.remaining < 300 ? "bg-orange" :
                                            timeStatus.remaining < 600 ? "bg-amber-500" : "bg-primary"
                                        )}
                                        style={{ width: `${timeStatus.percentComplete}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <span className="text-body-xs-semibold text-foreground font-mono">
                                {formatTime(elapsed)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Connection Status */}
                <div className={cn(
                    "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                    connectionState === 'connected' 
                        ? "bg-pale-green border-light-teal" 
                        : connectionState === 'reconnecting'
                            ? "bg-orange/10 border-orange/30"
                            : "bg-light-pink border-pink"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        connectionState === 'connected' ? "bg-primary" :
                        connectionState === 'reconnecting' ? "bg-orange animate-pulse" : "bg-destructive"
                    )} />
                    <span className={cn(
                        "text-body-xs-medium capitalize",
                        connectionState === 'connected' ? "text-primary" :
                        connectionState === 'reconnecting' ? "text-orange" : "text-destructive"
                    )}>{connectionState}</span>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <Icon icon="mdi:account-group" className="w-4 h-4 text-gray-400" />
                    <span className="text-body-xs-semibold text-foreground">{participants.length}</span>
                </div>
            </div>

            {/* Right - Copy Link & Role Badge */}
            <div className="hidden lg:flex items-center gap-2">
                {/* Copy Invite Link (Teacher only) */}
                {isTeacher && (
                    <button
                        onClick={copyInviteLink}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all",
                            showCopied 
                                ? "bg-pale-green border-light-teal text-primary" 
                                : "bg-gray-50 border-gray-100 hover:bg-gray-100 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon icon={showCopied ? "mdi:check" : "mdi:link-variant"} className="w-4 h-4" />
                        <span className="text-body-xs-semibold">
                            {showCopied ? 'Copied!' : 'Copy Link'}
                        </span>
                    </button>
                )}

                {/* Role Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-pale-green border border-light-teal rounded-full">
                    <Icon icon={isTeacher ? "mdi:school" : "mdi:account-school"} className="w-4 h-4 text-primary" />
                    <span className="text-body-xs-semibold text-primary">{isTeacher ? 'Teacher' : 'Student'}</span>
                </div>
            </div>
        </div>
    );
}
