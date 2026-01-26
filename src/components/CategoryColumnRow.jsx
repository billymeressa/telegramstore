import React from 'react';
import { Shirt, ShoppingBag, Baby, Smartphone, Home, Sparkles, Dumbbell, Book, Package, Laptop, Headphones, HardDrive, Keyboard, Gamepad2, Wifi, Zap, Mouse, Plug, Watch, Footprints, Glasses, Activity } from 'lucide-react';

const CATEGORY_ICONS = {
    'Men': Shirt,
    'Women': ShoppingBag,
    'Kids': Baby,
    'Electronics': Smartphone,
    'Home': Home,
    'Beauty': Sparkles,
    'Sports': Dumbbell,
    'Books': Book,
    'Other': Package,
    // Subcategories
    'Phones': Smartphone,
    'Laptops': Laptop,
    'Audio': Headphones,
    'Storage': HardDrive,
    'Hard Drives': HardDrive,
    'Computer Accessories': Keyboard,
    'Keyboards': Keyboard,
    'Mice': Mouse,
    'Gaming': Gamepad2,
    'Networking': Wifi,
    'Smart Home': Zap,
    'Cables & Adapters': Plug,
    'Shoes': Footprints,
    'Dresses': ShoppingBag,
    'Tops': Shirt,
    'Pants': Activity, // Placeholder if no better icon
    'Jeans': Activity,
    'Watches': Watch,
    'Accessories': Glasses,
    'Jewelry': Sparkles,
    'Bags': ShoppingBag,
    'Activewear': Activity,
};

const COLORS = [
    'from-blue-500 to-blue-600',
    'from-pink-500 to-rose-500',
    'from-orange-400 to-amber-500',
    'from-purple-500 to-indigo-600',
    'from-emerald-400 to-teal-500',
    'from-red-400 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-slate-500 to-gray-600'
];

const CategoryColumnRow = ({ categories, onSelect }) => {
    // Infinite Scroll Logic
    const scrollRef = React.useRef(null);

    // Create 3 sets for seamless looping
    const loopedCategories = React.useMemo(() => {
        if (!categories || categories.length === 0) return [];
        // Only loop if we have enough items to necessitate scrolling
        if (categories.length < 5) return categories;
        return [...categories, ...categories, ...categories, ...categories]; // 4x to be safe
    }, [categories]);

    // Handle Scroll Loop
    const handleScroll = (e) => {
        const container = e.target;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;

        // If simply repeating list 4 times, single set is 1/4
        const singleSetWidth = scrollWidth / 4;

        // If near start, jump to middle
        if (scrollLeft < 50) {
            container.scrollLeft += singleSetWidth * 2;
        }
        // If near end, jump back to middle
        else if (scrollLeft + clientWidth > scrollWidth - 50) {
            container.scrollLeft -= singleSetWidth * 2;
        }
    };

    // Initialize Scroll Position and Auto-Spin Animation
    React.useLayoutEffect(() => {
        if (scrollRef.current && loopedCategories.length > categories.length) {
            const container = scrollRef.current;
            const singleSetWidth = container.scrollWidth / 4;
            // Start at the second set
            container.scrollLeft = singleSetWidth;

            // Auto-spin animation on load
            const start = container.scrollLeft;
            const target = start + singleSetWidth; // Spin one full set
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);

                container.scrollLeft = start + (singleSetWidth * ease);

                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };

            // Small delay to let layout settle
            setTimeout(() => requestAnimationFrame(animateScroll), 500);
        }
    }, [loopedCategories, categories.length]);

    return (
        <div className="py-4">
            <h3 className="px-4 mb-3 text-lg font-bold text-[var(--tg-theme-text-color)]">Shop by Category</h3>
            <div
                ref={scrollRef}
                onScroll={loopedCategories.length > categories.length ? handleScroll : undefined}
                className="flex gap-4 overflow-x-auto no-scrollbar px-4 snap-x"
            >
                {loopedCategories.map((cat, index) => {
                    if (cat === 'All') return null;

                    const Icon = CATEGORY_ICONS[cat] || Package;
                    const gradient = COLORS[index % COLORS.length];

                    // Use index in key to ensure uniqueness in loop
                    return (
                        <div
                            key={`${cat}-${index}`}
                            onClick={() => onSelect(cat)}
                            className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer snap-start active:opacity-80 transition-opacity flex-shrink-0"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md shadow-gray-200/50`}>
                                <Icon size={28} strokeWidth={2} />
                            </div>
                            <span className="text-xs font-semibold text-[var(--tg-theme-text-color)] text-center line-clamp-1">
                                {cat}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryColumnRow;
