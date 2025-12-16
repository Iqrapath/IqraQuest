import { useState, useEffect, useRef, useCallback } from 'react';
import { useDataChannel, useRoomContext } from '@livekit/components-react';
import { DataPacket_Kind } from 'livekit-client';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Material {
    id: number;
    name: string;
    type: 'pdf' | 'image' | 'document' | 'video';
    url: string;
    size?: string;
}

export interface ProjectionState {
    isProjecting: boolean;
    material: Material | null;
    page: number;
    scrollPosition?: { x: number; y: number };
    zoom?: number;
}

// Whiteboard types
interface Point {
    x: number;
    y: number;
}

interface DrawingPath {
    id: string;
    points: Point[];
    color: string;
    width: number;
    tool: 'pen' | 'highlighter' | 'eraser';
}

interface WhiteboardState {
    paths: DrawingPath[];
    currentPath: DrawingPath | null;
}

interface DocumentViewerProps {
    isTeacher: boolean;
    materials: Material[];
    projection: ProjectionState;
    onProjectionChange: (state: ProjectionState) => void;
}

// Whiteboard colors
const WHITEBOARD_COLORS = [
    { name: 'Black', value: '#1C2A3A' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Purple', value: '#7C3AED' },
];

// Whiteboard Canvas Component
function WhiteboardCanvas({
    isTeacher,
    paths,
    currentPath,
    onDraw,
    onDrawEnd,
    tool,
    color,
    brushSize,
}: {
    isTeacher: boolean;
    paths: DrawingPath[];
    currentPath: DrawingPath | null;
    onDraw: (point: Point) => void;
    onDrawEnd: () => void;
    tool: 'pen' | 'highlighter' | 'eraser';
    color: string;
    brushSize: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);

    // Resize canvas to match container
    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Draw all paths
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all completed paths
        const allPaths = currentPath ? [...paths, currentPath] : paths;
        allPaths.forEach(path => {
            if (path.points.length < 2) return;

            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (path.tool === 'highlighter') {
                ctx.globalAlpha = 0.3;
                ctx.strokeStyle = path.color;
                ctx.lineWidth = path.width * 3;
            } else if (path.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.lineWidth = path.width * 2;
            } else {
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = path.color;
                ctx.lineWidth = path.width;
            }

            ctx.moveTo(path.points[0].x * canvas.width, path.points[0].y * canvas.height);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x * canvas.width, path.points[i].y * canvas.height);
            }
            ctx.stroke();

            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        });
    }, [paths, currentPath]);

    const getRelativePoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) / rect.width,
            y: (clientY - rect.top) / rect.height,
        };
    }, []);

    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isTeacher) return;
        e.preventDefault();
        isDrawing.current = true;
        const point = getRelativePoint(e);
        onDraw(point);
    }, [isTeacher, getRelativePoint, onDraw]);

    const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isTeacher || !isDrawing.current) return;
        e.preventDefault();
        const point = getRelativePoint(e);
        onDraw(point);
    }, [isTeacher, getRelativePoint, onDraw]);

    const handleEnd = useCallback(() => {
        if (!isTeacher || !isDrawing.current) return;
        isDrawing.current = false;
        onDrawEnd();
    }, [isTeacher, onDrawEnd]);

    return (
        <div 
            ref={containerRef} 
            className={cn(
                "absolute inset-0 z-10",
                // Allow pointer events to pass through for students (so they can scroll)
                !isTeacher && "pointer-events-none"
            )}
        >
            <canvas
                ref={canvasRef}
                className={cn(
                    "w-full h-full",
                    isTeacher && tool === 'eraser' ? 'cursor-cell' : 
                    isTeacher ? 'cursor-crosshair' : 'cursor-default',
                    // Re-enable pointer events on canvas for teacher drawing
                    isTeacher && "pointer-events-auto"
                )}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            />
        </div>
    );
}

