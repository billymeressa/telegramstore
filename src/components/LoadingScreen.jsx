import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    const firstName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;

    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6">

                <div className="relative">
                    <div className="w-24 h-24 mb-4 relative drop-shadow-md">
                        <img src="/logo.png" alt="Birtukan Logo" className="w-full h-full object-contain animate-bounce-slight" />
                    </div>
                    {/* <Loader2 className="text-[#fb7701] animate-spin" size={48} strokeWidth={2.5} /> */}
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-[#fb7701] tracking-tight">Birtukan</h1>
                    <p className="text-gray-400 text-sm font-medium">
                        {firstName ? `Welcome, ${firstName}` : 'Loading...'}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 text-[10px] text-gray-300 font-mono">
                SECURE STORE v2.1
            </div>
        </div>
    );
};

export default LoadingScreen;
