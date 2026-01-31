import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';

const SEGMENTS = [
    { label: '10 ETB', value: 10, color: '#fb7701', textColor: '#ffffff' }, // Orange
    { label: '50 ETB', value: 50, color: '#ffffff', textColor: '#e60023' }, // White
    { label: '5 ETB', value: 5, color: '#fb7701', textColor: '#ffffff' },
    { label: '100 ETB', value: 100, color: '#ffffff', textColor: '#e60023' },
    { label: '20 ETB', value: 20, color: '#fb7701', textColor: '#ffffff' },
    { label: 'JACKPOT', value: 500, color: '#e60023', textColor: '#ffffff' }, // Red
    { label: '15 ETB', value: 15, color: '#fb7701', textColor: '#ffffff' },
    { label: 'TRY AGAIN', value: 0, color: '#ffffff', textColor: '#555555' },
];

const SpinWheel = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState('');
    const controls = useAnimation();
    const currentRotation = useRef(0);
    const fetchUserData = useStore(state => state.fetchUserData);

    const tele = window.Telegram?.WebApp;

    const handleSpin = async () => {
        if (isSpinning || result) return;

        setIsSpinning(true);
        setMessage('');

        try {
            // -- MOCK API CALL START --
            // In a real app, this fetch would determine the result
            const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/spin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                }
            });
            const data = await apiRes.json();

            // Fallback for demo if API fails or returns error
            if (!data.success) {
                // For demo purposes, we might just simulate a win if API fails, or show error
                // setMessage(data.message || "Error");
                // setIsSpinning(false);
                // return;
            }

            // Use API data or Mock Data
            const prizeValue = data.reward !== undefined ? data.reward : 20;
            // -- MOCK API CALL END --

            // Determine Target Index based on value
            // If API returns a value not in segments, default to smallest
            let targetIndex = SEGMENTS.findIndex(s => s.value === prizeValue);
            if (targetIndex === -1) targetIndex = 4; // Default to 20 ETB

            // Calculate Rotation
            const segmentAngle = 360 / SEGMENTS.length;

            // We want the POINTER (at top) to land on the segment.
            // If segment 0 is at 0deg (3 o'clock usually in SVG circles), we need to adjust.
            // Let's assume standard SVG rotation: 0deg is 3 o'clock. 
            // We rotate -90deg to make index 0 at 12 o'clock.
            // To land index i at 12 o'clock, we rotate the wheel such that index i is at -90deg.

            // Actually simpler: 
            // Spin relative to current.
            // Target angle to LAND on top: 
            // Total segments = 8. Each = 45deg.
            // Index 0: [0, 45]. Center 22.5.
            // To land Index 0 at Top (270deg or -90deg):
            // Rotate wheel by: 360 - (Index * 45) - (Offset to center segment)

            const randomOffset = Math.random() * 30 - 15; // +/- 15deg randomness
            const spinRotations = 5 * 360; // 5 full spins
            const segmentCenter = (targetIndex * segmentAngle);

            // We want (Current + Spin + X) % 360 = (360 - segmentCenter)
            // But let's just do additive rotation
            const finalAngle = currentRotation.current + spinRotations + (360 - segmentCenter) + randomOffset;

            currentRotation.current = finalAngle;

            await controls.start({
                rotate: finalAngle,
                transition: {
                    duration: 4,
                    ease: [0.2, 0, 0.2, 1], // Cubic-bezier for "wheel" feel
                }
            });

            // Spin Complete
            setResult(SEGMENTS[targetIndex]);
            setIsSpinning(false);

            if (SEGMENTS[targetIndex].value > 0) {
                triggerConfetti();
                setMessage("WINNER!");
                // Optimistic update
                const currentBal = useStore.getState().walletBalance;
                useStore.getState().setWalletBalance(currentBal + SEGMENTS[targetIndex].value);
            } else {
                setMessage("Better luck next time!");
            }

            fetchUserData();

            if (tele?.HapticFeedback) {
                tele.HapticFeedback.notificationOccurred('success');
            }

        } catch (e) {
            console.error(e);
            setIsSpinning(false);
            setMessage("Network Error");
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#fb7701', '#e60023', '#ffd700']
        });
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full max-w-[320px] mx-auto">

            {/* Pointer (Fixed at Top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20 filter drop-shadow-lg">
                <div className="w-8 h-10 bg-gradient-to-b from-yellow-300 to-yellow-600 clip-path-polygon-[50%_100%,0%_0%,100%_0%] shadow-lg"
                    style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }}>
                </div>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full aspect-square p-2 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl ring-4 ring-orange-600/50">

                {/* Rotating Wheel */}
                <motion.div
                    animate={controls}
                    initial={{ rotate: 0 }}
                    className="w-full h-full rounded-full overflow-hidden relative bg-white border-4 border-white shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {SEGMENTS.map((seg, i) => {
                            const angle = 360 / SEGMENTS.length;
                            const startAngle = i * angle;
                            const endAngle = (i + 1) * angle;

                            // Convert polar to cartesian
                            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                            const largeArcFlag = angle > 180 ? 1 : 0;
                            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                            return (
                                <g key={i}>
                                    <path d={pathData} fill={seg.color} stroke="#f0f0f0" strokeWidth="0.5" />
                                    {/* Text Label */}
                                    <text
                                        x="72"
                                        y="50"
                                        fill={seg.textColor}
                                        fontSize="5"
                                        fontWeight="900"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        {seg.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </motion.div>

                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center z-10 border-4 border-yellow-400">
                    <div className="text-[#e60023] font-black text-xs leading-tight text-center">
                        SUPER<br />SPIN
                    </div>
                </div>
            </div>

            {/* Controls / Result */}
            <div className="mt-8 w-full text-center">
                {result ? (
                    <div className="animate-in zoom-in duration-300">
                        <p className="text-white text-lg font-bold mb-2 drop-shadow-md">{message}</p>
                        <button
                            onClick={() => setResult(null)}
                            className="bg-white text-[#e60023] font-black py-3 px-8 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all hover:bg-gray-50 uppercase tracking-wider"
                        >
                            Claim Reward
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={`w-full py-4 rounded-xl font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all
                            ${isSpinning ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-gradient-to-b from-[#e60023] to-[#b9001c] text-white hover:brightness-110'}`}
                    >
                        {isSpinning ? 'Spinning...' : 'Spin Now'}
                    </button>
                )}
            </div>

            {/* Decor */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-3xl" />
        </div>
    );
};

export default SpinWheel;
