import React from 'react';

const GamificationProgressBar = ({ current, target, label }) => {
    // Ensure percentage is between 0 and 100
    const percentage = Math.min(Math.max((current / target) * 100, 0), 100);

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                    {label}
                </span>
                <span className="text-gray-500 font-mono">
                    {Math.floor(percentage)}%
                </span>
            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-100">
                <div
                    className="h-full bg-gradient-to-r from-[#fb7701] to-[#ffb050] rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0 ETB</span>
                <span>{target} ETB</span>
            </div>
        </div>
    );
};

export default GamificationProgressBar;
