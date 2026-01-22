import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-[var(--tg-theme-secondary-bg-color)] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <Loader2 className="text-[var(--tg-theme-button-color)] animate-spin mb-4" size={32} />
            <p className="text-[var(--tg-theme-hint-color)] text-sm font-medium">
                Loading...
            </p>
        </div>
    );
};

export default LoadingScreen;
