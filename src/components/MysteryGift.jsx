import React, { useState, useEffect } from 'react';
import { Gift, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'; // Assuming framer-motion is available based on previous context, otherwise standard CSS
import useStore from '../store/useStore';
import confetti from 'canvas-confetti';

const MysteryGift = () => {
    const { gameSettings } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [reward, setReward] = useState(null);
    const [isShaking, setIsShaking] = useState(true);

    useEffect(() => {
        // Force show if enabled, ignore history
        if (gameSettings?.mysteryGift === false) return;

        const tm = setTimeout(() => setIsVisible(true), 2000); // Show quickly
        return () => clearTimeout(tm);
    }, [gameSettings?.mysteryGift]);

    useEffect(() => {
        if (isVisible && !isOpen) {
            const interval = setInterval(() => {
                setIsShaking(prev => !prev);
            }, 3000); // Shake every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isVisible, isOpen]);

    const handleOpen = () => {
        setIsOpen(true);
        setIsVisible(false); // Hide the floating button

        // Determine reward
        let rewards = [
            { type: 'coupon', value: '10% OFF', code: 'LUCKY10' },
            { type: 'shipping', value: 'Free Shipping', code: 'SHIPFREE' },
            { type: 'points', value: '50 Points', code: 'BONUS50' }
        ];

        if (settings.mystery_gift_pool) {
            try {
                const pool = typeof settings.mystery_gift_pool === 'string'
                    ? JSON.parse(settings.mystery_gift_pool)
                    : settings.mystery_gift_pool;
                if (Array.isArray(pool) && pool.length > 0) {
                    rewards = pool;
                }
            } catch (e) {
                console.error("Invalid Mystery Gift Pool", e);
            }
        }

        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

        // Delay reveal for effect
        setTimeout(() => {
            setReward(randomReward);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            localStorage.setItem('mystery_gift_claimed_date', new Date().toDateString());
        }, 1000);
    };

    const handleClose = () => {
        setIsOpen(false);
        setReward(null);
    };

    if (gameSettings?.mysteryGift === false) return null;

    return (
        <>
            {/* Floating Trigger */}
            {isVisible && !isOpen && (
                <div
                    onClick={handleOpen}
                    className={`fixed bottom-[90px] right-4 z-40 cursor-pointer transition-transform duration-100 ${isShaking ? 'animate-bounce' : ''}`}
                >
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#fb7701] to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#fb7701]/30">
                            <Gift className="text-white fill-white/20" size={28} />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            Free Gift
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center relative overflow-hidden shadow-2xl">
                        <button onClick={handleClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} className="text-gray-400" />
                        </button>

                        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce border-4 border-white shadow-md">
                            <span className="text-5xl">🎁</span>
                        </div>

                        {reward ? (
                            <div className="animate-in zoom-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black text-gray-900 mb-1">CONGRATS!</h2>
                                <p className="text-gray-500 text-sm mb-6">You've unlocked a mystery reward!</p>

                                <div className="bg-[#fff0e0] border-2 border-dashed border-[#fb7701] rounded-xl p-6 mb-6 relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fb7701] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        LIMITED TIME
                                    </div>
                                    <p className="text-sm font-bold text-[#fb7701] uppercase tracking-wide mb-1">
                                        {reward.value}
                                    </p>
                                    <div className="text-3xl font-black text-[#be0000] font-mono tracking-wider">
                                        {reward.code}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2">Tap code to copy</p>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="w-full bg-[#fb7701] text-white font-bold py-3.5 rounded-full shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
                                >
                                    Claim & Shop Now
                                </button>
                            </div>
                        ) : (
                            <div className="py-10">
                                <h2 className="text-xl font-bold text-gray-800 animate-pulse">Opening Gift...</h2>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MysteryGift;
