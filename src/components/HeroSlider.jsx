import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        title: "Summer Collection",
        subtitle: "Up to 50% Off",
        bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
        text: "text-white",
        category: "Men"
    },
    {
        id: 2,
        title: "New Arrivals",
        subtitle: "Check out the latest trends",
        bg: "bg-gradient-to-r from-purple-500 to-pink-500",
        text: "text-white",
        category: "Women"
    },
    {
        id: 3,
        title: "Tech Gadgets",
        subtitle: "Upgrade your gear today",
        bg: "bg-gradient-to-r from-emerald-500 to-teal-400",
        text: "text-white",
        category: "Electronics"
    }
];

const HeroSlider = ({ onNavigate }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="px-3 pt-2 pb-4">
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-sm">
                <div
                    key={current}
                    className={`absolute inset-0 flex flex-col justify-center px-6 ${SLIDES[current].bg}`}
                >
                    <span
                        className={`text-xs font-bold uppercase tracking-wider mb-1 ${SLIDES[current].text}`}
                    >
                        {SLIDES[current].subtitle}
                    </span>
                    <h2
                        className={`text-2xl font-bold mb-3 ${SLIDES[current].text}`}
                    >
                        {SLIDES[current].title}
                    </h2>
                    <button
                        onClick={() => onNavigate && onNavigate(SLIDES[current].category)}
                        className="flex items-center gap-1 text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full w-fit hover:bg-opacity-90 transition-all active:scale-95"
                    >
                        Shop Now <ArrowRight size={14} />
                    </button>
                </div>

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${idx === current ? 'bg-white w-3' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            );
};
            export default HeroSlider;
