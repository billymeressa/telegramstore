import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GamificationProgressBar = ({
    current = 0,
    target = 1000,
    label = "Claim Free Gift"
}) => {
    const navigate = useNavigate();
    const progress = Math.min((current / target) * 100, 100);
    const left = target - current;

    return (
        <div
            onClick={() => navigate('/rewards')}
            className="px-3 py-2 cursor-pointer active:opacity-90"
        >
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <Gift size={14} className="text-[#fb7701]" fill="#fb7701" />
                    <h3 className="text-xs font-bold text-gray-900">{label}</h3>
                </div>
                <div className="flex items-center text-[10px] text-gray-400 font-medium">
                    View Details <ChevronRight size={12} />
                </div>
            </div>

            <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-[#fb7701] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-[#fb7701]">{current} ETB</span>
                <span className="text-gray-400">Target: {target} ETB</span>
            </div>

            <p className="text-[10px] text-gray-500 mt-1">
                {left <= 0
                    ? <span className="text-green-600 font-bold">Goal Reached! Tap to claim.</span>
                    : <span>Spend <span className="font-bold text-[#191919]">{left} ETB</span> more to unlock!</span>
                }
            </p>
        </div>
    );
};

export default GamificationProgressBar;
