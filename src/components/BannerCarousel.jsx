import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const BannerCarousel = ({ banners = [] }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isDragging, setIsDragging] = useState(false);

    // Fallback if no banners provided
    const items = banners.length > 0 ? banners : [
        {
            title: "Super Flash Sale",
            description: "Up to 70% off on electronics & fashion.",
            buttonText: "Shop Now",
            gradient: "from-primary to-orange-400",
            image: null
        },
        {
            title: "New Arrivals",
            description: "Check out the latest summer collection.",
            buttonText: "View Collection",
            gradient: "from-blue-500 to-indigo-600",
            image: null
        },
        {
            title: "Member Exclusive",
            description: "Extra 10% off for recurring customers!",
            buttonText: "Join Now",
            gradient: "from-purple-500 to-pink-500",
            image: null
        }
    ];

    // We cycle through the items based on the 'page' index (infinite loop logic)
    const imageIndex = Math.abs(page % items.length);

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    // Auto-play
    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(() => {
            if (!isDragging) paginate(1);
        }, 5000);
        return () => clearInterval(interval);
    }, [page, isDragging, items.length]);

    // Animation Variants
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 1
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="relative w-full overflow-hidden rounded-xl h-40 shadow-sm mx-auto group">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(e, { offset, velocity }) => {
                        setIsDragging(false);
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                    }}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-r flex items-center px-6 ${items[imageIndex].gradient || 'from-primary to-blue-500'
                        }`}
                    style={
                        items[imageIndex].image
                            ? { backgroundImage: `url(${items[imageIndex].image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : {}
                    }
                >
                    {/* Overlay for readability if image exists */}
                    {items[imageIndex].image && (
                        <div className="absolute inset-0 bg-black/40 z-0"></div>
                    )}

                    <div className="text-white z-10 w-2/3 relative pointer-events-none select-none">
                        <h2 className="text-xl font-bold mb-1 leading-tight">{items[imageIndex].title}</h2>
                        <p className="text-xs opacity-90 mb-3">{items[imageIndex].description}</p>
                        <button className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {items[imageIndex].buttonText || "Shop Now"}
                        </button>
                    </div>

                    {/* Decorative Elements */}
                    {!items[imageIndex].image && (
                        <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            {items.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage([page + (idx - imageIndex), idx - imageIndex])}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === imageIndex ? 'bg-white w-3' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Arrows (Hidden on mobile usually, but good for desktop testing) */}
            <button className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hidden group-hover:block z-20" onClick={() => paginate(-1)}>
                <ChevronLeft size={24} />
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hidden group-hover:block z-20" onClick={() => paginate(1)}>
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

export default BannerCarousel;
