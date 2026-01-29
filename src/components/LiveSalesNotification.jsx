import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const LOCATIONS = [
    "Bole", "Piassa", "Gerji", "Megenagna", "Sarbet", "4 Kilo", "Lebu", "Mexico", "CMC", "Ayat"
];

const ACTIONS = [
    "just purchased", "ordered", "bought", "snagged"
];

const LiveSalesNotification = ({ products }) => {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!products || products.length === 0) return;

        // Random interval between 15s and 45s
        const scheduleNext = () => {
            const delay = 15000 + Math.floor(Math.random() * 30000);
            return setTimeout(() => {
                showNotification();
            }, delay);
        };

        let timerId = scheduleNext();

        const showNotification = () => {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            const randomUser = "User " + Math.floor(1000 + Math.random() * 9000); // e.g. User 4521

            setNotification({
                product: randomProduct,
                message: `Someone in ${randomLocation} ${randomAction} ${randomProduct.title.substring(0, 20)}...`,
                user: randomUser
            });

            // Auto hide after 5 seconds
            setTimeout(() => {
                setNotification(null);
                timerId = scheduleNext();
            }, 5000);
        };

        return () => clearTimeout(timerId);
    }, [products]);


    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm"
                >
                    <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 flex items-center gap-3 pr-8 relative overflow-hidden">

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>

                        <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {notification.product.images?.[0] ? (
                                <img src={notification.product.images[0]} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <ShoppingBag className="p-2 text-gray-400" />
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-900 line-clamp-1">{notification.user}</p>
                            <p className="text-[11px] text-gray-600 leading-tight line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-[9px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Just now
                            </p>
                        </div>

                        <button
                            onClick={() => setNotification(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 bg-transparent"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LiveSalesNotification;
