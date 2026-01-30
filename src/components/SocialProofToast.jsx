import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const LOCATIONS = [
    "Bole", "Piassa", "Gerji", "Megenagna", "Sarbet", "4 Kilo", "Lebu", "Mexico", "CMC", "Ayat"
];

const ACTIONS = [
    "just purchased", "ordered", "bought", "snagged"
];

const SocialProofToast = ({ products }) => {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Schedule next toast
        const scheduleNext = () => {
            // Random interval between 4 to 6 minutes (240000ms - 360000ms)
            // For testing/demo purposes, we might want this faster, but adhering to "every 5 minutes" request
            // let's aim for ~5 mins. 
            const delay = 300000 + (Math.random() * 60000 - 30000); // 5 mins +/- 30s
            return setTimeout(() => {
                showNotification();
            }, delay);
        };

        // Initial delay triggers quickly first time? Or wait full 5 mins?
        // Let's do a shorter initial delay so the user sees it at least once shortly after session start
        let timerId = setTimeout(() => showNotification(), 30000); // First one after 30s

        const showNotification = () => {
            const isSpinWin = Math.random() > 0.5; // 50% chance of Spin Win vs Product Sale
            const randomUser = "@" + generateRandomUser();

            if (isSpinWin) {
                const winAmount = [100, 250, 500, 1000][Math.floor(Math.random() * 4)];
                setNotification({
                    type: 'spin_win',
                    icon: <Trophy className="p-2 text-yellow-600" />,
                    title: "Daily Spin Winner!",
                    message: `User ${randomUser} just won ${winAmount} ETB on the Daily Spin!`,
                    user: randomUser
                });
            } else {
                if (!products || products.length === 0) return;
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
                timerId = scheduleNext();
            }, 5000);
        };

        return () => clearTimeout(timerId);
    }, [products]);

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
