import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const BannerCarousel = ({ banners = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fallback to default if no banners provided
    const items = banners.length > 0 ? banners : [
        {
            title: "Super Flash Sale",
            description: "Up to 70% off on electronics & fashion.",
            buttonText: "Shop Now",
            gradient: "from-primary to-orange-400",
            image: null
        }
    ];

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    // Auto-play
    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(nextSlide, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, [items.length]);

    // Swipe handlers
    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="relative w-full overflow-hidden rounded-xl h-40 shadow-sm mx-auto">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            nextSlide();
                        } else if (swipe > swipeConfidenceThreshold) {
                            prevSlide();
                        }
                    }}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-r flex items-center px-6 ${items[currentIndex].gradient || 'from-primary to-blue-500'
                        }`}
                    style={
                        items[currentIndex].image
                            ? { backgroundImage: `url(${items[currentIndex].image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : {}
                    }
                >
                    {/* Overlay for readability if image exists */}
                    {items[currentIndex].image && (
                        <div className="absolute inset-0 bg-black/40 z-0"></div>
                    )}

                    <div className="text-white z-10 w-2/3 relative">
                        <h2 className="text-xl font-bold mb-1 leading-tight">{items[currentIndex].title}</h2>
                        <p className="text-xs opacity-90 mb-3">{items[currentIndex].description}</p>
                        <button className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform">
                            {items[currentIndex].buttonText || "Shop Now"}
                        </button>
                    </div>

                    {/* Decorative Elements (only if no image) */}
                    {!items[currentIndex].image && (
                        <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            {items.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerCarousel;
