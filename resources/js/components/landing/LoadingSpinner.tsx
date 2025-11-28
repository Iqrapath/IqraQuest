export default function LoadingSpinner() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fff7e4]">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#338078]/20 border-t-[#338078]"></div>
                
                {/* Loading Text */}
                <p className="font-['Nunito'] text-lg font-medium text-[#338078]">
                    Loading...
                </p>
            </div>
        </div>
    );
}
