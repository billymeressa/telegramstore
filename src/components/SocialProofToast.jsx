import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../store/useStore';

const LOCATIONS = [
    "Bole", "Piassa", "Gerji", "Megenagna", "Sarbet", "4 Kilo", "Lebu", "Mexico", "CMC", "Ayat"
];

const ACTIONS = [
    "just purchased", "ordered", "bought", "snagged"
];

const SocialProofToast = ({ products }) => {
    const [notification, setNotification] = useState(null);
    const { notificationSettings } = useStore();
    // Default to defaults if not yet loaded
    const { enabled, frequency, showSpinWins, showPurchases } = notificationSettings || {
        enabled: true, frequency: 300, showSpinWins: true, showPurchases: true
    };

    useEffect(() => {
        if (!enabled) return;

        let timerId;

        const showNotification = () => {
            // Determine eligible types
            const types = [];
            if (showSpinWins) types.push('spin_win');
            if (showPurchases && products && products.length > 0) types.push('purchase');

            if (types.length === 0) return;

            const selectedType = types[Math.floor(Math.random() * types.length)];
            const randomUser = "@" + generateRandomUser();

            if (selectedType === 'spin_win') {
                const winAmount = [100, 250, 500, 1000][Math.floor(Math.random() * 4)];
                setNotification({
                    type: 'spin_win',
                    icon: <Trophy className="p-2 text-yellow-600" />,
                    title: "Daily Spin Winner!",
                    message: `User ${randomUser} just won ${winAmount} ETB on the Daily Spin!`,
                    user: randomUser
                });
            } else {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
                const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

                setNotification({
                    type: 'purchase',
                    icon: randomProduct.images?.[0] ? (
                        <img src={randomProduct.images[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <ShoppingBag className="p-2 text-gray-400" />
                    ),
                    title: "New Purchase",
                    message: `User ${randomUser} from ${randomLocation} ${randomAction} ${randomProduct.title.substring(0, 20)}...`,
                    user: randomUser
                });
            }

            // Auto hide after 5 seconds
            setTimeout(() => {
                setNotification(null);
                scheduleNext();
            }, 5000);
        };

        const scheduleNext = () => {
            // Add slight randomness (±10%) to feel natural
            const baseDelay = frequency * 1000;
            const variance = (Math.random() * 0.2 - 0.1) * baseDelay;
            const delay = baseDelay + variance;

            timerId = setTimeout(showNotification, delay);
        };

        // Start the loop
        // Initial delay: If strictly 5 mins, maybe wait 5 mins. 
        // But usually "social proof" should appear shortly after landing.
        // Let's do a quick one after 10s, then follow frequency.
        timerId = setTimeout(showNotification, 10000);

        return () => clearTimeout(timerId);
    }, [products, enabled, frequency, showSpinWins, showPurchases]);

    const generateRandomUser = () => {
        const names = ["Abel", "Bili", "Sara", "John", "Mika", "Beth", "Dan", "Ezra", "Hana", "Kaleb"];
        const name = names[Math.floor(Math.random() * names.length)];
        return name + "***";
    }

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm"
                >
                    <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 flex items-center gap-3 pr-8 relative overflow-hidden">

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>

                        <div className={`relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center ${notification.type === 'spin_win' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            {notification.icon}
                        </div>

                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">
                                {notification.title}
                            </p>
                            <p className="text-xs font-medium text-gray-800 leading-tight line-clamp-2">
                                {notification.message}
                            </p>
                        </div>

                        <button
                            onClick={() => setNotification(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 bg-transparent"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SocialProofToast;
