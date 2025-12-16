import React, { useState, useEffect, useCallback } from 'react';
import { useDataChannel } from '@livekit/components-react';

interface QuranCanvasProps {
    isTeacher: boolean;
}

interface SyncMessage {
    type: 'PAGE_CHANGE';
    page: number;
}

export default function QuranCanvas({ isTeacher }: QuranCanvasProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [imgError, setImgError] = useState(false);

    // Topic for Quran synchronization
    const { send, message } = useDataChannel('quran_sync');

    // Handle incoming messages
    useEffect(() => {
        if (message) {
            try {
                const decoder = new TextDecoder();
                const text = decoder.decode(message.payload);
                const data = JSON.parse(text) as SyncMessage;

                if (data.type === 'PAGE_CHANGE') {
                    console.log("Received Page Sync:", data.page);
                    setCurrentPage(data.page);
                }
            } catch (error) {
                console.error("Failed to parse sync message:", error);
            }
        }
    }, [message]);

    // Send page update (Teacher only, or both if allowed)
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 1) return;

        // Optimistic update
        setCurrentPage(newPage);

        // Broadcast to others
        const payload: SyncMessage = { type: 'PAGE_CHANGE', page: newPage };
        const encoder = new TextEncoder();
        send(encoder.encode(JSON.stringify(payload)), { reliable: true });
    }, [send]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#fdf6e3] relative group">

            {/* CANVAS / PAGE DISPLAY */}
            <div className="relative w-full h-full max-w-3xl flex items-center justify-center p-4">
                <div className="relative w-full h-full shadow-2xl border-4 border-[#d4b483] rounded-lg overflow-hidden bg-white">
                    {/* Placeholder for actual Quran Page API/Image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        {imgError ? (
                            <div className="text-center">
                                <h3 className="text-4xl font-serif text-[#8c7851] mb-2">Page {currentPage}</h3>
                                <p className="text-sm">Mushaf Medina</p>
                            </div>
                        ) : (
                            // Using a placeholder service or local asset logic here
                            <img
                                src={`https://quran-images-api.herokuapp.com/show/page/${currentPage}.jpg`} // Example/Placeholder
                                alt={`Page ${currentPage}`}
                                className="w-full h-full object-contain"
                                onError={() => setImgError(true)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* CONTROLS (Floating) */}
            <div className="absolute bottom-8 flex items-center gap-6 bg-gray-900/80 backdrop-blur text-white px-6 py-3 rounded-full shadow-xl transition-opacity opacity-0 group-hover:opacity-100">
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!isTeacher} // Optional: Restrict to teacher?
                    className="p-2 hover:bg-white/20 rounded-full disabled:opacity-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>

                <div className="font-mono text-lg font-bold min-w-[3ch] text-center">
                    {currentPage}
                </div>

                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!isTeacher}
                    className="p-2 hover:bg-white/20 rounded-full disabled:opacity-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            {/* SYNC INDICATOR */}
            <div className="absolute top-4 right-4 bg-green-500/20 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                SYNC ACTIVE
            </div>
        </div>
    );
}
