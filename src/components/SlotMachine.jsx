
import React, { useState } from 'react';
import useStore from '../store/useStore';

const ICONS = ['🍎', '🍋', '🍒', '💎', '7️⃣', '🔔'];
const WIN_PRIZE = { type: 'coupon', value: '50% OFF', code: 'JACKPOT50' };

const SlotMachine = ({ onClose }) => {
    const [reels, setReels] = useState([0, 0, 0]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [win, setWin] = useState(false);
    const [message, setMessage] = useState("Spin to Win!");

    const tele = window.Telegram?.WebApp;

    const spin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setWin(false);
        setMessage("Spinning...");

        try {
            const apiPromise = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/slots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                }
            }).then(res => res.json());

            const rollingTimer = setInterval(() => {
                setReels(prev => prev.map(() => Math.floor(Math.random() * ICONS.length)));
            }, 100);

            const data = await apiPromise;

            clearInterval(rollingTimer);

            if (!data.success) {
                setIsSpinning(false);
                setMessage(data.message || "Error occurred");
                return;
            }

            setReels(data.reels);

            if (data.isWin) {
                setWin(true);
                setMessage("YOU WON!");
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

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', color: 'white' }}>
            <div>
                <button onClick={onClose}>Close</button>
                <h2>LUCKY SLOTS</h2>
                <p>{message}</p>

                <div>
                    {reels.map((iconIndex, i) => (
                        <span key={i} style={{ fontSize: 40, margin: 10 }}>
                            {ICONS[iconIndex]}
                        </span>
                    ))}
                </div>

                {win && (
                    <div>
                        <div>Prize Unlocked</div>
                        <div>{WIN_PRIZE.value}</div>
                        <div>{WIN_PRIZE.code}</div>
                    </div>
                )}

                <button onClick={spin} disabled={isSpinning || win}>
                    {win ? "CLAIMED" : isSpinning ? "SPINNING..." : "SPIN NOW"}
                </button>
            </div>
        </div>
    );
};

export default SlotMachine;
