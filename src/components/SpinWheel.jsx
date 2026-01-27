import { useState, useEffect, useRef } from 'react';

import { X, Gift, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import API_URL from '../config';

const SEGMENTS = [
    { label: 'Try Again', color: '#94a3b8' },      // 0
    { label: '100 Br Off', color: '#3b82f6' },     // 1
    { label: '10% Off', color: '#a855f7' },        // 2
    { label: 'JACKPOT', color: '#ef4444' }         // 3
];

const SpinWheel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null); // { prizeIndex, code, message }
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        // Show popup after 10 seconds if not spun and cooldown passed
        const hasSpun = localStorage.getItem('hasSpunWheel');
        const lastSeen = localStorage.getItem('lastSeenWheel');
        const now = Date.now();
        const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

        if (!hasSpun) {
            if (!lastSeen || (now - parseInt(lastSeen) > COOLDOWN)) {
                const timer = setTimeout(() => setIsOpen(true), 10000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleSpin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);

        try {
            // 1. Get Result from Backend
            const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
            const res = await fetch(`${API_URL}/api/game/spin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });
            const data = await res.json();

            if (!data.success) {
                if (data.message.includes('tomorrow')) {
                    alert(data.message); // Simple alert for now, or use a toast
                    setIsOpen(false);
                    return;
                }
                throw new Error('Failed to spin');
            }

            // 2. Animate Wheel
            // Calculate rotation to land on the prize
            // 4 Segments = 90deg each. 
            // Index 0: 0-90, Index 1: 90-180, etc.
            // But we need to account for the pointer (usually at top, 0 deg)
            // If pointer is at top (0deg), and we rotate CLOCKWISE:
            // Landing on Index 0 means Index 0 is at Top.

            const segmentAngle = 360 / SEGMENTS.length;
            const targetIndex = data.prizeIndex;

            // Random extra rotations (5-10 spins)
            const extraRotations = 360 * (5 + Math.floor(Math.random() * 5));

            // Calculate specific angle to center the segment at top
            // If Index 0 is at 0-90. Center is 45.
            // To make 45 be at Top (270 or -90), we rotate?
            // Simpler: Just rotate to a specific negative angle.
            // Target Angle = -(TitleAngle + Extra)
            // Let's say Index 0 center is at 45deg. To bring declared Index 0 to top (0deg), we rotate -45.

            const randomOffset = Math.random() * segmentAngle * 0.8 - (segmentAngle * 0.4); // Random jitter within segment
            const targetRotation = extraRotations + (360 - (targetIndex * segmentAngle)) - (segmentAngle / 2) + randomOffset;

            setRotation(targetRotation);

            // 3. Wait for animation
            setTimeout(() => {
                setResult(data);
                setIsSpinning(false);

                if (data.prizeIndex > 0) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        zIndex: 9999
                    });
                    localStorage.setItem('hasSpunWheel', 'true');
                }
            }, 5000); // 5s match CSS transition

        } catch (e) {
            console.error(e);
            setIsSpinning(false);
        }
    };

    const handleClose = () => {
        if (isSpinning) return;
        setIsOpen(false);
        // If they close without spinning, snooze for 24h
        if (result) {
            localStorage.setItem('hasSpunWheel', 'true');
        } else {
            localStorage.setItem('lastSeenWheel', Date.now().toString());
        }
    };

    const handleCopy = () => {
        if (result?.code) {
            navigator.clipboard.writeText(result.code);
            // Show copied feedback?
        }
        handleClose();
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <div
                        className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center"
                    >
                        {!result ? (
                            <>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">SPIN & WIN!</h2>
                                <p className="text-gray-500 text-sm mb-6 text-center">Try your luck for exclusive discounts</p>

                                {/* WHEEL CONTAINER */}
                                <div className="relative w-64 h-64 mb-8">
                                    {/* POINTER */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8">
                                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-600 filter drop-shadow-lg"></div>
                                    </div>

                                    {/* WHEEL */}
                                    <div
                                        className="w-full h-full rounded-full border-[8px] border-gray-900 shadow-xl overflow-hidden relative bg-white"
                                        style={{
                                            transform: `rotate(${rotation}deg)`,
                                            transition: 'transform 5s cubic-bezier(0.075, 0.82, 0.165, 1)'
                                        }}
                                    >
                                        {SEGMENTS.map((seg, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-full h-full text-center pt-8"
                                                style={{
                                                    backgroundColor: seg.color,
                                                    transform: `rotate(${i * (360 / SEGMENTS.length)}deg)`,
                                                    clipPath: 'polygon(0 0, 50% 50%, 100% 0)' // Approximation for 4 segments, actually needs proper conic gradient or svg
                                                }}
                                            />
                                        ))}
                                        {/* Since CSS clips are hard for dynamic segments, let's use Conic Gradient for background and just place text labels */}
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(
                                                    ${SEGMENTS[0].color} 0deg 90deg,
                                                    ${SEGMENTS[1].color} 90deg 180deg,
                                                    ${SEGMENTS[2].color} 180deg 270deg,
                                                    ${SEGMENTS[3].color} 270deg 360deg
                                                )`
                                            }}
                                        />

                                        {/* LABELS */}
                                        {SEGMENTS.map((seg, i) => (
                                            <div
                                                key={i}
                                                className="absolute top-1/2 left-1/2 w-full h-full origin-top-left flex justify-center pt-4"
                                                style={{
                                                    transform: `rotate(${i * 90 + 45}deg) translateY(-50%)`
                                                }}
                                            >
                                                <span className="text-white font-bold text-sm drop-shadow-md -rotate-45 block mt-8">
                                                    {seg.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CENTER CAP */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow border-4 border-gray-200 z-10 flex items-center justify-center">
                                        <Gift size={20} className="text-red-500" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSpin}
                                    disabled={isSpinning}
                                    className="w-full bg-[var(--tg-theme-button-color)] text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                                >
                                    {isSpinning ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                    {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
                                </button>
                            </>
                        ) : (
                            // RESULT VIEW
                            <div className="text-center w-full">
                                <div className="mb-4 inline-flex items-center justify-center p-4 bg-green-100 rounded-full text-green-600 animate-bounce">
                                    <Gift size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">
                                    {result.prizeIndex === 0 ? "Oh no!" : "YOU WON!"}
                                </h3>
                                <p className="text-gray-500 mb-6">{result.message}</p>

                                {result.code && (
                                    <div className="bg-gray-100 p-4 rounded-xl border border-dashed border-gray-300 mb-6">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Code</div>
                                        <div className="text-3xl font-mono font-bold text-[var(--tg-theme-button-color)] select-all">
                                            {result.code}
                                        </div>
                                    </div>
                                )}

                                {result.prizeIndex === 0 ? (
                                    <button onClick={handleClose} className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-xl">
                                        Close
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCopy}
                                        className="w-full bg-[var(--tg-theme-button-color)] text-white font-bold py-3 rounded-xl shadow-lg active:scale-95"
                                    >
                                        Copy & Shop
                                    </button>
                                )}
                            </div>
                        )}

                        {!result && (
                            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SpinWheel;
