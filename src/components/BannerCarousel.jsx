import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        title: "Latest Laptops & Phones",
        subtitle: "Deals on Samsung, HP, and more",
        bg: "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]",
        textColor: "text-white",
        buttonColor: "bg-[#D4AF37] text-[#111827]",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Computer Accessories",
        subtitle: "Keyboards, Drives & Joysticks",
        bg: "bg-gradient-to-r from-[#374151] to-[#4b5563]",
        textColor: "text-white",
        buttonColor: "bg-white text-[#1f2937]",
        image: "https://images.unsplash.com/photo-1587829741301-308231c8dbdd?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "We Buy & Sell",
        subtitle: "Trade in your used laptops for cash",
        bg: "bg-gradient-to-r from-[#054D3B] to-[#047857]",
        textColor: "text-white",
        buttonColor: "bg-[#D4AF37] text-[#111827]",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop"
    }
];

const BannerCarousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[180px] sm:h-[220px] overflow-hidden rounded-xl shadow-lg mt-4 mb-6 mx-auto max-w-[95%]">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 bg-black/40 z-10"></div>
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-10">
                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-90 ${slide.textColor} bg-black/20 w-fit px-2 py-0.5 rounded`}>
                            {index === 1 ? 'Limited Time' : 'Featured'}
                        </span>
                        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-1 leading-tight ${slide.textColor} drop-shadow-md`}>
                            {slide.title}
                        </h2>
                        <p className={`text-sm sm:text-base mb-4 opacity-90 font-medium ${slide.textColor} drop-shadow-sm`}>
                            {slide.subtitle}
                        </p>
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 w-fit ${slide.buttonColor}`}>
                            Shop Now <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
