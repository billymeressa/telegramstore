import React, { useMemo } from 'react';
import { Truck, Gift, Zap } from 'lucide-react';
import useStore from '../store/useStore';

const TIERS = [
    { threshold: 1000, reward: 'Free Shipping', icon: Truck },
    { threshold: 2500, reward: 'Mystery Gift', icon: Gift },
    { threshold: 5000, reward: 'VIP Status', icon: Zap },
];

const CartProgress = () => {
    const cart = useStore(state => state.cart);

    const total = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    // Find next goal
    const nextTier = TIERS.find(t => total < t.threshold) || TIERS[TIERS.length - 1];

    // Calculate progress percentage
    // If total > max threshold, stick to 100%
    const progress = Math.min(100, (total / nextTier.threshold) * 100);
    const amountNeeded = nextTier.threshold - total;

    return (
        <div className="bg-white p-4 border-b border-gray-100">
            {total >= TIERS[TIERS.length - 1].threshold ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 animate-pulse">
                    <Zap size={20} fill="currentColor" />
                    <span className="font-bold text-sm">MAXIMUM REWARDS UNLOCKED!</span>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-sm text-gray-700">
                            Add <span className="font-bold text-primary">{Math.max(0, Math.floor(amountNeeded))} Birr</span> to unlock <span className="font-bold text-orange-600">{nextTier.reward}</span>
                        </div>
                        <nextTier.icon size={20} className="text-orange-500" />
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
                        {/* Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700 ease-out rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shimmer on bar */}
                            <div className="absolute inset-0 bg-white/30 w-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                        </div>

                        {/* Markers */}
                        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
                            <div className="absolute left-1/3 h-full w-0.5 bg-white/50"></div>
                            <div className="absolute left-2/3 h-full w-0.5 bg-white/50"></div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                        <span>Start</span>
                        <span>{nextTier.threshold} ETB</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartProgress;
