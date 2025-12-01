import { useEffect, useState } from 'react';

interface FullScreenLoaderProps {
    message?: string;
}

export default function FullScreenLoader({ message = 'Loading...' }: FullScreenLoaderProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-[#FFFCF4] to-[#F3E5C3]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle, #3d7872 1px, transparent 1px)`,
                    backgroundSize: '30px 30px',
                }} />
            </div>

            {/* Content */}
            <div className="relative flex flex-col items-center gap-8">
                {/* Logo/Spinner */}
                <div className="relative">
                    {/* Outer spinning ring */}
                    <div className="w-24 h-24 rounded-full border-4 border-[#3d7872]/20 border-t-[#3d7872] animate-spin" />

                    {/* Inner logo circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3d7872] to-[#F2A100] flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white font-['Nunito']">IQ</span>
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#192020] font-['Nunito']">
                        IqraQuest
                    </h2>
                    <p className="text-sm text-gray-600 font-['Poppins'] min-w-[100px] text-center">
                        {message}{dots}
                    </p>
                </div>
            </div>
        </div>
    );
}
