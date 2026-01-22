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
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="px-3 pt-2 pb-4">
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-sm">
                {SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-center px-6 ${slide.bg} ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-90 ${slide.text}`}>{slide.subtitle}</span>
                        <h2 className={`text-2xl font-bold mb-3 ${slide.text}`}>{slide.title}</h2>
                        <button
                            onClick={() => onNavigate && onNavigate(slide.category)}
                            className="flex items-center gap-1 text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full w-fit hover:bg-opacity-90 transition-all active:scale-95"
                        >
                            Shop Now <ArrowRight size={14} />
                        </button>
                    </div>
                ))}

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === current ? 'bg-white w-3' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
