import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function PageLoadingIndicator() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const startHandler = () => {
            setIsLoading(true);
            setProgress(0);

            // Simulate progress
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);
        };

        const finishHandler = () => {
            if (interval) clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 300);
        };

        // Listen to Inertia navigation events
        router.on('start', startHandler);
        router.on('finish', finishHandler);

        // Cleanup event listeners
        return () => {
            if (interval) clearInterval(interval);
            // Note: Inertia's router.on doesn't have a corresponding off method
            // The cleanup happens automatically when the component unmounts
        };
    }, []);

    if (!isLoading && progress === 0) return null;

    return (
        <>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
                <div
                    className="h-full bg-gradient-to-r from-[#3d7872] via-[#F2A100] to-[#3d7872] transition-all duration-300 ease-out shadow-lg"
                    style={{
                        width: `${progress}%`,
                        boxShadow: '0 0 10px rgba(61, 120, 114, 0.5)',
                    }}
                />
            </div>

            {/* Optional: Subtle overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/5 z-[9998] pointer-events-none transition-opacity duration-200" />
            )}
        </>
    );
}
