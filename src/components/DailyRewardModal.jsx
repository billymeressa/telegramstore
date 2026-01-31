import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import SpinWheel from './SpinWheel'; // Assuming SpinWheel is in the same directory or adjust path
import useStore from '../store/useStore';

const DailyRewardModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    // We'll use local storage to track the last time the modal was SHOWN to avoid spamming on every refresh
    // The actual spin logic (can user spin?) is handled by the backend/SpinWheel component
    // But we only want to POP UP the modal if it's been > 24 hours (or a new day) since last VIEW.

    const { gameSettings } = useStore();

    useEffect(() => {
        const checkDailyPopup = () => {
            // Check if enabled in gameSettings
            if (gameSettings?.dailyReward === false) return;

            // Force show on every mount (per user request)
            setTimeout(() => {
                setIsOpen(true);
            }, 1000);
        };

        checkDailyPopup();

        // Listen for manual open event from header
        const handleManualOpen = () => setIsOpen(true);
        document.addEventListener('open-daily-reward', handleManualOpen);

        return () => {
            document.removeEventListener('open-daily-reward', handleManualOpen);
        };
    }, [gameSettings?.dailyReward]);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-sm z-10"
                    >
                        {/* Decorative Header */}
                        <div className="absolute -top-10 left-0 right-0 flex justify-center z-20">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                className="bg-yellow-400 text-yellow-900 font-black px-6 py-2 rounded-full shadow-[0_4px_0_#b45309] border-2 border-yellow-200 flex items-center gap-2"
                            >
                                <Sparkles size={20} />
                                <span>DAILY BONUS</span>
                                <Sparkles size={20} />
                            </motion.div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute -top-2 -right-2 z-20 bg-white text-gray-400 hover:text-gray-600 rounded-full p-2 shadow-lg border border-gray-100"
                        >
                            <X size={20} />
                        </button>

                        {/* Spin Wheel Component */}
                        {/* We wrap it in a card style if SpinWheel doesn't have its own container, 
                             but looking at SpinWheel.jsx, it has its own styled container.
                             We might just render it directly. */}
                        <SpinWheel />

                        {/* Footer Hint */}
                        <div className="text-center mt-4">
                            <p className="text-white/80 text-sm font-medium drop-shadow-md">
                                Tap outside to close
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DailyRewardModal;
