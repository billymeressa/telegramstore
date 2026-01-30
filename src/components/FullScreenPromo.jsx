import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Timer } from 'lucide-react';
import useStore from '../store/useStore';
import confetti from 'canvas-confetti';

const FullScreenPromo = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [stage, setStage] = useState('initial'); // initial, opening, revealed
    const [reward, setReward] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    // Logic to trigger the promo frequently (Temu style)
    useEffect(() => {
        const checkPromo = () => {
            const lastShown = localStorage.getItem('lastPromoShown');
            const now = Date.now();
            const cooldown = 60 * 1000 * 2; // 2 minutes cooldown (Aggressive!)

            if (!lastShown || now - parseInt(lastShown) > cooldown) {
                // 30% chance to show every check if cooldown passed
                if (Math.random() > 0.3) {
                    setIsVisible(true);
                    setStage('initial');
                    localStorage.setItem('lastPromoShown', now.toString());
                }
            }
        };

        // Check immediately on mount, then every 30 seconds
        const initialTimer = setTimeout(checkPromo, 2000); // 2s delay on load
        const interval = setInterval(checkPromo, 30000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    // Countdown Timer Logic
    useEffect(() => {
        if (isVisible && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [isVisible, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleOpen = () => {
        setStage('opening');
        setTimeout(() => {
            setStage('revealed');
            const randomReward = [
                { type: 'coupon', value: '50% OFF', code: 'FLASH50' },
                { type: 'credit', value: '100 ETB', code: 'CREDIT100' },
                { type: 'shipping', value: 'Free Shipping', code: 'FREESHIP' }
            ][Math.floor(Math.random() * 3)];

            setReward(randomReward);

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 100 // Above modal
            });
        }, 1500);
    };

    const handleClaim = () => {
        setIsVisible(false);
        // Here you would add the reward to the user's account/store
        // useStore.getState().addCoupon(reward.code);
        alert(`Reward ${reward.code} claimed!`);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Main Modal */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 100 }}
                        className="relative w-full max-w-sm bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-1 shadow-2xl overflow-hidden"
                    >
                        {/* Shimmer Border Efx */}
                        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>

                        <div className="bg-white rounded-[20px] p-6 text-center relative overflow-hidden">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 text-gray-400 hover:text-black p-1 bg-gray-100 rounded-full z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Header: Urgency */}
                            <div className="flex items-center justify-center gap-2 mb-4 text-red-600 font-bold bg-red-50 py-1.5 px-4 rounded-full inline-flex mx-auto border border-red-100 animate-pulse">
                                <Timer size={16} />
                                <span>Offer expires in {formatTime(timeLeft)}</span>
                            </div>

                            {/* Content based on Stage */}
                            {stage === 'initial' && (
                                <div className="py-8 flex flex-col items-center">
                                    <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                                        MYSTERY GIFT FOUD!
                                    </h2>
                                    <p className="text-gray-500 text-sm mb-8 px-4">
                                        You've been selected for an exclusive reward. Open it before time runs out!
                                    </p>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={{
                                            rotate: [0, -5, 5, -5, 5, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            rotate: { repeat: Infinity, duration: 2, repeatDelay: 1 },
                                            scale: { repeat: Infinity, duration: 2, repeatDelay: 1 }
                                        }}
                                        onClick={handleOpen}
                                        className="relative group"
                                    >
                                        <Gift size={120} className="text-primary drop-shadow-xl" />
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                            Tap to Open
                                        </div>
                                    </motion.button>
                                </div>
                            )}

                            {stage === 'opening' && (
                                <div className="py-12 flex flex-col items-center justify-center min-h-[300px]">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1.5, 0],
                                            opacity: [1, 1, 0],
                                            rotate: 180
                                        }}
                                        transition={{ duration: 1.5 }}
                                    >
                                        <Gift size={120} className="text-primary" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-400 mt-4 animate-pulse">Unwrapping...</h3>
                                </div>
                            )}

                            {stage === 'revealed' && reward && (
                                <div className="py-6 flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        type="spring"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6 transform rotate-3 border-4 border-white">
                                            {reward.type === 'coupon' ? '%' : reward.type === 'shipping' ? '🚚' : '💰'}
                                        </div>
                                    </motion.div>

                                    <h2 className="text-3xl font-black text-gray-900 mb-1">
                                        {reward.value}
                                    </h2>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 w-full">
                                        {reward.type === 'shipping' ? 'Shipping Discount' : 'Exclusive Reward'}
                                    </p>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 w-full mb-6">
                                        <p className="text-xs text-gray-400 mb-1">Your Code:</p>
                                        <p className="text-xl font-mono font-bold text-gray-800 tracking-wider select-all">
                                            {reward.code}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleClaim}
                                        className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-transform text-lg flex items-center justify-center gap-2"
                                    >
                                        <span>CLAIM NOW</span>
                                        <Timer size={18} className="animate-pulse" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Bling */}
                        <div className="bg-black/10 p-2 text-center">
                            <p className="text-white/80 text-[10px] font-medium">Verified by Addis Store • Limited Time Only</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenPromo;
