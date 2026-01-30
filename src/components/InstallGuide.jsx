import { useState, useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

const InstallGuide = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if app is already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');

        // Check if user dismissed it previously
        const isDismissed = localStorage.getItem('install_guide_dismissed');

        // Only show if NOT standalone and NOT dismissed
        // Also delay it a bit so it doesn't pop up instantly
        if (!isStandalone && !isDismissed) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('install_guide_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-2 right-2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative bg-[#fb7701] text-white p-3 rounded-lg shadow-lg max-w-[200px] text-xs font-medium">
                {/* Arrow pointing to dots */}
                <div className="absolute -top-1.5 right-1 w-3 h-3 bg-[#fb7701] rotate-45 transform"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute -top-2 -left-2 bg-white text-gray-500 rounded-full p-0.5 shadow-sm border border-gray-100"
                >
                    <X size={12} />
                </button>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-start gap-2">
                        <ArrowUpRight size={16} className="shrink-0 mt-0.5" />
                        <p className="leading-tight">
                            Tap the <span className="font-bold">three dots</span> menu above
                        </p>
                    </div>
                    <div className="pl-6">
                        <p className="opacity-90">Select <span className="font-bold underline">Add to Home Screen</span> or <span className="font-bold underline">Install App</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallGuide;
