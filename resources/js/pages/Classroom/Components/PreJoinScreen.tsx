import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface MediaDevice {
    deviceId: string;
    label: string;
}

interface PreJoinScreenProps {
    booking: any;
    isTeacher: boolean;
    user: any;
    onJoin: (videoEnabled: boolean, audioEnabled: boolean, selectedDevices?: { videoDeviceId?: string; audioDeviceId?: string }) => void;
}

export default function PreJoinScreen({ booking, isTeacher, user, onJoin }: PreJoinScreenProps) {
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Device selection
    const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
    const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
    const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
    const [showDeviceSettings, setShowDeviceSettings] = useState(false);
    
    // Audio level meter
    const [audioLevel, setAudioLevel] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const dashboardUrl = isTeacher ? '/teacher/dashboard' : '/dashboard';

    // Get available devices
    const getDevices = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices
                .filter(d => d.kind === 'videoinput')
                .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}` }));
            const audioInputs = devices
                .filter(d => d.kind === 'audioinput')
                .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` }));
            
            setVideoDevices(videoInputs);
            setAudioDevices(audioInputs);
            
            // Set default selections if not already set
            if (!selectedVideoDevice && videoInputs.length > 0) {
                setSelectedVideoDevice(videoInputs[0].deviceId);
            }
            if (!selectedAudioDevice && audioInputs.length > 0) {
                setSelectedAudioDevice(audioInputs[0].deviceId);
            }
        } catch (err) {
            console.error('Failed to enumerate devices:', err);
        }
    }, [selectedVideoDevice, selectedAudioDevice]);

    // Setup audio level meter
    const setupAudioMeter = useCallback((mediaStream: MediaStream) => {
        try {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(mediaStream);
            
            analyser.fftSize = 256;
            source.connect(analyser);
            
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const updateLevel = () => {
                if (!analyserRef.current) return;
                
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(Math.min(100, average * 1.5));
                
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            
            updateLevel();
        } catch (err) {
            console.error('Failed to setup audio meter:', err);
        }
    }, []);

    // Get media stream
    const getMedia = useCallback(async (videoId?: string, audioId?: string) => {
        try {
            setIsLoading(true);
            
            // Stop existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            const constraints: MediaStreamConstraints = {
                video: videoId ? { deviceId: { exact: videoId } } : true,
                audio: audioId ? { deviceId: { exact: audioId } } : true,
            };
            
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setPermissionError(null);
            
            // Setup audio meter
            setupAudioMeter(mediaStream);
            
            // Get devices after permission granted
            await getDevices();
            
        } catch (err: any) {
            setPermissionError(
                err.name === 'NotAllowedError' 
                    ? 'Camera and microphone access was denied'
                    : 'Unable to access your camera or microphone'
            );
            setVideoEnabled(false);
        } finally {
            setIsLoading(false);
        }
    }, [stream, getDevices, setupAudioMeter]);

    useEffect(() => {
        getMedia();
        
        return () => {
            stream?.getTracks().forEach(track => track.stop());
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Handle device change
    const handleDeviceChange = async (type: 'video' | 'audio', deviceId: string) => {
        if (type === 'video') {
            setSelectedVideoDevice(deviceId);
            await getMedia(deviceId, selectedAudioDevice);
        } else {
            setSelectedAudioDevice(deviceId);
            await getMedia(selectedVideoDevice, deviceId);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !videoEnabled);
            setVideoEnabled(!videoEnabled);
        }
    };

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !audioEnabled);
            setAudioEnabled(!audioEnabled);
        }
    };

    const handleJoin = () => {
        stream?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        onJoin(videoEnabled, audioEnabled, {
            videoDeviceId: selectedVideoDevice,
            audioDeviceId: selectedAudioDevice,
        });
    };

    // Keyboard shortcuts hint
    const shortcuts = [
        { key: 'M', action: 'Toggle Mic' },
        { key: 'V', action: 'Toggle Video' },
        { key: 'C', action: 'Open Chat' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-poppins">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-[clamp(1rem,3vw,2rem)] py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pale-green flex items-center justify-center">
                            <Icon icon="mdi:book-education" className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-body-lg text-foreground">IqraQuest</h1>
                            <p className="text-body-xs-regular text-muted-foreground">Live Classroom</p>
                        </div>
                    </div>
                    <Link
                        href={dashboardUrl}
                        className="flex items-center gap-2 px-4 py-2 text-body-s-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-[clamp(1rem,3vw,2rem)] py-[clamp(1.5rem,4vw,3rem)]">
                <div className="grid lg:grid-cols-5 gap-[clamp(1.5rem,3vw,2.5rem)] items-start">
                    {/* Video Preview - Takes 3 columns */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Preview Header */}
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-body-s-semibold text-foreground">Camera Preview</h2>
                                <div className="flex items-center gap-2">
                                    {/* Device Settings Button */}
                                    <button
                                        onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-body-xs-medium transition-colors",
                                            showDeviceSettings 
                                                ? "bg-primary text-white" 
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        <Icon icon="mdi:cog" className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Devices</span>
                                    </button>
                                    {!audioEnabled && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-light-pink text-destructive rounded-full text-body-xs-medium">
                                            <Icon icon="mdi:microphone-off" className="w-3.5 h-3.5" />
                                            Muted
                                        </span>
                                    )}
                                    {!videoEnabled && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-body-xs-medium">
                                            <Icon icon="mdi:video-off" className="w-3.5 h-3.5" />
                                            Camera off
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Device Settings Panel */}
                            {showDeviceSettings && (
                                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 space-y-4">
                                    {/* Camera Selection */}
                                    <div>
                                        <label className="flex items-center gap-2 text-body-xs-semibold text-foreground mb-2">
                                            <Icon icon="mdi:video" className="w-4 h-4 text-primary" />
                                            Camera
                                        </label>
                                        <Select
                                            value={selectedVideoDevice}
                                            onValueChange={(value) => handleDeviceChange('video', value)}
                                            disabled={videoDevices.length === 0}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder={videoDevices.length === 0 ? "No cameras found" : "Select camera"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {videoDevices.map(device => (
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                        {device.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Microphone Selection */}
                                    <div>
                                        <label className="flex items-center gap-2 text-body-xs-semibold text-foreground mb-2">
                                            <Icon icon="mdi:microphone" className="w-4 h-4 text-primary" />
                                            Microphone
                                        </label>
                                        <Select
                                            value={selectedAudioDevice}
                                            onValueChange={(value) => handleDeviceChange('audio', value)}
                                            disabled={audioDevices.length === 0}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder={audioDevices.length === 0 ? "No microphones found" : "Select microphone"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {audioDevices.map(device => (
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                        {device.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {/* Audio Level Meter */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-body-xs-regular text-muted-foreground">Mic Level</span>
                                                <span className="text-body-xs-medium text-primary">
                                                    {audioEnabled ? (audioLevel > 10 ? 'Working' : 'Speak to test') : 'Muted'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-75",
                                                        audioLevel > 70 ? "bg-orange" : audioLevel > 30 ? "bg-primary" : "bg-teal"
                                                    )}
                                                    style={{ width: audioEnabled ? `${audioLevel}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Video Area */}
                            <div className="relative aspect-video bg-gray-900">
                                {isLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                    </div>
                                ) : videoEnabled && !permissionError ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                        <div className="text-center">
                                            <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-4xl font-semibold text-primary">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <p className="text-white/80 text-body-s-medium">{user?.name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Name Badge with Audio Indicator */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-xl">
                                    {audioEnabled && audioLevel > 10 && (
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3].map(i => (
                                                <div 
                                                    key={i}
                                                    className={cn(
                                                        "w-0.5 bg-primary rounded-full transition-all",
                                                        audioLevel > i * 25 ? "animate-pulse" : ""
                                                    )}
                                                    style={{ height: `${Math.min(12, 4 + (audioLevel / 100) * 8 * i)}px` }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-body-s-medium text-white">{user?.name || 'You'}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-center gap-4">
                                <button
                                    onClick={toggleAudio}
                                    disabled={!!permissionError}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all",
                                        audioEnabled 
                                            ? "bg-gray-100 hover:bg-gray-200 text-foreground" 
                                            : "bg-destructive text-white",
                                        permissionError && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Icon icon={audioEnabled ? "mdi:microphone" : "mdi:microphone-off"} className="w-5 h-5" />
                                    <span className="text-body-s-medium">{audioEnabled ? 'Mute' : 'Unmute'}</span>
                                </button>
                                <button
                                    onClick={toggleVideo}
                                    disabled={!!permissionError}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all",
                                        videoEnabled 
                                            ? "bg-gray-100 hover:bg-gray-200 text-foreground" 
                                            : "bg-destructive text-white",
                                        permissionError && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Icon icon={videoEnabled ? "mdi:video" : "mdi:video-off"} className="w-5 h-5" />
                                    <span className="text-body-s-medium">{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Permission Error */}
                        {permissionError && (
                            <div className="mt-4 p-4 bg-orange/10 border border-orange/20 rounded-xl flex items-start gap-3">
                                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-body-s-medium text-foreground">{permissionError}</p>
                                    <p className="text-body-xs-regular text-muted-foreground mt-1">
                                        You can still join the session. Check your browser settings to enable access.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Keyboard Shortcuts */}
                        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon icon="mdi:keyboard" className="w-4 h-4 text-muted-foreground" />
                                <span className="text-body-xs-semibold text-foreground">Keyboard Shortcuts</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {shortcuts.map(s => (
                                    <div key={s.key} className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-body-xs-semibold text-foreground font-mono">
                                            {s.key}
                                        </kbd>
                                        <span className="text-body-xs-regular text-muted-foreground">{s.action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Session Info - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Session Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                                    <Icon icon="mdi:book-education" className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-h5 text-foreground mb-1">Ready to join?</h2>
                                <p className="text-body-s-regular text-muted-foreground">
                                    {booking.subject?.name || 'Live Session'}
                                </p>
                            </div>

                            {/* Session Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-pale-green flex items-center justify-center flex-shrink-0">
                                        <Icon icon="mdi:account" className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-body-xs-regular text-muted-foreground">
                                            {isTeacher ? 'Student' : 'Teacher'}
                                        </p>
                                        <p className="text-body-s-medium text-foreground truncate">
                                            {isTeacher ? booking.student?.name : booking.teacher?.user?.name || 'Participant'}
                                        </p>
                                    </div>
                                </div>

                                {booking.scheduled_at && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-pale-blue/30 flex items-center justify-center flex-shrink-0">
                                            <Icon icon="mdi:clock-outline" className="w-5 h-5 text-blue" />
                                        </div>
                                        <div>
                                            <p className="text-body-xs-regular text-muted-foreground">Scheduled</p>
                                            <p className="text-body-s-medium text-foreground">
                                                {new Date(booking.scheduled_at).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-light-purple/30 flex items-center justify-center flex-shrink-0">
                                        <Icon icon={isTeacher ? "mdi:school" : "mdi:account-school"} className="w-5 h-5 text-purple" />
                                    </div>
                                    <div>
                                        <p className="text-body-xs-regular text-muted-foreground">Your Role</p>
                                        <p className="text-body-s-medium text-foreground">{isTeacher ? 'Teacher' : 'Student'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Device Status */}
                            <div className="flex items-center justify-center gap-6 py-3 px-4 bg-gray-50 rounded-xl mb-6">
                                <div className="flex items-center gap-2">
                                    <Icon 
                                        icon={audioEnabled ? "mdi:microphone" : "mdi:microphone-off"} 
                                        className={cn("w-5 h-5", audioEnabled ? "text-primary" : "text-destructive")} 
                                    />
                                    <span className="text-body-xs-medium text-muted-foreground">
                                        Mic {audioEnabled ? 'on' : 'off'}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-gray-200" />
                                <div className="flex items-center gap-2">
                                    <Icon 
                                        icon={videoEnabled ? "mdi:video" : "mdi:video-off"} 
                                        className={cn("w-5 h-5", videoEnabled ? "text-primary" : "text-destructive")} 
                                    />
                                    <span className="text-body-xs-medium text-muted-foreground">
                                        Camera {videoEnabled ? 'on' : 'off'}
                                    </span>
                                </div>
                            </div>

                            {/* Join Button */}
                            <button
                                onClick={handleJoin}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-button shadow-lg shadow-primary/20"
                            >
                                <span>Join Session</span>
                                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tips Card */}
                        <div className="bg-pale-green/50 rounded-2xl border border-light-teal p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon icon="mdi:lightbulb-outline" className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-body-s-semibold text-foreground mb-1">Quick Tips</h3>
                                    <ul className="text-body-xs-regular text-muted-foreground space-y-1">
                                        <li>• Use headphones for better audio quality</li>
                                        <li>• Find a quiet, well-lit space</li>
                                        <li>• Close other apps to improve performance</li>
                                        <li>• Test your mic before joining</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
