import { useEffect, useState } from 'react';

interface TableLoaderProps {
    message?: string;
}

export default function TableLoader({ message = 'Loading...' }: TableLoaderProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-[2px] transition-all duration-300">
            <div className="relative flex flex-col items-center gap-6 p-8 rounded-2xl">
                {/* Logo/Spinner */}
                <div className="relative scale-90">
                    {/* Outer spinning ring */}
                    <div className="w-20 h-20 rounded-full border-4 border-[#3d7872]/20 border-t-[#3d7872] animate-spin" />

                    {/* Inner logo circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3d7872] to-[#F2A100] flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-white font-['Nunito']">IQ</span>
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[#101928] font-bold font-['Nunito'] text-lg">
                        Please Wait
                    </p>
                    <p className="text-sm text-[#338078] font-['Nunito'] font-medium">
                        {message}{dots}
                    </p>
                </div>
            </div>
        </div>
    );
}
