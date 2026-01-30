import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ChevronRight } from 'lucide-react';

const GamificationProgressBar = ({
    current = 0,
    target = 1000,
    label = "Progress to Free Gift",
    rewardIcon = <Gift size={18} className="text-white" />
}) => {
    // Calculate percentage, capped at 100
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));

    return (
        <div className="px-4 py-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">

                {/* Header info */}
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        {label}
                    </h3>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {current} / {target} ETB
                    </span>
                </div>

                {/* Progress Track */}
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                    {/* Animated Fill */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full relative"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-white/30 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                </div>

                {/* Milestones / Rewards End */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-0">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        // Only shake if near completion
                        animate={percentage >= 90 ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={percentage >= 90 ? { repeat: Infinity, duration: 1 } : {}}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 ${percentage >= 100 ? 'bg-green-500 border-green-300' : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-white'}`}
                    >
                        {rewardIcon}
                    </motion.div>
                </div>

                {/* Subtext */}
                <p className="text-xs text-gray-400 mt-2 font-medium">
                    {percentage >= 100
                        ? "Goal Reached! Claim your reward!"
                        : `Earn ${target - current} more points to unlock!`
                    }
                </p>

                {/* Interactive Chevron for details (optional) */}
                <div className="absolute right-2 bottom-2 opacity-20">
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
};

export default GamificationProgressBar;
