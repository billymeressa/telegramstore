import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    const firstName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;

    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6">

                <div className="relative">
                    <Loader2 className="text-[#fb7701] animate-spin" size={48} strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-[#fb7701]/20 blur-xl rounded-full"></div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                        {firstName ? `Welcome, ${firstName}` : 'Welcome'}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium">
                        Loading Addis Store...
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
