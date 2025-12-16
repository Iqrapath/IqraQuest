import { useState, useEffect, useCallback } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RaisedHand {
    participantId: string;
    participantName: string;
    timestamp: number;
}

interface ControlBarProps {
    isTeacher: boolean;
    activePanel: 'none' | 'materials' | 'chat' | 'present' | 'poll' | 'quran';
    onToggleMaterials: () => void;
    onToggleChat: () => void;
    onTogglePresent: () => void;
    onTogglePoll?: () => void;
    onToggleQuran?: () => void;
    onToggleWhiteboard?: () => void;
    materialsCount: number;
    participantsCount: number;
    isPresenting?: boolean;
    isWhiteboardActive?: boolean;
    isHandRaised?: boolean;
    onToggleHand?: () => void;
    raisedHands?: RaisedHand[];
    onLowerHand?: (participantId: string) => void;
}

// Leave confirmation dialog component
function LeaveConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void;
}) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-light-pink flex items-center justify-center mx-auto mb-4">
                        <Icon icon="mdi:exit-run" className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-body-lg text-foreground mb-2">Leave Session?</h3>
                    <p className="text-body-s-regular text-muted-foreground">
                        Are you sure you want to leave this classroom session?
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-foreground rounded-xl text-body-s-semibold transition-colors"
                    >
                        Stay
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-destructive hover:bg-destructive/90 text-white rounded-xl text-body-s-semibold transition-colors"
                    >
                        Leave
                    </button>
                </div>
            </div>
        </div>
    );
}


