
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';

const ICONS = ['🍎', '🍋', '🍒', '💎', '7️⃣', '🔔'];
const WIN_PRIZE = { type: 'coupon', value: '50% OFF', code: 'JACKPOT50' };

const SlotMachine = ({ onClose }) => {
    const [reels, setReels] = useState([0, 0, 0]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [win, setWin] = useState(false);
    const [message, setMessage] = useState("Spin to Win!");

    const fetchUserData = useStore(state => state.fetchUserData);
    const tele = window.Telegram?.WebApp;

    const spin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setWin(false);
        setMessage("Spinning...");

        try {
            // Start Visual Spark (min spin time)
            const minDurationPromise = new Promise(resolve => setTimeout(resolve, 2000));

            // Backend Call
            const apiPromise = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/slots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                }
            }).then(res => res.json());

            // Rolling Animation Interval
            const interval = 100;
            const rollingTimer = setInterval(() => {
                setReels(prev => prev.map(() => Math.floor(Math.random() * ICONS.length)));
            }, interval);

            const [_, data] = await Promise.all([minDurationPromise, apiPromise]);

            clearInterval(rollingTimer);

            if (!data.success) {
                // Cooldown or Error
                setIsSpinning(false);
                setMessage(data.message || "Error occurred");
                return;
            }

            // Finish Spin with Result
            setReels(data.reels);

            if (data.isWin) {
                setWin(true);
                setMessage("YOU WON!");
                triggerConfetti();
                // If it was a point/balance reward, we'd sync here:
                // await fetchUserData();
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
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-b from-purple-800 to-purple-900 border-4 border-yellow-500 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white/50 hover:text-white bg-black/20 rounded-full p-1"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">
                        LUCKY SLOTS
                    </h2>
                    <p className="text-purple-200 text-sm font-medium">{message}</p>
                </div>

                {/* Reels Container */}
                <div className="flex justify-center gap-2 mb-8 bg-black/40 p-4 rounded-xl border border-white/10 shadow-inner">
                    {reels.map((iconIndex, i) => (
                        <div key={i} className="w-20 h-24 bg-white rounded-lg flex items-center justify-center text-5xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] border-b-4 border-gray-300">
                            <span className={isSpinning ? 'animate-pulse blur-[1px]' : ''}>
                                {ICONS[iconIndex]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Win Display */}
                {win && (
                    <div className="bg-yellow-400 text-purple-900 p-3 rounded-xl text-center mb-6 font-bold animate-bounce shadow-lg">
                        <div className="text-xs uppercase tracking-widest opacity-70">Prize Unlocked</div>
                        <div className="text-2xl">{WIN_PRIZE.value}</div>
                        <div className="font-mono text-sm bg-purple-900 text-white inline-block px-2 py-0.5 rounded mt-1 select-all">
                            {WIN_PRIZE.code}
                        </div>
                    </div>
                )}

                {/* Spin Button */}
                <button
                    onClick={spin}
                    disabled={isSpinning || win}
                    className="w-full bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-xl py-4 rounded-2xl shadow-[0_6px_0_#991b1b] active:shadow-[0_2px_0_#991b1b] active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    <span className="relative z-10">{win ? "CLAIMED" : isSpinning ? "SPINNING..." : "SPIN NOW"}</span>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                </button>

            </div>
        </div>
    );
};

export default SlotMachine;
