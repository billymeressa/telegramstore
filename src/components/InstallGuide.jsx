import { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDown, Share } from 'lucide-react';
import useStore from '../store/useStore';

const InstallGuide = () => {
    const { installGuideVisible, setInstallGuideVisible } = useStore();
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');

        // Auto-show logic (optional, but good for onboarding)
        // If not standalone and not dismissed, show after delay?
        // User requested "when user clicks", so we might skip auto-show or keep it subtle.
        // Let's keep the store as the source of truth mainly.
        // But we can set the store to true if we want auto-show.

        const isDismissed = localStorage.getItem('install_guide_dismissed');
        if (!isStandalone && !isDismissed && !installGuideVisible) {
            // Uncomment next line to enable auto-show
            // setTimeout(() => setInstallGuideVisible(true), 3000);
        }

    }, []);

    const handleDismiss = () => {
        setInstallGuideVisible(false);
        // We might not want to permanently dismiss if triggered manually?
        // But if auto-shown, yes. Let's just hide it for now.
    };

    if (!installGuideVisible) return null;

    // Positioning Styles
    // iOS: Bottom Center pointing down to Share button
    // Android: Top Right pointing up to Menu button

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop to focus attention? Optional. Let's keep it minimal as requested "guide pointing" */}

            <div
                className={`pointer-events-auto absolute bg-[#fb7701] text-white p-3 rounded-lg shadow-lg max-w-[220px] text-xs font-medium animate-in fade-in duration-300 ${isIOS
                        ? 'bottom-[80px] left-1/2 -translate-x-1/2' // iOS Position
                        : 'top-2 right-2' // Android Position
                    }`}
            >
                {/* Arrow */}
                {isIOS ? (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#fb7701] rotate-45 transform"></div>
                ) : (
                    <div className="absolute -top-1.5 right-1 w-3 h-3 bg-[#fb7701] rotate-45 transform"></div>
                )}

                <button
                    onClick={handleDismiss}
                    className="absolute -top-2 -left-2 bg-white text-gray-500 rounded-full p-0.5 shadow-sm border border-gray-100"
                >
                    <X size={12} />
                </button>

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                    {isIOS ? (
                        <>
                            <div className="flex flex-col items-center gap-1">
                                <p className="leading-tight">
                                    Tap the <Share size={12} className="inline mx-0.5" /> <span className="font-bold">Share</span> button below
                                </p>
                                <ArrowDown size={16} className="animate-bounce mt-1" />
                            </div>
                            <div>
                                <p className="opacity-90">Then select <span className="font-bold underline">Add to Home Screen</span></p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-start gap-2">
                                <ArrowUpRight size={16} className="shrink-0 mt-0.5" />
                                <p className="leading-tight">
                                    Tap the <span className="font-bold">three dots</span> menu above
                                </p>
                            </div>
                            <div className="pl-6">
                                <p className="opacity-90">Select <span className="font-bold underline">Add to Home Screen</span> or <span className="font-bold underline">Install App</span></p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallGuide;
