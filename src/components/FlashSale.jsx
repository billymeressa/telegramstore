import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const FlashSale = ({ products }) => {
    const [timeLeft, setTimeLeft] = useState(10000); // Start with roughly 2h 46m in seconds

    useEffect(() => {
        // Determine end time. For demo, we set it to end at end of today or fixed duration from now.
        // Let's do a fixed countdown that resets every 3 hours for engagement illusion.
        const now = new Date();
        const cycle = 3 * 60 * 60 * 1000; // 3 hours in ms
        const elapsed = now.getTime() % cycle;
        const remaining = cycle - elapsed;

        setTimeLeft(Math.floor(remaining / 1000));

        const interval = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : cycle / 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Filter or select some items for flash sale
    const saleItems = products.slice(0, 5); // Just grab first 5 logic for now

    if (saleItems.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Header with Timer */}
            <div className="flex items-center justify-between px-4 mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 italic flex items-center gap-1">
                        <Zap className="text-yellow-500 fill-yellow-500" size={20} />
                        FLASH SALE
                    </h2>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2 py-1 rounded-md font-mono text-sm font-bold">
                    <Clock size={14} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Horizontal Scroll List */}
            <div className="flex overflow-x-auto gap-3 px-4 pb-2 hide-scrollbar snap-x snap-mandatory">
                {saleItems.map((product, idx) => (
                    <Link
                        key={product.id || idx}
                        to={`/product/${product.id}`}
                        className="min-w-[140px] w-[140px] snap-start"
                    >
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                        >
                            <div className="relative aspect-square">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    -30%
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-red-600 font-bold text-sm">
                                        ${((product.price || 0) * 0.7).toFixed(2)}
                                    </span>
                                    <span className="text-gray-400 text-xs line-through">
                                        ${product.price}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500"
                                        style={{ width: `${60 + (idx * 5)}%` }} // Fake stock progress
                                    ></div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {5 + idx} items left
                                </p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FlashSale;
