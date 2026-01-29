import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MysteryGift = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        // Check if user has already claimed a daily mystery gift
        const lastClaimed = localStorage.getItem('mystery_gift_claimed_date');
        const today = new Date().toDateString();

        if (lastClaimed !== today) {
            // Show after 3 seconds
            const tm = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(tm);
        }
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        // Determine reward
        const rewards = [
            { type: 'coupon', value: '10% OFF', code: 'LUCKY10' },
            { type: 'shipping', value: 'Free Shipping', code: 'SHIPFREE' },
            { type: 'points', value: '50 Points', code: 'BONUS50' }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        setReward(randomReward);

        // Mark as claimed
        localStorage.setItem('mystery_gift_claimed_date', new Date().toDateString());
    };

    const handleClose = () => {
        setIsVisible(false);
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isVisible && !isOpen && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, -10, 10, 0] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                        rotate: { repeat: Infinity, duration: 1.5, repeatDelay: 3 }
                    }}
                    onClick={handleOpen}
                    className="fixed bottom-24 right-4 z-50 cursor-pointer"
                >
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <Gift className="text-white fill-white/20" size={28} />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                            Free Gift!
                        </div>
                    </div>
                </motion.div>
            )}

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center relative overflow-hidden"
                    >
                        {/* Confetti Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white -z-10"></div>

                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <span className="text-4xl">🎁</span>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-2">CONGRATS!</h2>
                        <p className="text-gray-500 mb-6">You've unlocked a mystery reward!</p>

                        <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-1">
                                {reward?.value}
                            </p>
                            <div className="text-2xl font-black text-orange-600 font-mono tracking-wider">
                                {reward?.code}
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
                        >
                            Claim Reward
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MysteryGift;
