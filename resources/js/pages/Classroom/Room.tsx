import { useState, useEffect, useCallback } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useTracks,
    useConnectionState,
    useParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import type { SharedData } from '@/types';

import ControlBar from './Components/ControlBar';
import ParticipantTile from './Components/ParticipantTile';
import MaterialsPanel from './Components/MaterialsPanel';
import ChatPanel from './Components/ChatPanel';
import DocumentViewer, { DocumentPresentationView, useProjectionSync, useRaiseHand, type WhiteboardState, type RaisedHand } from './Components/DocumentViewer';
import PollPanel, { usePollNotification } from './Components/PollPanel';
import QuranPlayer from './Components/QuranPlayer';
import PreJoinScreen from './Components/PreJoinScreen';
import SessionInfoBar from './Components/SessionInfoBar';
import StudentHeader from '@/components/Layout/Student/StudentHeader';
import TeacherHeader from '@/components/Layout/Teacher/TeacherHeader';

interface Material {
    id: number;
    name: string;
    type: 'pdf' | 'image' | 'document' | 'video';
    url: string;
    size?: string;
}

interface Props {
    booking: any;
    token: string;
    roomName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    liveKitUrl: string;
    materials?: Material[];
}

export default function ClassroomRoom({ 
    booking, 
    token, 
    isTeacher, 
    liveKitUrl,
    materials: initialMaterials = []
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const [shouldConnect, setShouldConnect] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<'none' | 'materials' | 'chat' | 'present' | 'poll' | 'quran'>('none');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [selectedDevices, setSelectedDevices] = useState<{ videoDeviceId?: string; audioDeviceId?: string }>({});

    const handleJoin = async (video: boolean, audio: boolean, devices?: { videoDeviceId?: string; audioDeviceId?: string }) => {
        setVideoEnabled(video);
        setAudioEnabled(audio);
        if (devices) {
            setSelectedDevices(devices);
        }
        setShouldConnect(true);
        
        // Record attendance join
        try {
            await fetch(`/classroom/${booking.id}/attendance/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
        } catch (err) {
            console.error('Failed to record attendance:', err);
        }
    };

    const handleMediaDeviceFailure = () => {
        if (videoEnabled) {
            setError("Camera access failed. Switching to audio only.");
            setVideoEnabled(false);
            setTimeout(() => setError(null), 4000);
        } else {
            setError("Could not access microphone. Please check permissions.");
            setTimeout(() => setError(null), 4000);
        }
    };

    const togglePanel = useCallback((panel: 'materials' | 'chat' | 'present' | 'poll' | 'quran') => {
        setActivePanel(prev => prev === panel ? 'none' : panel);
    }, []);

    // Error state
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-poppins">
                <Head title="Configuration Error - IqraQuest" />
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-light-pink flex items-center justify-center mx-auto mb-6">
                        <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-h5 text-foreground mb-2">Configuration Error</h1>
                    <p className="text-body-s-regular text-muted-foreground mb-6">
                        Unable to connect to the session. Please try again or contact support.
                    </p>
                    <Link
                        href={isTeacher ? '/teacher/dashboard' : '/dashboard'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-button transition-all"
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Pre-join screen
    if (!shouldConnect) {
        return (
            <>
                <Head title={`Join ${booking.subject?.name || 'Session'} - IqraQuest`} />
                <PreJoinScreen 
                    booking={booking}
                    isTeacher={isTeacher}
                    user={auth.user}
                    onJoin={handleJoin}
                />
            </>
        );
    }

    // Active session
    return (
        <div className="h-screen bg-gray-50 flex flex-col font-poppins overflow-hidden">
            <Head title={`${booking.subject?.name || 'Live Session'} - IqraQuest`} />
            
            <LiveKitRoom
                video={videoEnabled ? (selectedDevices.videoDeviceId ? { deviceId: selectedDevices.videoDeviceId } : true) : false}
                audio={audioEnabled ? (selectedDevices.audioDeviceId ? { deviceId: selectedDevices.audioDeviceId } : true) : false}
                token={token}
                serverUrl={liveKitUrl}
                connect={true}
                className="flex-1 flex flex-col overflow-hidden"
                onDisconnected={async () => {
                    // Record attendance leave
                    try {
                        await fetch(`/classroom/${booking.id}/attendance/leave`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                        });
                    } catch (err) {
                        console.error('Failed to record leave:', err);
                    }
                    router.visit(isTeacher ? '/teacher/dashboard' : '/dashboard');
                }}
                onMediaDeviceFailure={handleMediaDeviceFailure}
                onError={(err: any) => console.error("LiveKit Error:", err)}
            >
                {/* Error Toast */}
                {error && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white border border-destructive/20 shadow-lg px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-light-pink flex items-center justify-center flex-shrink-0">
                            <Icon icon="mdi:alert" className="w-4 h-4 text-destructive" />
                        </div>
                        <p className="text-body-s-medium text-foreground">{error}</p>
                        <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
                            <Icon icon="mdi:close" className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Header - Use system headers */}
                {isTeacher ? (
                    <TeacherHeader showMenuButton={false} />
                ) : (
                    <StudentHeader showMenuButton={false} />
                )}

                {/* Session Info Bar */}
                <SessionInfoBar booking={booking} isTeacher={isTeacher} />

                {/* Main Content */}
                <RoomContentWrapper 
                    bookingId={booking.id}
                    isTeacher={isTeacher}
                    activePanel={activePanel}
                    togglePanel={togglePanel}
                    materials={materials}
                    onMaterialsChange={setMaterials}
                    userId={auth.user.id}
                    userName={auth.user.name}
                />

                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}

// Wrapper component that uses the projection hook (must be inside LiveKitRoom)
function RoomContentWrapper({ 
    bookingId,
    isTeacher,
    activePanel,
    togglePanel,
    materials,
    onMaterialsChange,
    userId,
    userName
}: { 
    bookingId: number;
    isTeacher: boolean;
    activePanel: 'none' | 'materials' | 'chat' | 'present' | 'poll' | 'quran';
    togglePanel: (panel: 'materials' | 'chat' | 'present' | 'poll' | 'quran') => void;
    materials: Material[];
    onMaterialsChange: (materials: Material[]) => void;
    userId: number;
    userName: string;
}) {
    const { 
        projection, 
        updateProjection, 
        whiteboard, 
        updateWhiteboard,
        updateScroll,
        scrollSyncEnabled,
        toggleScrollSync
    } = useProjectionSync(isTeacher);

    const {
        isHandRaised,
        raisedHands,
        toggleHand,
        lowerHand
    } = useRaiseHand(isTeacher, String(userId), userName);

    // Poll notification hook
    const { 
        notification: pollNotification, 
        dismissNotification: dismissPollNotification,
        shouldOpenPanel: shouldOpenPollPanel,
        clearShouldOpenPanel
    } = usePollNotification(bookingId, isTeacher);

    // Auto-open poll panel when student receives a new poll
    useEffect(() => {
        if (shouldOpenPollPanel && !isTeacher) {
            togglePanel('poll');
            clearShouldOpenPanel();
        }
    }, [shouldOpenPollPanel, isTeacher, togglePanel, clearShouldOpenPanel]);

    return (
        <RoomContent
            bookingId={bookingId}
            isTeacher={isTeacher}
            activePanel={activePanel}
            togglePanel={togglePanel}
            materials={materials}
            onMaterialsChange={onMaterialsChange}
            projection={projection}
            onProjectionChange={updateProjection}
            whiteboard={whiteboard}
            onWhiteboardChange={updateWhiteboard}
            onScrollChange={updateScroll}
            scrollSyncEnabled={scrollSyncEnabled}
            onScrollSyncToggle={toggleScrollSync}
            isHandRaised={isHandRaised}
            raisedHands={raisedHands}
            onToggleHand={toggleHand}
            onLowerHand={lowerHand}
            pollNotification={pollNotification}
            onDismissPollNotification={dismissPollNotification}
        />
    );
}

function RoomContent({ 
    bookingId,
    isTeacher,
    activePanel,
    togglePanel,
    materials,
    onMaterialsChange,
    projection,
    onProjectionChange,
    whiteboard,
    onWhiteboardChange,
    onScrollChange,
    scrollSyncEnabled,
    onScrollSyncToggle,
    isHandRaised,
    raisedHands,
    onToggleHand,
    onLowerHand,
    pollNotification,
    onDismissPollNotification
}: { 
    bookingId: number;
    isTeacher: boolean;
    activePanel: 'none' | 'materials' | 'chat' | 'present' | 'poll' | 'quran';
    togglePanel: (panel: 'materials' | 'chat' | 'present' | 'poll' | 'quran') => void;
    materials: Material[];
    onMaterialsChange: (materials: Material[]) => void;
    projection: { isProjecting: boolean; material: Material | null; page: number; scrollPosition?: { x: number; y: number }; zoom?: number };
    onProjectionChange: (state: { isProjecting: boolean; material: Material | null; page: number }) => void;
    whiteboard: WhiteboardState;
    onWhiteboardChange: (state: WhiteboardState) => void;
    onScrollChange: (scroll: { x: number; y: number }, zoom?: number) => void;
    scrollSyncEnabled: boolean;
    onScrollSyncToggle: () => void;
    isHandRaised: boolean;
    raisedHands: RaisedHand[];
    onToggleHand: () => void;
    onLowerHand: (participantId: string) => void;
    pollNotification: { type: 'new_poll' | 'results_ready'; poll: any } | null;
    onDismissPollNotification: () => void;
}) {
    const connectionState = useConnectionState();
    const participants = useParticipants();
    
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );

    const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare && t.publication?.isSubscribed);
    const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);

    // Determine what to show in main stage
    const showDocumentPresentation = projection.isProjecting && projection.material;
    const showScreenShare = screenShareTrack && !showDocumentPresentation;

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Poll Notification Overlay (for students) */}
            {pollNotification && !isTeacher && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 animate-fade-in">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                pollNotification.type === 'new_poll' ? "bg-orange/20" : "bg-primary/20"
                            )}>
                                <Icon 
                                    icon={pollNotification.type === 'new_poll' ? "mdi:poll" : "mdi:chart-bar"} 
                                    className={cn(
                                        "w-5 h-5",
                                        pollNotification.type === 'new_poll' ? "text-orange" : "text-primary"
                                    )} 
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-body-s-semibold text-foreground">
                                    {pollNotification.type === 'new_poll' ? 'New Poll!' : 'Results Ready!'}
                                </h3>
                                <p className="text-[10px] text-muted-foreground">
                                    {pollNotification.type === 'new_poll' 
                                        ? 'Your teacher started a poll' 
                                        : 'Poll results are now available'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                            <p className="text-body-xs-semibold text-foreground line-clamp-2">{pollNotification.poll.question}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {pollNotification.poll.type === 'quiz' ? '📝 Quiz' : '📊 Poll'} • {pollNotification.poll.options?.length || 0} options
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={onDismissPollNotification}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-foreground rounded-lg text-body-xs-semibold transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => {
                                    togglePanel('poll');
                                    onDismissPollNotification();
                                }}
                                className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-body-xs-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Icon icon="mdi:arrow-right" className="w-3.5 h-3.5" />
                                {pollNotification.type === 'new_poll' ? 'Answer' : 'View'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Raised Hand Notification (for teachers) - positioned to avoid side panel */}
            {isTeacher && raisedHands.length > 0 && activePanel === 'none' && (
                <div className="fixed top-20 right-4 z-40 animate-slide-in-right">
                    <div className="bg-white rounded-xl shadow-lg border border-orange/20 p-2.5 max-w-[200px]">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-orange/20 flex items-center justify-center flex-shrink-0">
                                <Icon icon="mdi:hand-back-left" className="w-4 h-4 text-orange animate-bounce" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-body-xs-semibold text-foreground truncate">
                                    {raisedHands.length} hand{raisedHands.length > 1 ? 's' : ''} raised
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {raisedHands[0]?.participantName}{raisedHands.length > 1 ? ` +${raisedHands.length - 1}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Video Area */}
            <div className="flex-1 flex flex-col p-[clamp(0.5rem,1.5vw,1rem)] gap-[clamp(0.5rem,1vw,0.75rem)]">
                {/* Video Stage */}
                <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {showDocumentPresentation ? (
                        <DocumentPresentationView
                            projection={projection}
                            isTeacher={isTeacher}
                            onStop={() => onProjectionChange({ isProjecting: false, material: null, page: 1 })}
                            onPageChange={(page) => onProjectionChange({ ...projection, page })}
                            whiteboard={whiteboard}
                            onWhiteboardChange={onWhiteboardChange}
                            onScrollChange={onScrollChange}
                            scrollSyncEnabled={scrollSyncEnabled}
                            onScrollSyncToggle={onScrollSyncToggle}
                        />
                    ) : showScreenShare ? (
                        <ScreenShareView trackRef={screenShareTrack} />
                    ) : (
                        <MainVideoGrid tracks={cameraTracks} />
                    )}

                    {/* Connection Status Overlay */}
                    {connectionState !== 'connected' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="text-center">
                                <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-body-s-medium text-foreground capitalize">{connectionState}...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Thumbnail Strip (when presenting or screen sharing) */}
                {(showDocumentPresentation || showScreenShare) && cameraTracks.length > 0 && (
                    <div className="h-[clamp(5rem,10vw,6.5rem)] flex gap-[clamp(0.375rem,0.75vw,0.5rem)] overflow-x-auto">
                        {cameraTracks.map((track) => (
                            <ParticipantTile
                                key={track.publication?.trackSid || `${track.participant.identity}-${track.source}`}
                                trackRef={track}
                                className="w-[clamp(6rem,12vw,9rem)] h-full flex-shrink-0"
                                compact
                            />
                        ))}
                    </div>
                )}

                {/* Control Bar */}
                <ControlBar 
                    isTeacher={isTeacher}
                    activePanel={activePanel}
                    onToggleMaterials={() => togglePanel('materials')}
                    onToggleChat={() => togglePanel('chat')}
                    onTogglePresent={() => togglePanel('present')}
                    onTogglePoll={() => togglePanel('poll')}
                    onToggleQuran={() => togglePanel('quran')}
                    onToggleWhiteboard={() => {
                        // Toggle blank whiteboard directly
                        if (projection.isProjecting && projection.material?.id === -1) {
                            // Stop whiteboard
                            onProjectionChange({ isProjecting: false, material: null, page: 1 });
                        } else {
                            // Start blank whiteboard
                            onProjectionChange({ 
                                isProjecting: true, 
                                material: { id: -1, name: 'Blank Whiteboard', type: 'document', url: '' }, 
                                page: 1 
                            });
                        }
                    }}
                    materialsCount={materials.length}
                    participantsCount={participants.length}
                    isPresenting={projection.isProjecting}
                    isWhiteboardActive={projection.isProjecting && projection.material?.id === -1}
                    isHandRaised={isHandRaised}
                    onToggleHand={onToggleHand}
                    raisedHands={raisedHands}
                    onLowerHand={onLowerHand}
                />
            </div>

            {/* Side Panel */}
            {activePanel !== 'none' && (
                <div className="w-[clamp(16rem,22vw,20rem)] min-w-[14rem] border-l border-gray-100 bg-white flex flex-col animate-slide-in-right overflow-hidden">
                    {activePanel === 'materials' && (
                        <MaterialsPanel 
                            bookingId={bookingId}
                            materials={materials}
                            isTeacher={isTeacher}
                            onClose={() => togglePanel('materials')}
                            onMaterialsChange={onMaterialsChange}
                        />
                    )}
                    {activePanel === 'chat' && (
                        <ChatPanel onClose={() => togglePanel('chat')} />
                    )}
                    {activePanel === 'present' && (
                        <DocumentViewer
                            isTeacher={isTeacher}
                            materials={materials}
                            projection={projection}
                            onProjectionChange={onProjectionChange}
                        />
                    )}
                    {activePanel === 'poll' && (
                        <PollPanel
                            bookingId={bookingId}
                            isTeacher={isTeacher}
                            onClose={() => togglePanel('poll')}
                        />
                    )}
                    {activePanel === 'quran' && (
                        <QuranPlayer
                            isTeacher={isTeacher}
                            onClose={() => togglePanel('quran')}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function ScreenShareView({ trackRef }: { trackRef: any }) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-primary rounded-xl shadow-lg">
                <Icon icon="mdi:monitor-share" className="w-4 h-4 text-white" />
                <span className="text-body-xs-semibold text-white">
                    {trackRef.participant.name || trackRef.participant.identity} is presenting
                </span>
            </div>
            <ParticipantTile trackRef={trackRef} className="w-full h-full" isScreenShare />
        </div>
    );
}

function MainVideoGrid({ tracks }: { tracks: any[] }) {
    const getGridClass = () => {
        if (tracks.length === 1) return 'grid-cols-1';
        if (tracks.length === 2) return 'grid-cols-1 md:grid-cols-2';
        if (tracks.length <= 4) return 'grid-cols-2';
        return 'grid-cols-2 lg:grid-cols-3';
    };

    if (tracks.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-pale-green flex items-center justify-center mx-auto mb-4">
                        <Icon icon="mdi:account-clock" className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-body-lg text-foreground mb-1">Waiting for participants</h3>
                    <p className="text-body-s-regular text-muted-foreground">The session will begin shortly</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full h-full grid gap-[clamp(0.5rem,1vw,0.75rem)] p-[clamp(0.5rem,1vw,0.75rem)]",
            getGridClass()
        )}>
            {tracks.map((track) => (
                <ParticipantTile
                    key={track.publication?.trackSid || `${track.participant.identity}-${track.source}`}
                    trackRef={track}
                    className="w-full h-full min-h-[clamp(10rem,22vw,14rem)]"
                />
            ))}
        </div>
    );
}
