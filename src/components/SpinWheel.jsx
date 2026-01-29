import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import API_URL from '../config';
import useStore from '../store/useStore';

const SEGMENTS = [
    { label: '20 ETB', tier: 1, color: '#3390ec' }, // Blue
    { label: '50 ETB', tier: 2, color: '#2481cc' }, // Darker Blue
    { label: '5 ETB', tier: 1, color: '#3390ec' },
    { label: '150 ETB', tier: 3, color: '#0088cc' }, // Tech Blue
    { label: '10 ETB', tier: 1, color: '#3390ec' },
    { label: '75 ETB', tier: 2, color: '#2481cc' },
    { label: '15 ETB', tier: 1, color: '#3390ec' },
    { label: 'JACKPOT', tier: 4, color: '#f39c12' }, // Orange/Gold
];

const SpinWheel = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState('');
    const controls = useAnimation();
    const wheelRef = useRef(null);
    const currentRotation = useRef(0);
    const fetchUserData = useStore(state => state.fetchUserData);

    const tele = window.Telegram?.WebApp;

    const handleSpin = async () => {
        if (isSpinning) return;

        try {
            setIsSpinning(true);
            setMessage('');
            setResult(null);

            const res = await fetch(`${API_URL}/api/user/spin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                }
            });

            const data = await res.json();

            if (!data.success) {
                setMessage(data.message || 'Error occurred');
                setIsSpinning(false);
                return;
            }

            const { tier, reward } = data;

            // Find segment(s) matching the tier
            const matchingIndices = SEGMENTS.reduce((acc, seg, idx) => {
                if (seg.tier === tier || (tier === 5 && seg.tier === 4)) {
                    acc.push(idx);
                }
                return acc;
            }, []);

            // Pick a random index from matches
            const targetIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

            // Calculate rotation
            // 8 segments = 45 degrees per segment
            // Segment 0 is at top (0 degrees)
            // But we want to land on the center of the segment.
            // Angle to segment i = i * 45
            // To make it land on top, we need to rotate by - (i * 45)
            // Plus some random offset within the segment (-20 to +20)
            const segmentAngle = 360 / SEGMENTS.length;
            const targetAngle = targetIndex * segmentAngle;

            // Spin at least 5-10 times
            const rotations = 5 + Math.floor(Math.random() * 5);
            const extraDegrees = (360 - targetAngle) + (Math.random() * (segmentAngle - 10) + 5);
            const totalRotation = currentRotation.current + (rotations * 360) + extraDegrees;

            currentRotation.current = totalRotation;

            await controls.start({
                rotate: totalRotation,
                transition: {
                    duration: 4,
                    ease: [0.12, 0, 0.39, 0], // Fast start, very slow end
                }
            });

            setResult({ tier, reward, label: SEGMENTS[targetIndex].label });
            setIsSpinning(false);

            // Sync balance with store
            await fetchUserData();

            // Confetti for Tier 3+
            if (tier >= 3) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3390ec', '#ffffff', '#f39c12']
                });
            }

            if (tele?.HapticFeedback) {
                tele.HapticFeedback.notificationOccurred('success');
            }

        } catch (error) {
            console.error("Spin error:", error);
            setMessage('Network error. Try again.');
            setIsSpinning(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-tg-bg rounded-3xl shadow-xl w-full max-w-md mx-auto relative overflow-hidden">
            {/* Header */}
            <h2 className="text-2xl font-bold text-tg-text mb-2">Lucky Spin</h2>
            <p className="text-tg-hint text-sm mb-6 text-center">Spin once every 24 hours to win ETB rewards!</p>

            {/* Wheel Container */}
            <div className="relative w-72 h-72 mb-8">
                {/* Fixed Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-6 h-8 bg-red-500 clip-path-polygon-[50%_100%,0%_0%,100%_0%] shadow-lg"
                        style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                </div>

                {/* The Wheel */}
                <motion.div
                    animate={controls}
                    className="w-full h-full rounded-full border-8 border-tg-button shadow-2xl relative overflow-hidden bg-white"
                    initial={{ rotate: 0 }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {SEGMENTS.map((seg, i) => {
                            const angle = 360 / SEGMENTS.length;
                            const startAngle = i * angle;
                            const endAngle = (i + 1) * angle;

                            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                            const largeArcFlag = angle > 180 ? 1 : 0;
                            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                            return (
                                <g key={i}>
                                    <path d={pathData} fill={seg.color} stroke="white" strokeWidth="0.5" />
                                    {/* Text Label */}
                                    <text
                                        x="75"
                                        y="50"
                                        fill="white"
                                        fontSize="4"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                                    >
                                        {seg.label}
                                    </text>
                                </g>
                            );
                        })}
                        {/* Center Circle */}
                        <circle cx="50" cy="50" r="4" fill="white" stroke="#3390ec" strokeWidth="1" />
                    </svg>
                </motion.div>
            </div>

            {/* Controls */}
            <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSpinning
                    ? 'bg-tg-hint text-white cursor-not-allowed opacity-50'
                    : 'bg-tg-button text-white shadow-lg shadow-blue-500/30'
                    }`}
            >
                {isSpinning ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Spinning...
                    </>
                ) : 'SPIN NOW'}
            </button>

            {/* Feedback Messages */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium w-full text-center"
                >
                    {message}
                </motion.div>
            )}

            {result && !isSpinning && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-6 text-center"
                >
                    <div className="text-5xl mb-4">🎁</div>
                    <h3 className="text-2xl font-black text-tg-button mb-2">CONGRATULATIONS!</h3>
                    <p className="text-tg-text text-lg mb-1">You won</p>
                    <p className="text-4xl font-bold text-blue-600 mb-6">{result.reward} ETB</p>
                    <button
                        onClick={() => setResult(null)}
                        className="px-8 py-3 bg-tg-button text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        Awesome!
                    </button>
                </motion.div>
            )}

            {/* Confetti Canvas Placeholder (Confetti uses its own canvas or global) */}
        </div>
    );
};

export default SpinWheel;