export default function ControlBar({ 
    isTeacher,
    activePanel,
    onToggleMaterials, 
    onToggleChat,
    onTogglePresent,
    onTogglePoll,
    onToggleQuran,
    onToggleWhiteboard,
    materialsCount,
    isPresenting = false,
    isWhiteboardActive = false,
    isHandRaised = false,
    onToggleHand,
    raisedHands = [],
    onLowerHand,
}: ControlBarProps) {
    const [showRaisedHands, setShowRaisedHands] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();
    
    const isMicEnabled = localParticipant.isMicrophoneEnabled;
    const isCamEnabled = localParticipant.isCameraEnabled;
    const isScreenShareEnabled = localParticipant.isScreenShareEnabled;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            switch (e.key.toLowerCase()) {
                case 'm':
                    e.preventDefault();
                    localParticipant.setMicrophoneEnabled(!isMicEnabled);
                    break;
                case 'v':
                    e.preventDefault();
                    localParticipant.setCameraEnabled(!isCamEnabled);
                    break;
                case 'c':
                    e.preventDefault();
                    onToggleChat();
                    break;
                case 'escape':
                    setShowMoreMenu(false);
                    setShowRaisedHands(false);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMicEnabled, isCamEnabled, localParticipant, onToggleChat]);

    const toggleMicrophone = async () => {
        await localParticipant.setMicrophoneEnabled(!isMicEnabled);
    };

    const toggleCamera = async () => {
        await localParticipant.setCameraEnabled(!isCamEnabled);
    };

    const toggleScreenShare = async () => {
        await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    };

    const handleDisconnect = () => {
        setShowLeaveConfirm(true);
    };

    const confirmDisconnect = () => {
        setShowLeaveConfirm(false);
        room.disconnect();
    };

    // Control button component for reuse
    const ControlButton = useCallback(({ 
        onClick, 
        active, 
        activeColor = 'primary',
        icon, 
        label,
        badge,
        className,
        hideOnMobile = false,
    }: { 
        onClick: () => void; 
        active: boolean;
        activeColor?: 'primary' | 'destructive' | 'orange' | 'purple' | 'teal';
        icon: string;
        label: string;
        badge?: number;
        className?: string;
        hideOnMobile?: boolean;
    }) => {
        const colorClasses = {
            primary: 'bg-primary text-white shadow-md shadow-primary/20',
            destructive: 'bg-destructive text-white hover:bg-destructive/90',
            orange: 'bg-orange text-white shadow-md shadow-orange/20',
            purple: 'bg-purple text-white shadow-md shadow-purple/20',
            teal: 'bg-teal text-white shadow-md shadow-teal/20',
        };

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        className={cn(
                            "relative w-11 h-11 md:w-[clamp(2.75rem,6vw,3.25rem)] md:h-[clamp(2.75rem,6vw,3.25rem)] rounded-xl flex items-center justify-center transition-all",
                            active ? colorClasses[activeColor] : "bg-gray-100 hover:bg-gray-200 text-foreground",
                            hideOnMobile && "hidden md:flex",
                            className
                        )}
                    >
                        <Icon icon={icon} className="w-5 h-5 md:w-[clamp(1.25rem,2.5vw,1.5rem)] md:h-[clamp(1.25rem,2.5vw,1.5rem)]" />
                        {badge !== undefined && badge > 0 && !active && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {badge}
                            </span>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-body-xs-medium">{label}</p>
                </TooltipContent>
            </Tooltip>
        );
    }, []);

    return (
        <TooltipProvider delayDuration={200}>
            {/* Leave Confirmation Dialog */}
            <LeaveConfirmDialog 
                isOpen={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={confirmDisconnect}
            />

            <div className="flex items-center justify-center py-2 md:py-3">
                <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-white rounded-2xl shadow-lg border border-gray-100">
                    {/* Primary Controls - Always visible */}
                    <ControlButton
                        onClick={toggleMicrophone}
                        active={!isMicEnabled}
                        activeColor="destructive"
                        icon={isMicEnabled ? "mdi:microphone" : "mdi:microphone-off"}
                        label={isMicEnabled ? 'Mute (M)' : 'Unmute (M)'}
                    />

                    <ControlButton
                        onClick={toggleCamera}
                        active={!isCamEnabled}
                        activeColor="destructive"
                        icon={isCamEnabled ? "mdi:video" : "mdi:video-off"}
                        label={isCamEnabled ? 'Stop Video (V)' : 'Start Video (V)'}
                    />

                    <div className="w-px h-8 bg-gray-200 mx-0.5 md:mx-1 hidden sm:block" />

                    {/* Screen Share - Hidden on very small screens */}
                    <ControlButton
                        onClick={toggleScreenShare}
                        active={isScreenShareEnabled}
                        icon={isScreenShareEnabled ? "mdi:monitor-share" : "mdi:monitor"}
                        label={isScreenShareEnabled ? 'Stop Sharing' : 'Share Screen'}
                        hideOnMobile
                    />

                    {/* Raise Hand (Student only) */}
                    {!isTeacher && onToggleHand && (
                        <ControlButton
                            onClick={onToggleHand}
                            active={isHandRaised}
                            activeColor="orange"
                            icon={isHandRaised ? "mdi:hand-back-left" : "mdi:hand-back-left-outline"}
                            label={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                        />
                    )}

                    {/* Raised Hands Indicator (Teacher only) */}
                    {isTeacher && raisedHands.length > 0 && (
                        <div className="relative">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setShowRaisedHands(!showRaisedHands)}
                                        className="relative w-11 h-11 md:w-[clamp(2.75rem,6vw,3.25rem)] md:h-[clamp(2.75rem,6vw,3.25rem)] rounded-xl flex items-center justify-center transition-all bg-orange text-white shadow-md shadow-orange/20"
                                    >
                                        <Icon icon="mdi:hand-back-left" className="w-5 h-5 md:w-[clamp(1.25rem,2.5vw,1.5rem)] md:h-[clamp(1.25rem,2.5vw,1.5rem)] animate-bounce" />
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                            {raisedHands.length}
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-body-xs-medium">{raisedHands.length} hand{raisedHands.length > 1 ? 's' : ''} raised</p>
                                </TooltipContent>
                            </Tooltip>

                            {showRaisedHands && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="px-3 py-2 bg-orange/10 border-b border-orange/20">
                                        <p className="text-body-xs-semibold text-orange flex items-center gap-2">
                                            <Icon icon="mdi:hand-back-left" className="w-4 h-4" />
                                            Raised Hands
                                        </p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {raisedHands.map((hand) => (
                                            <div key={hand.participantId} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-pale-green flex items-center justify-center">
                                                        <Icon icon="mdi:account" className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-body-xs-medium text-foreground">{hand.participantName}</span>
                                                </div>
                                                <button
                                                    onClick={() => onLowerHand?.(hand.participantId)}
                                                    className="px-2 py-1 text-body-xs-medium text-muted-foreground hover:text-destructive hover:bg-light-pink rounded transition-colors"
                                                >
                                                    Lower
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Whiteboard (Teacher only) - Desktop */}
                    {isTeacher && onToggleWhiteboard && (
                        <ControlButton
                            onClick={onToggleWhiteboard}
                            active={isWhiteboardActive}
                            activeColor="teal"
                            icon="mdi:draw"
                            label={isWhiteboardActive ? 'Close Whiteboard' : 'Open Whiteboard'}
                            hideOnMobile
                        />
                    )}

                    <div className="w-px h-8 bg-gray-200 mx-0.5 md:mx-1" />

                    {/* Chat - Always visible */}
                    <ControlButton
                        onClick={onToggleChat}
                        active={activePanel === 'chat'}
                        icon="mdi:chat-outline"
                        label="Chat (C)"
                    />

                    {/* Materials - Desktop only */}
                    <ControlButton
                        onClick={onToggleMaterials}
                        active={activePanel === 'materials'}
                        icon="mdi:folder-open-outline"
                        label="Materials"
                        badge={materialsCount}
                        hideOnMobile
                    />

                    {/* More Menu - Mobile only */}
                    <div className="relative md:hidden">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={cn(
                                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                                        showMoreMenu ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 text-foreground"
                                    )}
                                >
                                    <Icon icon="mdi:dots-horizontal" className="w-5 h-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-body-xs-medium">More</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* More Menu Dropdown */}
                        {showMoreMenu && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => { toggleScreenShare(); setShowMoreMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Icon icon={isScreenShareEnabled ? "mdi:monitor-share" : "mdi:monitor"} className={cn("w-5 h-5", isScreenShareEnabled && "text-primary")} />
                                        <span className="text-body-xs-medium text-foreground">{isScreenShareEnabled ? 'Stop Sharing' : 'Share Screen'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => { onToggleMaterials(); setShowMoreMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Icon icon="mdi:folder-open-outline" className={cn("w-5 h-5", activePanel === 'materials' && "text-primary")} />
                                        <span className="text-body-xs-medium text-foreground">Materials</span>
                                        {materialsCount > 0 && (
                                            <span className="ml-auto px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">{materialsCount}</span>
                                        )}
                                    </button>

                                    {onTogglePoll && (
                                        <button
                                            onClick={() => { onTogglePoll(); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Icon icon="mdi:poll" className={cn("w-5 h-5", activePanel === 'poll' && "text-orange")} />
                                            <span className="text-body-xs-medium text-foreground">Polls & Quizzes</span>
                                        </button>
                                    )}

                                    {onToggleQuran && (
                                        <button
                                            onClick={() => { onToggleQuran(); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Icon icon="mdi:book-open-page-variant" className={cn("w-5 h-5", activePanel === 'quran' && "text-primary")} />
                                            <span className="text-body-xs-medium text-foreground">Quran Recitation</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => { onTogglePresent(); setShowMoreMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Icon icon="mdi:presentation" className={cn("w-5 h-5", (activePanel === 'present' || isPresenting) && "text-purple")} />
                                        <span className="text-body-xs-medium text-foreground">Present Document</span>
                                        {isPresenting && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                                    </button>

                                    {isTeacher && onToggleWhiteboard && (
                                        <button
                                            onClick={() => { onToggleWhiteboard(); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Icon icon="mdi:draw" className={cn("w-5 h-5", isWhiteboardActive && "text-teal")} />
                                            <span className="text-body-xs-medium text-foreground">{isWhiteboardActive ? 'Close Whiteboard' : 'Open Whiteboard'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop-only buttons */}
                    {onTogglePoll && (
                        <ControlButton
                            onClick={onTogglePoll}
                            active={activePanel === 'poll'}
                            activeColor="orange"
                            icon="mdi:poll"
                            label="Polls & Quizzes"
                            hideOnMobile
                        />
                    )}

                    {onToggleQuran && (
                        <ControlButton
                            onClick={onToggleQuran}
                            active={activePanel === 'quran'}
                            icon="mdi:book-open-page-variant"
                            label="Quran Recitation"
                            hideOnMobile
                        />
                    )}

                    <ControlButton
                        onClick={onTogglePresent}
                        active={isPresenting || activePanel === 'present'}
                        activeColor="purple"
                        icon="mdi:presentation"
                        label={isPresenting ? 'Presenting...' : 'Present Document'}
                        hideOnMobile
                    />

                    <div className="w-px h-8 bg-gray-200 mx-0.5 md:mx-1" />

                    {/* Leave Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button 
                                onClick={handleDisconnect}
                                className="h-11 md:h-[clamp(2.75rem,6vw,3.25rem)] px-3 md:px-[clamp(1rem,2.5vw,1.5rem)] rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold flex items-center gap-2 transition-all"
                            >
                                <Icon icon="mdi:phone-hangup" className="w-5 h-5 md:w-[clamp(1.25rem,2.5vw,1.5rem)] md:h-[clamp(1.25rem,2.5vw,1.5rem)]" />
                                <span className="hidden sm:inline text-body-s-medium">Leave</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-body-xs-medium">Leave Session</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
