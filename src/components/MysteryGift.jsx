import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';

const MysteryGift = () => {
    const { settings } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        if (settings.mystery_gift_enabled === false) return;
        const lastClaimed = localStorage.getItem('mystery_gift_claimed_date');
        const today = new Date().toDateString();

        if (lastClaimed !== today) {
            const tm = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(tm);
        }
    }, [settings.mystery_gift_enabled]);

    const handleOpen = () => {
        setIsOpen(true);
        let rewards = [
            { type: 'coupon', value: '10% OFF', code: 'LUCKY10' },
            { type: 'shipping', value: 'Free Shipping', code: 'SHIPFREE' },
            { type: 'points', value: '50 Points', code: 'BONUS50' }
        ];

        if (settings.mystery_gift_pool) {
            try {
                const pool = typeof settings.mystery_gift_pool === 'string'
                    ? JSON.parse(settings.mystery_gift_pool)
                    : settings.mystery_gift_pool;
                if (Array.isArray(pool) && pool.length > 0) {
                    rewards = pool;
                }
            } catch (e) {
                console.error("Invalid Mystery Gift Pool setting:", e);
            }
        }
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        setReward(randomReward);
        localStorage.setItem('mystery_gift_claimed_date', new Date().toDateString());
    };

    const handleClose = () => {
        setIsVisible(false);
        setIsOpen(false);
    };

    if (settings.mystery_gift_enabled === false) return null;

    if (isVisible && !isOpen) {
        return (
            <div onClick={handleOpen} style={{ position: 'fixed', bottom: 20, right: 20 }}>
                <button>🎁 Free Gift!</button>
            </div>
        );
    }

    if (isOpen) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', color: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'white', padding: 20 }}>
                    <h2>CONGRATS!</h2>
                    <p>You've unlocked a mystery reward!</p>
                    <div>
                        <p>{reward?.value}</p>
                        <p>{reward?.code}</p>
                    </div>
                    <button onClick={handleClose}>Claim Reward</button>
                </div>
            </div>
        );
    }

    return null;
};

export default MysteryGift;