// Whiteboard Toolbar Component
function WhiteboardToolbar({
    tool,
    setTool,
    color,
    setColor,
    brushSize,
    setBrushSize,
    onClear,
    onUndo,
    canUndo,
}: {
    tool: 'pen' | 'highlighter' | 'eraser';
    setTool: (tool: 'pen' | 'highlighter' | 'eraser') => void;
    color: string;
    setColor: (color: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    onClear: () => void;
    onUndo: () => void;
    canUndo: boolean;
}) {
    const [showColors, setShowColors] = useState(false);

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                <button
                    onClick={() => setTool('pen')}
                    className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        tool === 'pen' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'
                    )}
                    title="Pen"
                >
                    <Icon icon="mdi:pencil" className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('highlighter')}
                    className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        tool === 'highlighter' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'
                    )}
                    title="Highlighter"
                >
                    <Icon icon="mdi:marker" className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setTool('eraser')}
                    className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        tool === 'eraser' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'
                    )}
                    title="Eraser"
                >
                    <Icon icon="mdi:eraser" className="w-5 h-5" />
                </button>
            </div>

            {/* Color Picker */}
            <div className="relative pr-2 border-r border-gray-200">
                <button
                    onClick={() => setShowColors(!showColors)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
                    title="Color"
                >
                    <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                    />
                </button>
                {showColors && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-lg border border-gray-200 flex gap-1">
                        {WHITEBOARD_COLORS.map(c => (
                            <button
                                key={c.value}
                                onClick={() => { setColor(c.value); setShowColors(false); }}
                                className={cn(
                                    "w-7 h-7 rounded-full transition-transform hover:scale-110",
                                    color === c.value && "ring-2 ring-offset-2 ring-primary"
                                )}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
                <Icon icon="mdi:circle-small" className="w-4 h-4 text-gray-400" />
                <input
                    type="range"
                    min="2"
                    max="12"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <Icon icon="mdi:circle" className="w-4 h-4 text-gray-400" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'
                    )}
                    title="Undo"
                >
                    <Icon icon="mdi:undo" className="w-5 h-5" />
                </button>
                <button
                    onClick={onClear}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-destructive transition-all"
                    title="Clear All"
                >
                    <Icon icon="mdi:delete-outline" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Main stage view when document is being presented (replaces video grid)
export function DocumentPresentationView({ 
    projection, 
    isTeacher,
    onStop,
    onPageChange,
    whiteboard,
    onWhiteboardChange,
    onScrollChange,
    scrollSyncEnabled,
    onScrollSyncToggle,
}: { 
    projection: ProjectionState;
    isTeacher: boolean;
    onStop: () => void;
    onPageChange: (page: number) => void;
    whiteboard: WhiteboardState;
    onWhiteboardChange: (state: WhiteboardState) => void;
    onScrollChange?: (scroll: { x: number; y: number }, zoom?: number) => void;
    scrollSyncEnabled?: boolean;
    onScrollSyncToggle?: () => void;
}) {
    const [zoom, setZoom] = useState(100);
    const isBlankWhiteboard = projection.material?.id === -1 || !projection.material?.url;
    const [whiteboardEnabled, setWhiteboardEnabled] = useState(isBlankWhiteboard);
    const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
    const [color, setColor] = useState('#1C2A3A');
    const [brushSize, setBrushSize] = useState(4);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-enable whiteboard for blank whiteboard mode
    useEffect(() => {
        if (isBlankWhiteboard && isTeacher) {
            setWhiteboardEnabled(true);
        }
    }, [isBlankWhiteboard, isTeacher]);

    // Sync zoom from teacher (for students with sync enabled)
    // Sync zoom and scroll position from teacher (for students with sync enabled)
    useEffect(() => {
        if (!isTeacher && scrollSyncEnabled) {
            // First update zoom
            if (projection.zoom !== undefined) {
                setZoom(projection.zoom);
            }
            
            // Then scroll after a brief delay to allow layout to update
            if (projection.scrollPosition && scrollContainerRef.current) {
                const timer = setTimeout(() => {
                    const container = scrollContainerRef.current;
                    if (!container) return;
                    
                    const maxScrollLeft = container.scrollWidth - container.clientWidth;
                    const maxScrollTop = container.scrollHeight - container.clientHeight;
                    
                    if (maxScrollLeft > 0 || maxScrollTop > 0) {
                        container.scrollTo({
                            left: projection.scrollPosition!.x * maxScrollLeft,
                            top: projection.scrollPosition!.y * maxScrollTop,
                            behavior: 'smooth'
                        });
                    }
                }, 100); // Small delay to let zoom update the layout
                
                return () => clearTimeout(timer);
            }
        }
    }, [isTeacher, scrollSyncEnabled, projection.zoom, projection.scrollPosition]);

    // Debounced scroll handler for teacher
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Handle scroll for teacher to broadcast
    const handleScroll = useCallback(() => {
        if (!isTeacher || !onScrollChange || !scrollContainerRef.current) return;
        
        // Debounce scroll updates
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
            const container = scrollContainerRef.current;
            if (!container) return;
            
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            const maxScrollTop = container.scrollHeight - container.clientHeight;
            
            const scrollX = maxScrollLeft > 0 ? container.scrollLeft / maxScrollLeft : 0;
            const scrollY = maxScrollTop > 0 ? container.scrollTop / maxScrollTop : 0;
            
            onScrollChange({ 
                x: Math.min(1, Math.max(0, scrollX)), 
                y: Math.min(1, Math.max(0, scrollY)) 
            }, zoom);
        }, 50); // 50ms debounce
    }, [isTeacher, onScrollChange, zoom]);

    // Broadcast zoom changes for teacher
    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
        if (isTeacher && onScrollChange && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            const maxScrollTop = container.scrollHeight - container.clientHeight;
            
            const scrollX = maxScrollLeft > 0 ? container.scrollLeft / maxScrollLeft : 0;
            const scrollY = maxScrollTop > 0 ? container.scrollTop / maxScrollTop : 0;
            
            // Send zoom update with current scroll position
            onScrollChange({ 
                x: Math.min(1, Math.max(0, scrollX)), 
                y: Math.min(1, Math.max(0, scrollY)) 
            }, newZoom);
        }
    }, [isTeacher, onScrollChange]);

    if (!projection.material) return null;

    const handleDraw = (point: Point) => {
        if (!isTeacher) return;

        if (whiteboard.currentPath) {
            // Add point to current path
            const updatedPath = {
                ...whiteboard.currentPath,
                points: [...whiteboard.currentPath.points, point],
            };
            onWhiteboardChange({ ...whiteboard, currentPath: updatedPath });
        } else {
            // Start new path
            const newPath: DrawingPath = {
                id: `path-${Date.now()}`,
                points: [point],
                color,
                width: brushSize,
                tool,
            };
            onWhiteboardChange({ ...whiteboard, currentPath: newPath });
        }
    };

    const handleDrawEnd = () => {
        if (!isTeacher || !whiteboard.currentPath) return;

        // Move current path to completed paths
        onWhiteboardChange({
            paths: [...whiteboard.paths, whiteboard.currentPath],
            currentPath: null,
        });
    };

    const handleClear = () => {
        onWhiteboardChange({ paths: [], currentPath: null });
    };

    const handleUndo = () => {
        if (whiteboard.paths.length === 0) return;
        onWhiteboardChange({
            paths: whiteboard.paths.slice(0, -1),
            currentPath: null,
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                        isBlankWhiteboard ? "bg-primary/20" : "bg-purple/20"
                    )}>
                        <Icon 
                            icon={isBlankWhiteboard ? "mdi:draw" : "mdi:presentation"} 
                            className={cn("w-4 h-4", isBlankWhiteboard ? "text-primary" : "text-purple")} 
                        />
                        <span className={cn(
                            "text-body-xs-semibold",
                            isBlankWhiteboard ? "text-primary" : "text-purple"
                        )}>
                            {isBlankWhiteboard ? 'WHITEBOARD' : 'PRESENTING'}
                        </span>
                    </div>
                    <span className="text-body-s-medium text-white truncate max-w-[300px]">
                        {isBlankWhiteboard ? 'Blank Canvas' : projection.material.name}
                    </span>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Whiteboard Toggle (teacher only) */}
                    {isTeacher && (
                        <button
                            onClick={() => setWhiteboardEnabled(!whiteboardEnabled)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-xs-semibold transition-colors",
                                whiteboardEnabled 
                                    ? "bg-primary text-white" 
                                    : "bg-gray-700 hover:bg-gray-600 text-white"
                            )}
                        >
                            <Icon icon="mdi:draw" className="w-4 h-4" />
                            {whiteboardEnabled ? 'Drawing On' : 'Draw'}
                        </button>
                    )}

                    {/* Scroll Sync Toggle (student only) */}
                    {!isTeacher && onScrollSyncToggle && (
                        <button
                            onClick={onScrollSyncToggle}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-xs-semibold transition-colors",
                                scrollSyncEnabled 
                                    ? "bg-teal text-white" 
                                    : "bg-gray-700 hover:bg-gray-600 text-white"
                            )}
                        >
                            <Icon icon={scrollSyncEnabled ? "mdi:link" : "mdi:link-off"} className="w-4 h-4" />
                            {scrollSyncEnabled ? 'Synced' : 'Sync View'}
                        </button>
                    )}

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
                        <button
                            onClick={() => handleZoomChange(Math.max(50, zoom - 25))}
                            className={cn(
                                "w-7 h-7 rounded hover:bg-gray-600 flex items-center justify-center transition-colors",
                                !isTeacher && scrollSyncEnabled && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!isTeacher && scrollSyncEnabled}
                        >
                            <Icon icon="mdi:minus" className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-body-xs-medium text-white w-12 text-center">{zoom}%</span>
                        <button
                            onClick={() => handleZoomChange(Math.min(200, zoom + 25))}
                            className={cn(
                                "w-7 h-7 rounded hover:bg-gray-600 flex items-center justify-center transition-colors",
                                !isTeacher && scrollSyncEnabled && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!isTeacher && scrollSyncEnabled}
                        >
                            <Icon icon="mdi:plus" className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Page Controls (for PDFs - teacher only) */}
                    {projection.material.type === 'pdf' && isTeacher && (
                        <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
                            <button
                                onClick={() => onPageChange(Math.max(1, projection.page - 1))}
                                className="w-7 h-7 rounded hover:bg-gray-600 flex items-center justify-center transition-colors"
                            >
                                <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-body-xs-medium text-white px-2">Page {projection.page}</span>
                            <button
                                onClick={() => onPageChange(projection.page + 1)}
                                className="w-7 h-7 rounded hover:bg-gray-600 flex items-center justify-center transition-colors"
                            >
                                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    )}

                    {/* Page indicator for students */}
                    {projection.material.type === 'pdf' && !isTeacher && (
                        <div className="px-3 py-1.5 bg-gray-700 rounded-lg">
                            <span className="text-body-xs-medium text-white">Page {projection.page}</span>
                        </div>
                    )}

                    {/* Fullscreen */}
                    <button
                        onClick={() => document.documentElement.requestFullscreen?.()}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                    >
                        <Icon icon="mdi:fullscreen" className="w-5 h-5 text-white" />
                    </button>

                    {/* Stop Button (teacher only) */}
                    {isTeacher && (
                        <button
                            onClick={onStop}
                            className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-body-xs-semibold flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:stop" className="w-4 h-4" />
                            Stop
                        </button>
                    )}
                </div>
            </div>

            {/* Document Display with Whiteboard Overlay */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={cn(
                    "flex-1 relative",
                    // Students can scroll when sync is disabled, or always for teacher
                    isTeacher || !scrollSyncEnabled ? "overflow-auto" : "overflow-hidden"
                )}
            >
                {/* Scrollable content wrapper - size increases with zoom */}
                <div 
                    className="relative flex items-center justify-center"
                    style={{ 
                        width: `${Math.max(100, zoom)}%`,
                        height: `${Math.max(100, zoom)}%`,
                        minWidth: '100%',
                        minHeight: '100%',
                        padding: '1rem',
                        // For zoom < 100%, use transform to scale down
                        transform: zoom < 100 ? `scale(${zoom / 100})` : undefined,
                        transformOrigin: 'center center'
                    }}
                >
                    {/* Document Content or Blank Whiteboard */}
                    {projection.material.id === -1 || !projection.material.url ? (
                        // Blank whiteboard - white background
                        <div className="w-full h-full bg-white rounded-lg shadow-2xl" />
                    ) : projection.material.type === 'image' ? (
                        <img
                            src={projection.material.url}
                            alt={projection.material.name}
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                    ) : projection.material.type === 'pdf' ? (
                        <embed
                            src={`${projection.material.url}#page=${projection.page}&view=FitH&toolbar=0&navpanes=0`}
                            type="application/pdf"
                            className="w-full h-full rounded-lg bg-white"
                        />
                    ) : projection.material.type === 'video' ? (
                        <video
                            src={projection.material.url}
                            controls
                            autoPlay={isTeacher}
                            className="w-full h-full rounded-lg shadow-2xl object-contain"
                        />
                    ) : (
                        <div className="text-center text-white">
                            <Icon icon="mdi:file-document" className="w-24 h-24 mx-auto mb-4 text-gray-500" />
                            <p className="text-body-lg mb-2">{projection.material.name}</p>
                            <a
                                href={projection.material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-body-s-medium transition-colors"
                            >
                                <Icon icon="mdi:open-in-new" className="w-4 h-4" />
                                Open Document
                            </a>
                        </div>
                    )}

                    {/* Whiteboard Canvas Overlay */}
                    {(isBlankWhiteboard || whiteboardEnabled || whiteboard.paths.length > 0 || !isTeacher) && (
                        <WhiteboardCanvas
                            isTeacher={isTeacher && (whiteboardEnabled || isBlankWhiteboard)}
                            paths={whiteboard.paths}
                            currentPath={whiteboard.currentPath}
                            onDraw={handleDraw}
                            onDrawEnd={handleDrawEnd}
                            tool={tool}
                            color={color}
                            brushSize={brushSize}
                        />
                    )}
                </div>

                {/* Whiteboard Toolbar (teacher only, when enabled or blank whiteboard) */}
                {isTeacher && (whiteboardEnabled || isBlankWhiteboard) && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                        <WhiteboardToolbar
                            tool={tool}
                            setTool={setTool}
                            color={color}
                            setColor={setColor}
                            brushSize={brushSize}
                            setBrushSize={setBrushSize}
                            onClear={handleClear}
                            onUndo={handleUndo}
                            canUndo={whiteboard.paths.length > 0}
                        />
                    </div>
                )}

                {/* Drawing indicator for students */}
                {!isTeacher && whiteboard.paths.length > 0 && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-primary/90 text-white rounded-lg">
                        <Icon icon="mdi:draw" className="w-4 h-4" />
                        <span className="text-body-xs-semibold">Teacher is annotating</span>
                    </div>
                )}

                {/* Sync indicator for students */}
                {!isTeacher && scrollSyncEnabled && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-teal/90 text-white rounded-lg">
                        <Icon icon="mdi:link" className="w-4 h-4" />
                        <span className="text-body-xs-semibold">View synced with teacher</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Side panel for selecting documents to present (teacher only)
export default function DocumentViewer({ 
    isTeacher, 
    materials, 
    projection,
    onProjectionChange 
}: DocumentViewerProps) {

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return 'mdi:file-pdf-box';
            case 'image': return 'mdi:file-image';
            case 'video': return 'mdi:file-video';
            default: return 'mdi:file-document';
        }
    };

    const startProjection = (material: Material) => {
        onProjectionChange({ isProjecting: true, material, page: 1 });
    };

    // Teacher view - select document to present
    if (isTeacher) {
        return (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-light-purple/30 flex items-center justify-center">
                            <Icon icon="mdi:presentation" className="w-5 h-5 text-purple" />
                        </div>
                        <div>
                            <h3 className="text-body-s-semibold text-foreground">Present Document</h3>
                            <p className="text-body-xs-regular text-muted-foreground">
                                {projection.isProjecting ? 'Currently presenting' : 'Select a file'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Currently Presenting */}
                {projection.isProjecting && projection.material && (
                    <div className="p-4 border-b border-gray-100 bg-purple/5">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple/20">
                            <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center">
                                <Icon icon="mdi:presentation-play" className="w-5 h-5 text-purple" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body-s-medium text-foreground truncate">{projection.material.name}</p>
                                <p className="text-body-xs-regular text-purple">Now presenting</p>
                            </div>
                            <button
                                onClick={() => onProjectionChange({ isProjecting: false, material: null, page: 1 })}
                                className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-body-xs-semibold transition-colors"
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                )}

                {/* Blank Whiteboard Option */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => startProjection({ 
                            id: -1, 
                            name: 'Blank Whiteboard', 
                            type: 'document', 
                            url: '' 
                        })}
                        disabled={projection.material?.id === -1}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                            projection.material?.id === -1
                                ? "bg-primary/10 border border-primary/20 cursor-default"
                                : "bg-gradient-to-r from-primary/5 to-teal/5 hover:from-primary/10 hover:to-teal/10 border border-primary/10 group"
                        )}
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Icon icon="mdi:draw" className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-body-s-semibold text-foreground">Blank Whiteboard</p>
                            <p className="text-body-xs-regular text-muted-foreground">Draw and explain freely</p>
                        </div>
                        {projection.material?.id === -1 ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/20 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-body-xs-semibold text-primary">Live</span>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <Icon icon="mdi:play" className="w-4 h-4 text-primary" />
                            </div>
                        )}
                    </button>
                </div>

                {/* Materials List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {materials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Icon icon="mdi:folder-open-outline" className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-body-s-medium text-foreground">No materials uploaded</p>
                            <p className="text-body-xs-regular text-muted-foreground mt-1 max-w-[200px]">
                                Upload files in the Materials panel to present them
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {materials.map((material) => {
                                const isCurrentlyPresenting = projection.material?.id === material.id;
                                return (
                                    <button
                                        key={material.id}
                                        onClick={() => !isCurrentlyPresenting && startProjection(material)}
                                        disabled={isCurrentlyPresenting}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                            isCurrentlyPresenting 
                                                ? "bg-purple/10 border border-purple/20 cursor-default"
                                                : "bg-gray-50 hover:bg-pale-green/50 group"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                            material.type === 'pdf' ? 'bg-light-pink' :
                                            material.type === 'image' ? 'bg-pale-blue/30' :
                                            material.type === 'video' ? 'bg-light-purple/30' : 'bg-pale-green'
                                        )}>
                                            <Icon
                                                icon={getFileIcon(material.type)}
                                                className={cn(
                                                    "w-5 h-5",
                                                    material.type === 'pdf' ? 'text-destructive' :
                                                    material.type === 'image' ? 'text-blue' :
                                                    material.type === 'video' ? 'text-purple' : 'text-primary'
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-body-s-medium text-foreground truncate">{material.name}</p>
                                            <p className="text-body-xs-regular text-muted-foreground uppercase">{material.type}</p>
                                        </div>
                                        {isCurrentlyPresenting ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple/20 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-purple animate-pulse" />
                                                <span className="text-body-xs-semibold text-purple">Live</span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <Icon icon="mdi:play" className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 text-body-xs-regular text-muted-foreground">
                        <Icon icon="mdi:information-outline" className="w-4 h-4" />
                        <span>Documents are shown to your student in real-time</span>
                    </div>
                </div>
            </div>
        );
    }

    // Student view - just info
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-light-purple/30 flex items-center justify-center">
                        <Icon icon="mdi:presentation" className="w-5 h-5 text-purple" />
                    </div>
                    <div>
                        <h3 className="text-body-s-semibold text-foreground">Presentation</h3>
                        <p className="text-body-xs-regular text-muted-foreground">
                            {projection.isProjecting ? 'Teacher is presenting' : 'No active presentation'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                {projection.isProjecting ? (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-purple/10 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:presentation-play" className="w-8 h-8 text-purple animate-pulse" />
                        </div>
                        <p className="text-body-s-medium text-foreground">Presentation is active</p>
                        <p className="text-body-xs-regular text-muted-foreground mt-1">
                            View it in the main screen
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:presentation" className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-body-s-medium text-foreground">No presentation</p>
                        <p className="text-body-xs-regular text-muted-foreground mt-1">
                            Your teacher will start presenting soon
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Hook to sync projection state via LiveKit data channel
export function useProjectionSync(isTeacher: boolean) {
    const [projection, setProjection] = useState<ProjectionState>({
        isProjecting: false,
        material: null,
        page: 1,
        scrollPosition: { x: 0, y: 0 },
        zoom: 100
    });
    const [whiteboard, setWhiteboard] = useState<WhiteboardState>({
        paths: [],
        currentPath: null
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true); // Students sync by default

    const room = useRoomContext();
    const { message } = useDataChannel('projection');

    // Store current state in refs for heartbeat access
    const projectionRef = useRef(projection);
    const whiteboardRef = useRef(whiteboard);
    projectionRef.current = projection;
    whiteboardRef.current = whiteboard;

    // Handle incoming projection messages
    useEffect(() => {
        if (message) {
            try {
                const decoder = new TextDecoder();
                const text = decoder.decode(message.payload);
                const data = JSON.parse(text);

                if (data.type === 'PROJECTION_UPDATE' || data.type === 'PROJECTION_STATE') {
                    // Update state from teacher
                    setProjection(data.state);
                    if (data.whiteboard) {
                        setWhiteboard(data.whiteboard);
                    }
                    setIsInitialized(true);
                } else if (data.type === 'WHITEBOARD_UPDATE') {
                    // Update whiteboard from teacher
                    setWhiteboard(data.whiteboard);
                } else if (data.type === 'SCROLL_UPDATE') {
                    // Update scroll/zoom from teacher
                    setProjection(prev => ({
                        ...prev,
                        scrollPosition: data.scrollPosition,
                        zoom: data.zoom !== undefined ? data.zoom : prev.zoom
                    }));
                } else if (data.type === 'PROJECTION_REQUEST' && isTeacher) {
                    // Teacher responds to state request from late joiner
                    if (room.state !== 'connected') return;
                    const encoder = new TextEncoder();
                    room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                        type: 'PROJECTION_STATE', 
                        topic: 'projection',
                        state: projectionRef.current,
                        whiteboard: whiteboardRef.current
                    })), { reliable: true, topic: 'projection' });
                }
            } catch (error) {
                console.error("Failed to parse projection message:", error);
            }
        }
    }, [message, isTeacher, room]);

    // Student: Request current state on mount (for late joiners)
    useEffect(() => {
        if (!isTeacher && !isInitialized) {
            // Small delay to ensure connection is established
            const timer = setTimeout(() => {
                if (room.state !== 'connected') return;
                const encoder = new TextEncoder();
                room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                    type: 'PROJECTION_REQUEST',
                    topic: 'projection'
                })), { reliable: true, topic: 'projection' });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isTeacher, isInitialized, room]);

    // Teacher: Periodic heartbeat to sync late joiners (every 5 seconds when presenting)
    useEffect(() => {
        if (isTeacher && projection.isProjecting) {
            const interval = setInterval(() => {
                if (room.state !== 'connected') return;
                const encoder = new TextEncoder();
                room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                    type: 'PROJECTION_STATE', 
                    topic: 'projection',
                    state: projectionRef.current,
                    whiteboard: whiteboardRef.current
                })), { reliable: true, topic: 'projection' });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isTeacher, projection.isProjecting, room]);

    // Broadcast projection changes (teacher only)
    const updateProjection = (newState: ProjectionState) => {
        setProjection(newState);
        // Clear whiteboard when stopping presentation
        if (!newState.isProjecting) {
            setWhiteboard({ paths: [], currentPath: null });
        }
        if (isTeacher && room.state === 'connected') {
            const encoder = new TextEncoder();
            room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                type: 'PROJECTION_UPDATE', 
                topic: 'projection',
                state: newState,
                whiteboard: newState.isProjecting ? whiteboardRef.current : { paths: [], currentPath: null }
            })), { reliable: true, topic: 'projection' });
        }
    };

    // Broadcast whiteboard changes (teacher only)
    const updateWhiteboard = (newState: WhiteboardState) => {
        setWhiteboard(newState);
        if (isTeacher && room.state === 'connected') {
            const encoder = new TextEncoder();
            room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                type: 'WHITEBOARD_UPDATE', 
                topic: 'projection',
                whiteboard: newState 
            })), { reliable: true, topic: 'projection' });
        }
    };

    // Broadcast scroll position changes (teacher only)
    const updateScroll = (scrollPosition: { x: number; y: number }, newZoom?: number) => {
        if (isTeacher) {
            const zoomValue = newZoom !== undefined ? newZoom : projectionRef.current.zoom;
            const newProjection = { 
                ...projectionRef.current, 
                scrollPosition,
                zoom: zoomValue
            };
            setProjection(newProjection);
            projectionRef.current = newProjection;
            
            if (room.state !== 'connected') return;
            
            const encoder = new TextEncoder();
            room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                type: 'SCROLL_UPDATE', 
                topic: 'projection',
                scrollPosition,
                zoom: zoomValue
            })), { reliable: true, topic: 'projection' });
        }
    };

    // Toggle scroll sync for students
    const toggleScrollSync = () => {
        setScrollSyncEnabled(prev => !prev);
    };

    return { 
        projection, 
        updateProjection, 
        whiteboard, 
        updateWhiteboard,
        updateScroll,
        scrollSyncEnabled,
        toggleScrollSync
    };
}

// Export whiteboard state type for use in Room.tsx
export type { WhiteboardState };

// Raise Hand types
export interface RaisedHand {
    participantId: string;
    participantName: string;
    timestamp: number;
}

// Hook to sync raise hand state via LiveKit data channel
export function useRaiseHand(isTeacher: boolean, participantId: string, participantName: string) {
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
    const raisedHandsRef = useRef<RaisedHand[]>([]);

    const room = useRoomContext();
    const { message } = useDataChannel('raisehand');

    // Keep ref in sync with state
    useEffect(() => {
        raisedHandsRef.current = raisedHands;
    }, [raisedHands]);

    // Handle incoming raise hand messages
    useEffect(() => {
        if (message) {
            try {
                const decoder = new TextDecoder();
                const text = decoder.decode(message.payload);
                const data = JSON.parse(text);
                console.log('[RaiseHand] Received:', data.type, data);

                if (data.type === 'HAND_RAISED') {
                    // Add to raised hands list (avoid duplicates)
                    setRaisedHands(prev => {
                        const exists = prev.some(h => h.participantId === data.participantId);
                        if (exists) return prev;
                        console.log('[RaiseHand] Adding hand:', data.participantName);
                        return [...prev, {
                            participantId: data.participantId,
                            participantName: data.participantName,
                            timestamp: data.timestamp
                        }];
                    });
                } else if (data.type === 'HAND_LOWERED') {
                    // Remove from raised hands list
                    setRaisedHands(prev => prev.filter(h => h.participantId !== data.participantId));
                    // If it's our hand being lowered by teacher
                    if (data.participantId === participantId) {
                        setIsHandRaised(false);
                    }
                } else if (data.type === 'HANDS_STATE_REQUEST' && isTeacher) {
                    // Teacher responds with current state for late joiners
                    if (room.state !== 'connected') return;
                    console.log('[RaiseHand] Teacher sending state:', raisedHandsRef.current);
                    const encoder = new TextEncoder();
                    room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                        type: 'HANDS_STATE', 
                        topic: 'raisehand',
                        hands: raisedHandsRef.current 
                    })), { reliable: true, topic: 'raisehand' });
                } else if (data.type === 'HANDS_STATE') {
                    // Student receives current state
                    setRaisedHands(data.hands || []);
                    // Check if our hand is in the list
                    const ourHand = (data.hands || []).find((h: RaisedHand) => h.participantId === participantId);
                    setIsHandRaised(!!ourHand);
                }
            } catch (error) {
                console.error("[RaiseHand] Failed to parse message:", error);
            }
        }
    }, [message, isTeacher, participantId, room]);

    // Request current state on mount (for late joiners)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (room.state !== 'connected') {
                console.log('[RaiseHand] Room not connected yet, skipping state request');
                return;
            }
            try {
                const encoder = new TextEncoder();
                room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                    type: 'HANDS_STATE_REQUEST',
                    topic: 'raisehand'
                })), { reliable: true, topic: 'raisehand' });
            } catch (err) {
                console.log('[RaiseHand] Connection not ready yet');
            }
        }, 1500); // Increased delay to allow connection to establish
        return () => clearTimeout(timer);
    }, [room]);

    // Toggle hand raise (student)
    const toggleHand = useCallback(() => {
        // Check if room is connected before publishing
        if (room.state !== 'connected') {
            console.log('[RaiseHand] Room not connected, skipping');
            return;
        }

        const newState = !isHandRaised;
        setIsHandRaised(newState);
        
        const timestamp = Date.now();
        const encoder = new TextEncoder();
        
        if (newState) {
            // Also add to local list (for teacher who is also the sender)
            setRaisedHands(prev => {
                const exists = prev.some(h => h.participantId === participantId);
                if (exists) return prev;
                return [...prev, { participantId, participantName, timestamp }];
            });
            
            console.log('[RaiseHand] Sending HAND_RAISED:', participantName);
            room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                type: 'HAND_RAISED',
                topic: 'raisehand',
                participantId,
                participantName,
                timestamp
            })), { reliable: true, topic: 'raisehand' });
        } else {
            // Remove from local list
            setRaisedHands(prev => prev.filter(h => h.participantId !== participantId));
            
            console.log('[RaiseHand] Sending HAND_LOWERED:', participantId);
            room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
                type: 'HAND_LOWERED',
                topic: 'raisehand',
                participantId
            })), { reliable: true, topic: 'raisehand' });
        }
    }, [isHandRaised, participantId, participantName, room]);

    // Lower someone's hand (teacher)
    const lowerHand = useCallback((targetParticipantId: string) => {
        setRaisedHands(prev => prev.filter(h => h.participantId !== targetParticipantId));
        
        if (room.state !== 'connected') return;
        
        const encoder = new TextEncoder();
        room.localParticipant.publishData(encoder.encode(JSON.stringify({ 
            type: 'HAND_LOWERED',
            topic: 'raisehand',
            participantId: targetParticipantId
        })), { reliable: true, topic: 'raisehand' });
    }, [room]);

    return {
        isHandRaised,
        raisedHands,
        toggleHand,
        lowerHand
    };
}
