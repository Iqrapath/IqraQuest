import {
    VideoTrack,
    AudioTrack,
    TrackReferenceOrPlaceholder,
    useIsSpeaking
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ParticipantTileProps {
    trackRef: TrackReferenceOrPlaceholder;
    className?: string;
    compact?: boolean;
    isScreenShare?: boolean;
}

export default function ParticipantTile({ 
    trackRef, 
    className,
    compact = false,
    isScreenShare = false
}: ParticipantTileProps) {
    const participant = trackRef.participant;
    const isSpeaking = useIsSpeaking(participant);
    
    const isCamera = trackRef.source === Track.Source.Camera;
    const isScreen = trackRef.source === Track.Source.ScreenShare;
    const isMuted = trackRef.publication?.isMuted;
    const hasVideo = trackRef.publication?.isSubscribed && !isMuted;

    const getInitials = () => (participant.name || participant.identity || 'U').charAt(0).toUpperCase();

    const avatarColors = [
        { bg: 'bg-pale-green', text: 'text-primary', border: 'border-light-teal' },
        { bg: 'bg-light-purple/30', text: 'text-purple', border: 'border-light-purple' },
        { bg: 'bg-pale-blue/30', text: 'text-blue', border: 'border-pale-blue' },
        { bg: 'bg-orange/20', text: 'text-orange', border: 'border-orange/30' },
        { bg: 'bg-light-pink', text: 'text-destructive', border: 'border-pink' },
    ];
    
    const getAvatarStyle = () => {
        const hash = (participant.identity || '').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
        return avatarColors[Math.abs(hash) % avatarColors.length];
    };

    const avatarStyle = getAvatarStyle();

    return (
        <div
            className={cn(
                "relative bg-gray-100 overflow-hidden transition-all duration-300 group",
                compact ? "rounded-xl" : "rounded-2xl",
                isSpeaking && !isScreenShare && "ring-3 ring-primary ring-offset-2 ring-offset-white",
                className
            )}
        >
            {/* Video */}
            {(isCamera || isScreen) && trackRef.publication && (
                <VideoTrack
                    trackRef={trackRef as any}
                    className={cn("w-full h-full", isScreen ? "object-contain bg-gray-900" : "object-cover")}
                />
            )}

            {/* Avatar when no video */}
            {!hasVideo && !isScreen && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className={cn(
                        "rounded-full flex items-center justify-center border-4",
                        avatarStyle.bg,
                        avatarStyle.border,
                        compact 
                            ? "w-[clamp(2.5rem,7vw,3rem)] h-[clamp(2.5rem,7vw,3rem)]" 
                            : "w-[clamp(4rem,10vw,5.5rem)] h-[clamp(4rem,10vw,5.5rem)]"
                    )}>
                        <span className={cn(
                            "font-semibold",
                            avatarStyle.text,
                            compact ? "text-lg" : "text-[clamp(1.5rem,3.5vw,2rem)]"
                        )}>
                            {getInitials()}
                        </span>
                    </div>
                </div>
            )}

            {/* Audio */}
            {trackRef.publication && <AudioTrack trackRef={trackRef as any} />}

            {/* Gradient overlay for text visibility */}
            {!isScreenShare && hasVideo && (
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            )}

            {/* Name badge */}
            {!isScreenShare && (
                <div className={cn(
                    "absolute left-2 z-10 flex items-center gap-2 rounded-lg",
                    hasVideo 
                        ? "bg-black/50 backdrop-blur-sm" 
                        : "bg-white shadow-sm border border-gray-100",
                    compact ? "bottom-1.5 px-2 py-1" : "bottom-3 px-3 py-1.5"
                )}>
                    {/* Mic Status */}
                    {participant.isMicrophoneEnabled ? (
                        <div className="relative">
                            <div className={cn(
                                "rounded-full",
                                hasVideo ? "bg-green-400" : "bg-primary",
                                compact ? "w-2 h-2" : "w-2.5 h-2.5"
                            )} />
                            {isSpeaking && (
                                <div className={cn(
                                    "absolute inset-0 rounded-full animate-ping",
                                    hasVideo ? "bg-green-400" : "bg-primary"
                                )} />
                            )}
                        </div>
                    ) : (
                        <Icon 
                            icon="mdi:microphone-off" 
                            className={cn(
                                hasVideo ? "text-red-400" : "text-destructive",
                                compact ? "w-3 h-3" : "w-4 h-4"
                            )} 
                        />
                    )}
                    
                    {/* Name */}
                    <span className={cn(
                        "truncate",
                        hasVideo ? "text-white" : "text-foreground",
                        compact ? "text-[10px] max-w-[50px]" : "text-body-xs-medium max-w-[100px]"
                    )}>
                        {participant.name || participant.identity}
                        {participant.isLocal && <span className={hasVideo ? "text-white/70" : "text-muted-foreground"}> (You)</span>}
                    </span>
                </div>
            )}

            {/* Speaking indicator */}
            {isSpeaking && !isScreenShare && !compact && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary rounded-full shadow-lg">
                        <div className="flex items-center gap-0.5">
                            <div className="w-1 h-2.5 bg-white rounded-full animate-pulse" />
                            <div className="w-1 h-3.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10px] text-white font-semibold">Speaking</span>
                    </div>
                </div>
            )}

            {/* Camera off indicator */}
            {!hasVideo && !isScreen && !compact && (
                <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white shadow-sm border border-gray-100 rounded-full">
                        <Icon icon="mdi:video-off-outline" className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-muted-foreground font-medium">Camera off</span>
                    </div>
                </div>
            )}

            {/* Hover overlay for actions */}
            {!isScreenShare && !compact && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            )}
        </div>
    );
}
