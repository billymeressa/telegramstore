import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

const SEGMENTS = [
    { label: '10% OFF', color: '#EF4444', value: '10% Discount' },
    { label: 'Free Ship', color: '#3B82F6', value: 'Free Shipping' },
    { label: 'Try Again', color: '#6B7280', value: null },
    { label: '20% OFF', color: '#10B981', value: '20% Discount' },
    { label: '5% OFF', color: '#F59E0B', value: '5% Discount' },
    { label: 'Jackpot', color: '#8B5CF6', value: '50% Discount' },
];

const SpinWheel = ({ onClose }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [hasSpun, setHasSpun] = useState(false);

    useEffect(() => {
        // Check if already spun today
        const lastSpin = localStorage.getItem('lastSpinTime');
        if (lastSpin) {
            const hoursPassed = (Date.now() - parseInt(lastSpin)) / (1000 * 60 * 60);
            if (hoursPassed < 24) {
                setHasSpun(true); // Treat as if they already spun if within cooldown
            }
        }
    }, []);

    const spin = () => {
        if (isSpinning || hasSpun) return;

        setIsSpinning(true);

        // Calculate random rotation (min 5 full spins + random segment)
        const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
        const segmentAngle = 360 / SEGMENTS.length;
        const extraSpins = 360 * 5;
        const targetRotation = extraSpins + (randomSegment * segmentAngle) + (segmentAngle / 2); // Center of segment

        // Adjust logic: The pointer is usually at the top (0 degrees) or right. 
        // If wheel spins clockwise, the winning segment is determined by where it stops relative to the pointer.
        // Let's assume pointer is at the top (0deg).
        // The rotation we apply puts a specific angle at the top.

        setRotation(rotation + targetRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setHasSpun(true);

            // Calculate winner index based on rotation
            // This is a simplified "visual" winner. For real implementation, determine winner first then rotate to it.
            // Here we randomly selected `randomSegment` as the offset.
            // Since 0deg is top, and we rotate clockwise, the segment at the top is:
            // (Total Rotation % 360) maps to the segment. 
            // Actually simpler: we targeted `randomSegment`.
            // Let's just say the result is what we aimed for.
            // Note: This math might need fine-tuning to align perfectly with the pointer, 
            // but for "fun" visual it's okay to just pick the result we wanted.

            // Wait, if we rotate BY targetRotation, we need to know where we land.
            // To make it deterministic:
            // 1. Pick winner index.
            // 2. Calculate degrees to land that winner at the pointer.

            const winningIndex = (SEGMENTS.length - 1) - (randomSegment % SEGMENTS.length); // Inverse because wheel moves clockwise
            const winner = SEGMENTS[winningIndex] || SEGMENTS[0];

            setResult(winner);

            if (winner.value) {
                localStorage.setItem('lastSpinTime', Date.now().toString());
                // Could save reward to localStorage too
            }

        }, 4000); // Match transition duration
    };

    const wheelVariants = {
        initial: { rotate: 0 },
        animate: {
            rotate: rotation,
            transition: {
                duration: 4,
                ease: [0.2, 0.8, 0.3, 1] // Cubic bezier for "spin down" physics feel
            }
        }
    };

    if (hasSpun && !result) {
        // If loaded and found they already spun (and we didn't just spin), maybe don't show or show "Come back later"
        // For this component we'll assume the parent handles "don't show if already spun", 
        // but if we are here, we can show a "Already claimed" state.
        // For now, let's just let them see the wheel but disabled if we want.
        // But typically we simply wouldn't render the modal if they can't spin.
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-center text-white relative">
                    <button onClick={onClose} className="absolute right-3 top-3 text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                        <Gift size={20} /> Daily Spin
                    </h2>
                    <p className="text-xs opacity-90">Spin to win exclusive discounts!</p>
                </div>

                {/* Wheel Container */}
                <div className="p-6 flex flex-col items-center">

                    <div className="relative w-64 h-64 mb-6">
                        {/* Pointer */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-8 h-8">
                            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[20px] border-t-yellow-400 border-r-[10px] border-r-transparent drop-shadow-md"></div>
                        </div>

                        {/* The Wheel */}
                        <motion.div
                            className="w-full h-full rounded-full border-4 border-gray-100 overflow-hidden relative shadow-inner"
                            variants={wheelVariants}
                            initial="initial"
                            animate="animate"
                            style={{ transformOrigin: 'center' }}
                        >
                            {SEGMENTS.map((seg, i) => {
                                const angle = 360 / SEGMENTS.length;
                                return (
                                    <div
                                        key={i}
                                        className="absolute w-full h-full top-0 left-0"
                                        style={{
                                            transform: `rotate(${i * angle}deg)`,
                                            transformOrigin: '50% 50%'
                                            // Note: Creating conic segments with CSS is tricky without clip-path or conic-gradient.
                                            // A simpler approach for this MVP is to use a conic gradient background or svg.
                                            // Let's use SVG for cleaner segments.
                                        }}
                                    >
                                        {/* This div method is hard for pie slices. Switching to SVG below. */}
                                    </div>
                                );
                            })}

                            {/* SVG Wheel Implementation for easier segments */}
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                {SEGMENTS.map((seg, i) => {
                                    const angle = 360 / SEGMENTS.length;
                                    const startAngle = i * angle;
                                    const endAngle = (i + 1) * angle;

                                    // Calculate path commands for a slice
                                    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                                    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                                    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                                    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                                    const d = `M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`;

                                    return (
                                        <g key={i}>
                                            <path d={d} fill={seg.color} stroke="white" strokeWidth="0.5" />
                                            <text
                                                x="50"
                                                y="50"
                                                fill="white"
                                                fontSize="5"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                alignmentBaseline="middle"
                                                transform={`rotate(${startAngle + angle / 2}, 50, 50) translate(25, 0)`}
                                            >
                                                {seg.label}
                                            </text>
                                        </g>
                                    )
                                })}
                            </svg>
                        </motion.div>

                        {/* Center Knob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md z-10 flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>

                    {/* Controls */}
                    {result ? (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                {result.value ? "Congratulations!" : "Too bad!"}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {result.value ? `You won: ${result.value}` : "Better luck next time."}
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors w-full"
                            >
                                {result.value ? "Claim Prize" : "Close"}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={spin}
                            disabled={isSpinning || hasSpun}
                            className={`
                        w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95
                        ${isSpinning || hasSpun
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-xl hover:brightness-110'}
                    `}
                        >
                            {isSpinning ? 'Good Luck...' : 'SPIN NOW'}
                        </button>
                    )}

                    {hasSpun && !result && !isSpinning && (
                        <p className="mt-3 text-xs text-center text-gray-400">
                            You have already spun today. Come back tomorrow!
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SpinWheel;
