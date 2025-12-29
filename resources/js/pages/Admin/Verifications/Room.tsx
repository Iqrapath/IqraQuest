import { useState, useCallback } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useTracks,
    useConnectionState,
    useParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { Head, router, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import ParticipantTile from '@/pages/Classroom/Components/ParticipantTile';
import { Button } from '@/components/ui/button';

interface Props {
    teacher: any;
    token: string;
    roomName: string;
    isAdmin: boolean;
    liveKitUrl: string;
}

export default function VerificationRoom({
    teacher,
    token,
    isAdmin,
    liveKitUrl,
}: Props) {
    const [shouldConnect, setShouldConnect] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const handleJoin = () => {
        setShouldConnect(true);
    };

    if (!token) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
                <div className="text-center">
                    <Icon icon="uil:exclamation-triangle" className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Connection Error</h2>
                    <p className="text-gray-400 mb-6">Unable to retrieve verification room token.</p>
                    <Link href="/admin/verifications">
                        <Button variant="secondary">Back to Workspace</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!shouldConnect) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
                <Head title="Join Verification" />
                <div className="max-w-md w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-[#338078]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon="uil:video" className="text-[#338078] w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Ready to join?</h1>
                    <p className="text-gray-400 mb-8">Video verification for teacher <strong>{teacher.user.name}</strong></p>

                    <div className="flex flex-col gap-3">
                        <Button onClick={handleJoin} className="bg-[#338078] hover:bg-[#2a6a63] h-12 text-lg">
                            Join Now
                        </Button>
                        <Link href={isAdmin ? `/admin/verifications/${teacher.id}` : "/teacher/waiting-area"}>
                            <Button variant="ghost" className="text-gray-400">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black flex flex-col overflow-hidden">
            <Head title="Live Verification" />

            <LiveKitRoom
                video={videoEnabled}
                audio={audioEnabled}
                token={token}
                serverUrl={liveKitUrl}
                connect={true}
                className="flex-1 flex flex-col"
                onDisconnected={() => {
                    router.visit(isAdmin ? `/admin/verifications/${teacher.id}` : "/teacher/waiting-area");
                }}
            >
                <RoomContent isAdmin={isAdmin} teacher={teacher} />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}

function RoomContent({ isAdmin, teacher }: { isAdmin: boolean, teacher: any }) {
    const connectionState = useConnectionState();
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
    ]);

    return (
        <div className="flex-1 flex flex-col relative">
            {/* Main Stage */}
            <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 h-full">
                {tracks.map((track) => (
                    <ParticipantTile
                        key={track.publication?.trackSid || `${track.participant.identity}`}
                        trackRef={track}
                        className="w-full h-full min-h-[300px] border border-white/10"
                    />
                ))}
            </div>

            {/* Bottom Bar */}
            <div className="h-20 bg-black/80 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-white">
                        <p className="text-sm font-bold">{teacher.user.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Verification Session</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => router.visit(isAdmin ? `/admin/verifications/${teacher.id}` : "/teacher/waiting-area")}>
                        Leave Call
                    </Button>

                    {isAdmin && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                // Request completion note before finishing
                                const notes = window.prompt("Enter assessment notes:");
                                if (notes !== null) {
                                    router.post(`/admin/verifications/${teacher.id}/room/complete`, { notes });
                                }
                            }}
                        >
                            Mark as Completed
                        </Button>
                    )}
                </div>
            </div>

            {connectionState !== 'connected' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#338078]/30 border-t-[#338078] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white capitalize font-medium">{connectionState}...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
