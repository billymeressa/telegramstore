import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    const firstName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;

    return (
        <div className="fixed inset-0 bg-[var(--tg-theme-secondary-bg-color)] z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="bg-[var(--tg-theme-bg-color)] p-6 rounded-2xl shadow-sm border border-[var(--tg-theme-section-separator-color)] w-full max-w-[280px] flex flex-col items-center gap-4">
                <Loader2 className="text-[var(--tg-theme-button-color)] animate-spin" size={40} />

                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)]">
                        {firstName ? `Welcome, ${firstName}!` : 'Welcome!'}
                    </h3>
                    <p className="text-[var(--tg-theme-hint-color)] text-sm">
                        Getting the store ready for you...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
