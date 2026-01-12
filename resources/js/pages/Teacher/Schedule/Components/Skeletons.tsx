import React from 'react';

export function AvailabilityLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)] animate-pulse">
            <div className="h-4 w-64 bg-[#e5e7eb] rounded" />
            <div className="flex items-center gap-3">
                <div className="h-4 w-24 bg-[#e5e7eb] rounded" />
                <div className="h-6 w-11 bg-[#e5e7eb] rounded-full" />
            </div>
            <div className="flex flex-col gap-3">
                <div className="h-5 w-40 bg-[#e5e7eb] rounded" />
                <div className="h-4 w-56 bg-[#e5e7eb] rounded" />
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="h-12 bg-[#e5e7eb] rounded-lg" />
                ))}
            </div>
            <div className="h-11 w-32 bg-[#e5e7eb] rounded-[56px]" />
        </div>
    );
}

export function SessionsLoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="flex flex-col items-end min-w-[5rem] gap-1">
                        <div className="h-5 w-16 bg-[#e5e7eb] rounded" />
                        <div className="h-3 w-12 bg-[#e5e7eb] rounded" />
                    </div>
                    <div className="w-px h-12 bg-[#e5e7eb]" />
                    <div className="flex-1 bg-[#f3f4f6] rounded-xl px-4 py-3 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="h-4 w-20 bg-[#e5e7eb] rounded" />
                            <div className="h-5 w-32 bg-[#e5e7eb] rounded" />
                        </div>
                        <div className="h-9 w-24 bg-[#e5e7eb] rounded-[56px]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PastSessionsLoadingSkeleton() {
    return (
        <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-6 bg-[#e5e7eb] rounded" />
                        <div className="h-4 w-16 bg-[#e5e7eb] rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-16 bg-[#e5e7eb] rounded" />
                        <div className="h-3 w-12 bg-[#e5e7eb] rounded" />
                    </div>
                    <div className="h-4 w-24 bg-[#e5e7eb] rounded" />
                    <div className="h-4 w-20 bg-[#e5e7eb] rounded" />
                </div>
            ))}
        </div>
    );
}
