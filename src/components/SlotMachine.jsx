import React, { useState, useEffect, useRef } from 'react';
import { Trophy, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';

const ICONS = ['🍎', '🍋', '🍒', '💎', '7️⃣', '🔔'];

const SlotMachine = ({ onClose }) => {
    const [reels, setReels] = useState([0, 0, 0]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [win, setWin] = useState(false);
    const [message, setMessage] = useState("Spin to Win!");
    const { settings } = useStore();

    const tele = window.Telegram?.WebApp;

    const spin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setWin(false);
        setMessage("Spinning...");

        try {
            // Visual spin start
            const spinDuration = 2000;
            const intervalTime = 100;
            const startTime = Date.now();

            const rollingTimer = setInterval(() => {
                setReels(prev => prev.map(() => Math.floor(Math.random() * ICONS.length)));
            }, intervalTime);

            // Fetch result in background
            const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/slots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                }
            });
            const data = await apiRes.json();

            // Ensure we spin for at least spinDuration
            const elapsed = Date.now() - startTime;
            if (elapsed < spinDuration) {
                await new Promise(r => setTimeout(r, spinDuration - elapsed));
            }

            clearInterval(rollingTimer);

            if (!data.success) {
                setIsSpinning(false);
                setMessage(data.message || "Error occurred");
                return;
            }

            // Set final reels
            setReels(data.reels);

            if (data.isWin) {
                setWin(true);
                setMessage("YOU WON!");
                triggerConfetti();
            } else {
                setMessage("Try Again!");
            }

        } catch (e) {
            console.error("Slots Error:", e);
            setMessage("Network Error");
        } finally {
            setIsSpinning(false);
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fb7701', '#ffd700', '#ffffff']
        });
    };

    const prizeLabel = settings?.slots_prize_label || '50% OFF';
    const prizeCode = settings?.slots_prize_code || 'JACKPOT50';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-b from-purple-900 to-indigo-900 border-4 border-yellow-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">

                {/* Decorative Lights */}
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_yellow]"></div>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_yellow] delay-75"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_yellow] delay-150"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_yellow] delay-200"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white/50 hover:text-white bg-black/20 rounded-full p-2 mt-1 mr-1 z-10"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-6 mt-4">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">
                        LUCKY SPIN
                    </h2>
                    <p className="text-purple-200 text-sm font-medium mt-1">{message}</p>
                </div>

                {/* Reels Container */}
                <div className="flex justify-center gap-2 mb-8 bg-black/40 p-4 rounded-xl border border-white/10 shadow-inner ring-4 ring-purple-800">
                    {reels.map((iconIndex, i) => (
                        <div key={i} className="w-20 h-24 bg-gradient-to-b from-white to-gray-200 rounded-lg flex items-center justify-center text-5xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] border-b-4 border-gray-300 relative overflow-hidden">
                            <span className={isSpinning ? 'animate-bounce blur-[2px]' : ''}>
                                {ICONS[iconIndex]}
                            </span>
                            {/* Glass reflection */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Win Display */}
                {win && (
                    <div className="bg-yellow-400 text-purple-900 p-4 rounded-xl text-center mb-6 font-bold animate-bounce shadow-[0_0_20px_rgba(250,204,21,0.6)] border-2 border-white">
                        <div className="text-xs uppercase tracking-widest opacity-80 mb-1">Prize Unlocked</div>
                        <div className="text-3xl font-black text-[#fb7701] drop-shadow-sm">{prizeLabel}</div>
                        <div className="font-mono text-sm bg-purple-900 text-white inline-block px-3 py-1 rounded mt-2 select-all border border-purple-500">
                            {prizeCode}
                        </div>
                    </div>
                )}

                {/* Spin Button */}
                <button
                    onClick={spin}
                    disabled={isSpinning || win}
                    className={`w-full bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-2xl py-5 rounded-2xl shadow-[0_6px_0_#991b1b] active:shadow-[0_2px_0_#991b1b] active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden ring-4 ring-red-900 ${win ? 'grayscale' : ''}`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {win ? "CLAIMED" : isSpinning ? "SPINNING..." : <><Zap fill="white" /> SPIN NOW</>}
                    </span>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                </button>

                <div className="text-center mt-4">
                    <p className="text-[10px] text-purple-300/50">Terms & conditions apply. Daily limit: 1 spin.</p>
                </div>
            </div>
        </div>
    );
};

export default SlotMachine;
