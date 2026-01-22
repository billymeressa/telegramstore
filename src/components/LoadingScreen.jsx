import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-[#FAFAFA] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F0FDF9] rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Loader2 className="text-[#054D3B] animate-spin" size={32} />
                </div>

                <h2 className="text-xl font-bold text-[#0F1111] mb-2">
                    Welcome to our Store!
                </h2>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Please wait a moment while we get the best products ready for you...
                </p>

                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] rounded-full animate-progress-indeterminate"></div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                    Connecting to server...
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
