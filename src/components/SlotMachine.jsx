import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Square } from 'lucide-react';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';

const ICONS = ['🔥', '💎', '7️⃣', '🎁', '⚡', '💰'];

const SlotMachine = ({ onClose }) => {
    const [reels, setReels] = useState([0, 0, 0]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [win, setWin] = useState(false);
    const [message, setMessage] = useState("SPIN TO WIN!");
    const { settings } = useStore();

    // Refs to handle spinning interval and data
    const intervalRef = useRef(null);
    const resultRef = useRef(null);

    const tele = window.Telegram?.WebApp;

    // Cleanup on unmount
    useEffect(() => {
        return () => stopSpinningVisuals();
    }, []);

    const startSpin = async () => {
        if (isSpinning) return;

        // Reset state
        setIsSpinning(true);
        setWin(false);
        setMessage("GOOD LUCK!");
        resultRef.current = null;

        // Start Visuals
        intervalRef.current = setInterval(() => {
            setReels(prev => prev.map(() => Math.floor(Math.random() * ICONS.length)));
        }, 80);

        try {
            const startTime = Date.now();
            const MIN_SPIN_DURATION = 2000; // Force at least 2 seconds of suspense

            // Fetch result in background
            const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/slots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                }
            });
            const data = await apiRes.json();

            resultRef.current = data;

            // Wait for remaining time if needed
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_SPIN_DURATION) {
                await new Promise(r => setTimeout(r, MIN_SPIN_DURATION - elapsed));
            }

            finalizeSpin();

        } catch (e) {
            console.error("Slots Error:", e);
            setMessage("Network Error");
            stopSpinningVisuals();
            setIsSpinning(false);
        }
    };

    const finalizeSpin = () => {
        const data = resultRef.current;
        stopSpinningVisuals();

        if (!data || !data.success) {
            setMessage(data?.message || "Error");
            setIsSpinning(false);
            return;
        }

        // Set final reels
        setReels(data.reels);
        setIsSpinning(false);

        if (data.isWin) {
            setWin(true);
            setMessage("JACKPOT!");
            triggerConfetti();
        } else {
            setMessage("Try Again");
        }
    };

    const stopSpinningVisuals = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fb7701', '#ffd700', '#ffffff', '#e60023']
        });
    };

    const prizeLabel = settings?.slots_prize_label || '90% OFF';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
            {/* Main Machine Container */}
            <div className="bg-[#fb7701] rounded-[2rem] p-4 w-full max-w-sm shadow-2xl relative border-[6px] border-[#fb7701] ring-4 ring-white/50">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white text-gray-500 rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform z-20"
                >
                    <X size={20} />
                </button>

                {/* Inner Bezel (Red Top) */}
                <div className="bg-[#e60023] rounded-t-[1.5rem] rounded-b-xl p-4 pb-8 relative overflow-hidden shadow-inner">

                    {/* Header Text */}
                    <div className="text-center relative z-10 mb-2">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-md transform -rotate-2">
                            SUPER SPIN
                        </h2>
                        <div className="bg-white/20 inline-block px-3 py-0.5 rounded-full mt-1">
                            <p className="text-white text-xs font-bold tracking-widest uppercase">{message}</p>
                        </div>
                    </div>

                    {/* Reels Container */}
                    <div className="flex justify-center gap-1.5 bg-white p-2 rounded-xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)] border-b-4 border-gray-200">
                        {reels.map((iconIndex, i) => (
                            <div key={i} className="w-20 h-24 bg-gradient-to-b from-gray-50 to-white rounded-lg flex items-center justify-center text-5xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <span className={`transform transition-all ${isSpinning ? 'blur-[1px] scale-110' : 'scale-100'}`}>
                                    {ICONS[iconIndex]}
                                </span>
                                {/* Glossy Reflection */}
                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/80 to-transparent pointer-events-none"></div>
                            </div>
                        ))}
                    </div>

                    {/* Decorative Bulbs */}
                    <div className="flex justify-between mt-3 px-4">
                        <div className={`w-3 h-3 rounded-full ${isSpinning ? 'bg-yellow-300 animate-ping' : 'bg-yellow-600'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${isSpinning ? 'bg-yellow-300 animate-ping delay-75' : 'bg-yellow-600'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${isSpinning ? 'bg-yellow-300 animate-ping delay-150' : 'bg-yellow-600'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${isSpinning ? 'bg-yellow-300 animate-ping delay-200' : 'bg-yellow-600'}`}></div>
                    </div>
                </div>

                {/* Bottom Control Panel */}
                <div className="bg-[#fb7701] pt-6 pb-2 px-2 relative -mt-4 rounded-b-[1.5rem]">

                    {/* Win Card */}
                    {win && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#e60023] px-6 py-3 rounded-xl shadow-xl text-center min-w-[200px] border-4 border-yellow-400 rotate-1 animate-bounce z-20">
                            <p className="text-xs font-bold uppercase text-gray-400">You Won</p>
                            <p className="text-2xl font-black leading-none">{prizeLabel}</p>
                        </div>
                    )}

                    {/* Spin Button */}
                    <button
                        onClick={startSpin}
                        disabled={win || isSpinning}
                        className={`w-full group relative overflow-hidden rounded-2xl p-4 transition-all active:scale-[0.98] shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1.5 
                            ${win ? 'bg-gray-400 cursor-default' :
                                isSpinning ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 opacity-90' : 'bg-gradient-to-b from-yellow-400 to-yellow-500'}`}
                    >
                        <div className="relative z-10 flex flex-col items-center justify-center">
                            {isSpinning ? (
                                <>
                                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-1"></div>
                                    <span className="text-white font-black text-xl tracking-widest uppercase">SPINNING...</span>
                                </>
                            ) : win ? (
                                <span className="text-white font-black text-xl tracking-widest uppercase">CLAIMED</span>
                            ) : (
                                <>
                                    <span className="text-[#e60023] font-black text-2xl tracking-widest uppercase drop-shadow-sm">SPIN</span>
                                </>
                            )}
                        </div>

                        {/* Shimmer */}
                        {!isSpinning && !win && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full group-hover:animate-[shimmer_0.8s_infinite]"></div>
                        )}
                    </button>

                    <p className="text-center text-white/60 text-[10px] mt-3 font-medium">
                        Guaranteed win today!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SlotMachine;
