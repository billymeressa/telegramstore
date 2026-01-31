import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../store/useStore';
import illustration from '../assets/add-to-home.png';

const AddToHomeScreenModal = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Condition:
        // 1. Not in standalone mode (not installed)
        // 2. Mobile device (simple check)
        // 3. Hasn't been dismissed recently

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const dismissedAt = localStorage.getItem('addToHomeDismissedAt');

        // Check if dismissed in last 7 days
        const isRecentlyDismissed = dismissedAt && (Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000);

        if (!isStandalone && isMobile && !isRecentlyDismissed) {
            // Delay show for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('addToHomeDismissedAt', Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none pb-[calc(20px+var(--tg-safe-area-bottom))]">
            {/* Backdrop (invisible but catches clicks if we wanted modal behavior, here we want toast behavior mostly, but let's make it semi-modal for attention) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in" onClick={handleDismiss} />

            {/* Card */}
            <div className="bg-white w-[90%] max-w-[340px] rounded-2xl shadow-2xl p-5 pointer-events-auto relative transform transition-all animate-in slide-in-from-bottom-10 duration-500">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 bg-gray-100 p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <img
                        src={illustration}
                        alt="Install Guide"
                        className="w-32 h-auto mb-4"
                    />

                    <h3 className="text-lg font-bold text-[#191919] mb-2">
                        Install App for Better Experience
                    </h3>

                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        To access exclusive deals faster, tap the <span className="font-bold">three dots</span> at the top right and select <span className="font-bold text-[#fb7701]">Add to Home Screen</span>.
                    </p>

                    <button
                        onClick={handleDismiss}
                        className="bg-[#fb7701] text-white font-bold text-sm px-8 py-2.5 rounded-full shadow-lg hover:bg-[#e66a01] active:scale-95 transition-all"
                    >
                        Got it
                    </button>
                </div>

                {/* Arrow Pointer Animation (Decorative) */}
                <div className="absolute -top-12 right-2 animate-bounce hidden sm:block">
                    {/* Could act as a pointer to the real menu if position aligns, but highly variable across devices */}
                </div>
            </div>
        </div>
    );
};

export default AddToHomeScreenModal;
